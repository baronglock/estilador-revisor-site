import mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, ImageRun } from 'docx';
import JSZip from 'jszip';

export interface StyleFormatting {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  color?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
}

export interface Style {
  id: string;
  name: string;
  wordStyle: string;
  marker: string;
  prompt: string;
  color: string;
  order: number;
  elementType: 'text' | 'image' | 'table';
  hasResidue?: boolean;
  allowInlineImages?: boolean;
  formatting?: StyleFormatting;
}

export interface Transition {
  from: number;
  to: number;
  type: 'none' | 'required' | 'optional';
  alternatives: number[];
}

export interface RemovalPrompt {
  id: string;
  name: string;
  startMarker: string;
  endMarker: string;
  prompt: string;
}

export interface PostProcessingOptions {
  removeQuestionNumbers?: boolean;
  removeAlternativeLetters?: boolean;
  customRemovals?: string[];
}

export interface ProcessingResult {
  success: boolean;
  documentBlob?: Blob;
  zipBlob?: Blob;
  stats?: {
    totalPages: number;
    totalParagraphs: number;
    questionsProcessed: number;
    apiCalls: number;
    estimatedCostUSD: number;
  };
  files?: Array<{name: string; size: string; path: string}>;
  error?: string;
  processingTime?: string;
}

interface ProcessedParagraph {
  text: string;
  style: string | null;
  remove: boolean;
  type: 'text' | 'image' | 'table';
  imageData?: string;
  tableData?: any[][];
}

export class DocumentProcessor {
  constructor() {
    // API key is now handled server-side
  }

  async processDocument(
    file: File,
    bookName: string,
    styles: Style[],
    transitions: Transition[],
    removalPrompts: RemovalPrompt[],
    postProcessing?: PostProcessingOptions,
    onProgress?: (progress: number, message: string) => void
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    
    try {
      onProgress?.(5, 'Lendo documento...');
      
      // Read document content
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;
      
      // Extract paragraphs
      const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
      
      onProgress?.(20, 'Analisando estrutura do documento...');
      
      // OPTIMIZED BATCH PROCESSING - Fix redundancy issue
      const processedParagraphs = await this.processParagraphsOptimized(
        paragraphs,
        styles,
        removalPrompts,
        onProgress
      );
      
      // Apply post-processing if requested
      if (postProcessing) {
        onProgress?.(65, 'Aplicando pós-processamento...');
        this.applyPostProcessing(processedParagraphs, postProcessing);
      }
      
      onProgress?.(70, 'Aplicando estilos e formatação...');
      
      // Create styled document
      const doc = this.createStyledDocument(processedParagraphs, styles, bookName);
      
      onProgress?.(85, 'Criando arquivo sanitizado para InDesign...');
      
      // Create sanitized version for InDesign with consistent style naming
      const sanitizedDoc = this.createSanitizedDocumentForInDesign(processedParagraphs, styles, bookName);
      
      onProgress?.(90, 'Gerando arquivos finais...');
      
      // Generate blobs
      const [mainBlob, sanitizedBlob] = await Promise.all([
        Packer.toBlob(doc),
        Packer.toBlob(sanitizedDoc)
      ]);
      
      // Create ZIP with all files
      const zip = new JSZip();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const folderName = `${bookName}_${timestamp}`;
      
      zip.folder(folderName)?.file('completo.docx', mainBlob);
      zip.folder(folderName)?.file('completo_pronto_para_indesign.docx', sanitizedBlob);
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      const processingTime = Math.round((Date.now() - startTime) / 1000);
      
      onProgress?.(100, 'Processamento concluído!');
      
      return {
        success: true,
        documentBlob: mainBlob,
        zipBlob,
        stats: {
          totalPages: Math.ceil(paragraphs.length / 30),
          totalParagraphs: paragraphs.length,
          questionsProcessed: processedParagraphs.filter(p => p.style === 'enunciado' || p.style === 'questao').length,
          apiCalls: Math.ceil(paragraphs.length / 25), // Balanced batch size for accuracy
          estimatedCostUSD: Math.ceil(paragraphs.length / 25) * 0.002
        },
        files: [
          { name: 'completo.docx', size: this.formatFileSize(mainBlob.size), path: 'completo.docx' },
          { name: 'completo_pronto_para_indesign.docx', size: this.formatFileSize(sanitizedBlob.size), path: 'completo_pronto_para_indesign.docx' }
        ],
        processingTime: `${Math.floor(processingTime / 60)}m ${processingTime % 60}s`
      };
    } catch (error) {
      console.error('Erro no processamento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido no processamento'
      };
    }
  }

