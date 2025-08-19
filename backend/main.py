import os
import time
import traceback  # ADICIONADO - faltava esta importação
from typing import Dict, List
from docx import Document  # ADICIONADO - faltava esta importação
from backend.config import Config
from backend.document_reader import DocumentReader
from backend.ai_processor import AIProcessor
from backend.style_applier import StyleApplier
from backend.document_splitter import DocumentSplitter
from backend.file_manager import FileManager
from backend.document_sanitizer import DocumentSanitizer

class WordStylerProcessor:
    def __init__(self):
        Config.create_directories()
        
    def process_document(self, file_path: str, book_name: str, api_key: str, 
                         styles: List[Dict], removal_prompts: List[Dict]) -> Dict:
        """
        Processa o documento com a lógica de modificação direta.
        """
        start_time = time.time()
        
        try:
            print("\n" + "="*60)
            print("INICIANDO PROCESSAMENTO DO DOCUMENTO")
            print("="*60)
            
            # --- ETAPA 1: LEITURA E ANÁLISE ---
            print("\n[1/7] Lendo documento...")
            reader = DocumentReader(file_path)
            paragraphs_data = reader.read_paragraphs()
            doc_info = reader.get_document_info()
            print(f"✓ Documento lido com sucesso: {doc_info['total_paragraphs']} parágrafos, {doc_info['total_images']} imagens, {doc_info['total_tables']} tabelas.")

            # --- ETAPA 2: PROCESSAMENTO COM IA ---
            print("\n[2/7] Processando com IA...")
            ai_processor = AIProcessor(api_key)
            ai_results = ai_processor.process_document(paragraphs_data, styles, removal_prompts)
            marked_content = ai_results['marked_content']
            ai_stats = ai_results['stats']
            print(f"✓ Processamento com IA concluído: {ai_stats.get('marked', 0)} elementos marcados.")
            if ai_stats.get('unmarked', 0) > 0:
                print(f"  - ATENÇÃO: {ai_stats.get('unmarked', 0)} elementos não foram marcados pela IA.")
            if not marked_content:
                raise Exception("ERRO CRÍTICO: Nenhum elemento foi marcado pela IA!")

            # --- ETAPA 3: APLICAÇÃO DE ESTILOS ---
            print("\n[3/7] Aplicando estilos...")
            style_applier = StyleApplier(file_path)
            style_applier.register_styles(styles)
            styled_doc = style_applier.apply_styles(marked_content)
            
            # --- ETAPA 4: REMOÇÃO DE CONTEÚDO ---
            print("\n[4/7] Removendo conteúdo marcado...")
            clean_doc = style_applier.remove_marked_content(styled_doc, marked_content, removal_prompts)
            
            # --- ETAPA 5: DIVISÃO EM SIMULADOS (SE NECESSÁRIO) ---
            print("\n[5/7] Pulando divisão em simulados...")
            print("✓ Divisão desabilitada - documento único será gerado")

            # --- ETAPA 6: SANITIZAÇÃO DO DOCUMENTO ---
            print("\n[6/8] Sanitizando documento para importação no InDesign...")
            sanitizer = DocumentSanitizer(clean_doc)
            sanitized_doc = sanitizer.sanitize_local_formatting()
            
            # --- ETAPA 7: CRIAÇÃO DO DOCUMENTO FINAL ---
            print("\n[7/8] Criando documento final...")
            documents = {}
            documents['completo_pronto_para_indesign'] = sanitized_doc
            print("  ✓ Documento único e sanitizado criado")
            
            # --- ETAPA 8: SALVANDO ARQUIVOS ---
            print("\n[8/8] Salvando arquivos...")
            file_manager = FileManager(book_name)
            output_dir = file_manager.create_output_structure()
            saved_files = file_manager.save_documents(documents)
            
            print(f"✓ Arquivos salvos em: {output_dir}")
            
            zip_path = file_manager.create_zip_archive()
            print(f"✓ Arquivo ZIP criado: {os.path.basename(zip_path)}")
            
            processing_time = time.time() - start_time
            print("\n" + "="*60)
            print("PROCESSAMENTO CONCLUÍDO COM SUCESSO!")
            print(f"Tempo total: {int(processing_time // 60)}m {int(processing_time % 60)}s")
            
            return {
                'success': True,
                'processing_time': f"{int(processing_time // 60)}m {int(processing_time % 60)}s",
                'stats': {
                    'total_pages': doc_info.get('total_pages', 'N/A'),
                    'questions_processed': ai_stats.get('marked', 0),
                    'api_calls': ai_stats.get('api_calls', 0),
                    'estimated_cost_usd': ai_stats.get('estimated_cost_usd', 0)
                },
                'files': saved_files,
                'output_directory': output_dir,
                'zip_file': os.path.basename(zip_path),
            }
            
        except Exception as e:
            traceback.print_exc()
            processing_time = time.time() - start_time
            error_msg = str(e)
            stage = self._identify_error_stage(error_msg)
            suggestion = self._get_error_suggestion(error_msg)
            
            return {
                'success': False,
                'error': error_msg,
                'stage': stage,
                'suggestion': suggestion,
                'time': f"{int(processing_time // 60)}m {int(processing_time % 60)}s"
            }

    def _identify_error_stage(self, error_msg: str) -> str:
        error_msg = error_msg.lower()
        if 'lendo documento' in error_msg: return 'reading'
        if any(s in error_msg for s in ['api', 'openai']): return 'ai_processing'
        if 'estilo' in error_msg: return 'styling'
        if 'remoção' in error_msg: return 'removal'
        if 'simulado' in error_msg: return 'splitting'
        if any(s in error_msg for s in ['arquivo', 'salvar']): return 'saving'
        return 'unknown'

    def _get_error_suggestion(self, error_msg: str) -> str:
        error_lower = error_msg.lower()
        if 'api key' in error_lower or 'unauthorized' in error_lower:
            return 'Verifique se a API Key está correta e tem créditos disponíveis.'
        if 'rate limit' in error_lower:
            return 'Limite de requisições atingido. Aguarde alguns minutos e tente novamente.'
        if 'timeout' in error_lower:
            return 'Tempo limite excedido. Tente com um documento menor ou verifique sua conexão.'
        if 'marcação' in error_lower or 'nenhum elemento' in error_lower:
            return 'Verifique se os prompts de identificação estão corretos para o tipo de documento.'
        if 'arquivo' in error_lower:
            return 'Verifique se o arquivo .docx é válido e não está corrompido.'
        if 'memória' in error_lower or 'memory' in error_lower:
            return 'Documento muito grande. Tente processar em partes menores.'
        return 'Verifique os logs detalhados e tente novamente.'

# Classe auxiliar para monitorar progresso (opcional)
class ProgressMonitor:
    """Monitor de progresso para feedback em tempo real"""
    
    def __init__(self, callback=None):
        self.callback = callback
        self.current_step = ''
        self.current_progress = 0
        self.start_time = time.time()
    
    def update(self, step: str, progress: int, details: str = ''):
        """Atualiza o progresso"""
        self.current_step = step
        self.current_progress = progress
        
        if self.callback:
            self.callback({
                'step': step,
                'progress': progress,
                'details': details,
                'elapsed_time': time.time() - self.start_time
            })
        
        # Log no console
        print(f"[{progress:3d}%] {step}: {details}")
    
    def complete(self):
        """Marca como completo"""
        self.update('Processamento concluído!', 100)