  private async processParagraphsOptimized(
    paragraphs: string[],
    styles: Style[],
    removalPrompts: RemovalPrompt[],
    onProgress?: (progress: number, message: string) => void
  ): Promise<ProcessedParagraph[]> {
    const processedParagraphs: ProcessedParagraph[] = [];
    let apiCalls = 0;
    
    // OPTIMIZED: Balance between context and accuracy
    // 20-25 paragraphs gives enough context without overwhelming the AI
    const batchSize = 25; // Optimal for accuracy with context
    
    for (let i = 0; i < paragraphs.length; i += batchSize) {
      const batch = paragraphs.slice(i, Math.min(i + batchSize, paragraphs.length));
      
      // Add some context from previous batch for continuity (last 3 paragraphs)
      let contextBatch = batch;
      if (i > 0 && processedParagraphs.length >= 3) {
        const previousContext = paragraphs.slice(Math.max(0, i - 3), i);
        contextBatch = [...previousContext, ...batch];
      }
      
      // Build context-aware prompt
      const prompt = this.buildOptimizedPrompt(contextBatch, styles, removalPrompts, i, paragraphs.length, i > 0 ? 3 : 0);
      
      try {
        // Call our backend API instead of OpenAI directly
        const systemPrompt = `Você é um assistente especializado em formatar documentos educacionais.
Analise o texto e marque CADA parágrafo com tags XML apropriadas.
IMPORTANTE: 
- Marque TODOS os parágrafos, mesmo que não correspondam a nenhum estilo específico (use <normal> para texto comum)
- Mantenha a ordem exata dos parágrafos
- Para remoções, use as tags de início e fim especificadas`;

        const apiResponse = await fetch('/api/process-document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paragraphs: contextBatch,
            systemPrompt: systemPrompt + '\n\n' + prompt,
            userId: 'current-user' // This would come from auth context in production
          })
        });

        if (!apiResponse.ok) {
          const error = await apiResponse.json();
          throw new Error(error.error || 'Failed to process document');
        }

        const { processedParagraphs, creditsRemaining, plan } = await apiResponse.json();
        
        apiCalls++;
        const markedContent = processedParagraphs.join('\n\n');
        
        // Parse marked content
        const parsed = this.parseMarkedContent(markedContent, styles);
        processedParagraphs.push(...parsed);
        
        const progress = 20 + ((i + batchSize) / paragraphs.length) * 50;
        onProgress?.(Math.min(progress, 70), `Processando ${Math.min(i + batchSize, paragraphs.length)}/${paragraphs.length} parágrafos...`);
        
      } catch (error) {
        console.error('Erro ao processar batch:', error);
        // Add unprocessed paragraphs as normal text
        batch.forEach(text => {
          processedParagraphs.push({ text, style: 'normal', remove: false, type: 'text' });
        });
      }
    }
    
    return processedParagraphs;
  }

  private buildOptimizedPrompt(batch: string[], styles: Style[], removalPrompts: RemovalPrompt[], startIndex: number, totalParagraphs: number, contextOffset: number = 0): string {
    const actualStart = startIndex - contextOffset + 1;
    const actualEnd = Math.min(startIndex + batch.length - contextOffset, totalParagraphs);
    let prompt = `Contexto: Analisando parágrafos ${actualStart} a ${actualEnd} de um total de ${totalParagraphs}.\n`;
    if (contextOffset > 0) {
      prompt += `Nota: Os primeiros ${contextOffset} parágrafos são contexto da batch anterior (já processados).\n`;
    }
    prompt += '\n';
    
    prompt += `ESTILOS DISPONÍVEIS:\n`;
    styles.forEach(style => {
      if (style.elementType === 'text') {
        prompt += `<${style.marker.replace(/[\[\]]/g, '')}> - ${style.prompt}\n`;
      }
    });
    
    prompt += `\nREMOÇÕES:\n`;
    removalPrompts.forEach(removal => {
      prompt += `${removal.startMarker} e ${removal.endMarker} - ${removal.prompt}\n`;
    });
    
    prompt += `\nTEXTO PARA ANALISAR:\n`;
    batch.forEach((para, index) => {
      prompt += `[P${startIndex + index + 1}] ${para}\n`;
    });
    
    prompt += `\nRETORNE o texto marcado mantendo a numeração [P#] e aplicando as tags apropriadas.
Exemplo de saída:
[P1] <TITULO_SIMULADO>Simulado 1</TITULO_SIMULADO>
[P2] <normal>Texto comum sem estilo específico</normal>
[P3] <ENUNCIADO>1. Qual é a capital do Brasil?</ENUNCIADO>
[P4] <ALTERNATIVA>a) São Paulo</ALTERNATIVA>`;
    
    return prompt;
  }

  private parseMarkedContent(content: string, styles: Style[]): ProcessedParagraph[] {
    const parsed: ProcessedParagraph[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      // Extract paragraph number if present
      const paraMatch = line.match(/\[P\d+\]/);
      const cleanLine = paraMatch ? line.replace(paraMatch[0], '').trim() : line.trim();
      
      let matched = false;
      
      // Check for removal markers
      if (cleanLine.includes('REMOVE') && (cleanLine.includes('START') || cleanLine.includes('END'))) {
        parsed.push({ 
          text: this.extractText(cleanLine), 
          style: null, 
          remove: true, 
          type: 'text' 
        });
        matched = true;
      } else {
        // Check for style markers
        for (const style of styles) {
          const marker = style.marker.replace(/[\[\]]/g, '');
          const tagRegex = new RegExp(`<${marker}>(.*?)</${marker}>`, 'i');
          const match = cleanLine.match(tagRegex);
          
          if (match) {
            parsed.push({ 
              text: match[1].trim(), 
              style: style.id, 
              remove: false, 
              type: style.elementType 
            });
            matched = true;
            break;
          }
        }
      }
      
      // If no match, check for normal tag or add as normal text
      if (!matched) {
        const normalMatch = cleanLine.match(/<normal>(.*?)<\/normal>/i);
        if (normalMatch) {
          parsed.push({ 
            text: normalMatch[1].trim(), 
            style: 'normal', 
            remove: false, 
            type: 'text' 
          });
        } else {
          const cleanText = this.extractText(cleanLine);
          if (cleanText) {
            parsed.push({ 
              text: cleanText, 
              style: 'normal', 
              remove: false, 
              type: 'text' 
            });
          }
        }
      }
    }
    
    return parsed;
  }

  private extractText(line: string): string {
    return line.replace(/<[^>]*>/g, '').replace(/\[P\d+\]/, '').trim();
  }

  private createStyledDocument(processedParagraphs: ProcessedParagraph[], styles: Style[], bookName: string): Document {
    const children: Paragraph[] = [];
    
    // Add title
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: bookName,
            bold: true,
            size: 32,
            color: '1e40af'
          })
        ],
        spacing: { after: 400 }
      })
    );
    
    // Process paragraphs
    for (const para of processedParagraphs) {
      if (para.remove) continue;
      
      const style = styles.find(s => s.id === para.style);
      const formatting = style?.formatting || {};
      
      let alignment = AlignmentType.LEFT;
      if (formatting.alignment === 'center') alignment = AlignmentType.CENTER;
      if (formatting.alignment === 'right') alignment = AlignmentType.RIGHT;
      if (formatting.alignment === 'justify') alignment = AlignmentType.JUSTIFIED;
      
      const isHeading = style?.wordStyle?.toLowerCase().includes('heading');
      
      children.push(
        new Paragraph({
          alignment,
          heading: isHeading ? HeadingLevel.HEADING_2 : undefined,
          children: [
            new TextRun({
              text: para.text,
              bold: formatting.bold || false,
              italics: formatting.italic || false,
              underline: formatting.underline ? {} : undefined,
              size: formatting.fontSize ? formatting.fontSize * 2 : 24,
              color: formatting.color?.replace('#', '') || '000000'
            })
          ],
          spacing: { after: 200 }
        })
      );
    }
    
    return new Document({
      sections: [{
        properties: {},
        children
      }]
    });
  }

  private applyPostProcessing(paragraphs: ProcessedParagraph[], options: PostProcessingOptions) {
    paragraphs.forEach(para => {
      if (para.remove) return;
      
      let text = para.text;
      
      // Remove question numbers if requested
      if (options.removeQuestionNumbers && (para.style === 'enunciado' || para.style === 'questao')) {
        // Remove patterns like "1.", "1)", "01.", "Q1:", etc.
        text = text.replace(/^(\d+[\.\)]\s*|Q\d+:?\s*|\d+\s*-\s*)/i, '');
      }
      
      // Remove alternative letters if requested
      if (options.removeAlternativeLetters && para.style === 'alternativa') {
        // Remove patterns like "a)", "A.", "(a)", "[A]", etc.
        text = text.replace(/^(\(?[a-eA-E][\.\)]\)?|\[[a-eA-E]\])\s*/i, '');
      }
      
      // Apply custom removals
      if (options.customRemovals && options.customRemovals.length > 0) {
        options.customRemovals.forEach(pattern => {
          try {
            const regex = new RegExp(pattern, 'gi');
            text = text.replace(regex, '');
          } catch (e) {
            // If regex is invalid, try literal replacement
            text = text.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '');
          }
        });
      }
      
      para.text = text.trim();
    });
  }

  private createSanitizedDocumentForInDesign(processedParagraphs: ProcessedParagraph[], styles: Style[], bookName: string): Document {
    const children: Paragraph[] = [];
    
    // Create a style map to ensure consistent naming for InDesign
    const styleMap = new Map<string, string>();
    styles.forEach(style => {
      // Use the Word style name for InDesign consistency
      // This prevents duplicate styles with same names
      styleMap.set(style.id, style.wordStyle);
    });
    
    // Add document header with style definitions for InDesign
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `[INDESIGN_STYLES_START]`,
            size: 20
          })
        ]
      })
    );
    
    // List all styles for InDesign to recognize
    styles.forEach(style => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `[STYLE_DEF] ${style.wordStyle} = ${style.marker}`,
              size: 20
            })
          ]
        })
      );
    });
    
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `[INDESIGN_STYLES_END]`,
            size: 20
          })
        ],
        spacing: { after: 400 }
      })
    );
    
    // Process paragraphs with consistent style naming
    for (const para of processedParagraphs) {
      if (para.remove) continue;
      
      const style = styles.find(s => s.id === para.style);
      const styleName = styleMap.get(para.style || '') || 'Normal';
      
      // Use consistent style naming for InDesign
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `[${styleName}] ${para.text}`,
              size: 24
            })
          ],
          spacing: { after: 120 }
        })
      );
    }
    
    return new Document({
      sections: [{
        properties: {},
        children
      }]
    });
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}