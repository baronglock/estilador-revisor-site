"use client"

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  FileText, Upload, Loader2, Download, Plus, Trash2, Settings, 
  Play, Clock, AlertCircle, CheckCircle, Edit2, Save, X, 
  Image, Table, FolderOpen, ChevronDown, ChevronUp, Grip
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { DocumentProcessor, Style, Transition, RemovalPrompt, PostProcessingOptions } from '@/utils/documentProcessor'
import { saveAs } from 'file-saver'

// Default templates
const defaultTemplates = {
  'simulado_basico': {
    name: 'Simulado Básico',
    styles: [
      {
        id: 'titulo_simulado',
        name: 'Título do Simulado',
        wordStyle: 'Heading 1',
        marker: '[[TITULO_SIMULADO]]',
        prompt: 'Identifique títulos que contenham "Simulado" seguido de número (ex: Simulado 1, Simulado 2)',
        color: '#1e40af',
        order: 1,
        elementType: 'text' as const,
        formatting: {
          bold: true,
          fontSize: 16,
          alignment: 'center' as const
        }
      },
      {
        id: 'subtitulo_estudos',
        name: 'Subtítulo Estudos',
        wordStyle: 'Heading 2',
        marker: '[[SUBTITULO_ESTUDOS]]',
        prompt: 'Identifique subtítulos que contenham "Estudos" seguido de intervalo (ex: Estudos 1 a 10)',
        color: '#7c3aed',
        order: 2,
        elementType: 'text' as const,
        formatting: {
          bold: true,
          fontSize: 14,
          alignment: 'center' as const
        }
      },
      {
        id: 'enunciado',
        name: 'Enunciado',
        wordStyle: 'Question',
        marker: '[[ENUNCIADO]]',
        prompt: 'Identifique enunciados de questões que começam com número seguido de ponto ou parêntese',
        color: '#dc2626',
        order: 3,
        elementType: 'text' as const,
        formatting: {
          bold: true,
          fontSize: 12
        }
      },
      {
        id: 'alternativa',
        name: 'Alternativa',
        wordStyle: 'Alternative',
        marker: '[[ALTERNATIVA]]',
        prompt: 'Identifique alternativas que começam com letras (a), b), c), d), e) ou A), B), C), D), E)',
        color: '#ea580c',
        order: 4,
        elementType: 'text' as const,
        formatting: {
          fontSize: 11
        }
      },
      {
        id: 'gabarito',
        name: 'Gabarito',
        wordStyle: 'Answer',
        marker: '[[GABARITO]]',
        prompt: 'Identifique gabaritos: "Resposta:", "Gabarito:", textos com "D4 –", "H1 –", explicações após alternativas, orientações para professores',
        color: '#16a34a',
        order: 5,
        elementType: 'text' as const,
        formatting: {
          italic: true,
          fontSize: 10,
          color: '#16a34a'
        }
      }
    ],
    transitions: [
      { from: 0, to: 1, type: 'optional' as const, alternatives: [] },
      { from: 1, to: 2, type: 'optional' as const, alternatives: [] },
      { from: 2, to: 3, type: 'required' as const, alternatives: [] },
      { from: 3, to: 4, type: 'required' as const, alternatives: [] },
      { from: 4, to: 2, type: 'optional' as const, alternatives: [2] }
    ]
  }
};

import Navigation from '@/components/layout/Navigation'

export default function StylerPage() {
  const [file, setFile] = useState<File | null>(null)
  const [bookName, setBookName] = useState('')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Template management
  const [savedTemplates, setSavedTemplates] = useState<any>({})
  const [currentTemplate, setCurrentTemplate] = useState('simulado_basico')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [templateName, setTemplateName] = useState('')

  // Styles and transitions
  const [styles, setStyles] = useState<Style[]>(defaultTemplates.simulado_basico.styles)
  const [transitions, setTransitions] = useState<Transition[]>(defaultTemplates.simulado_basico.transitions)
  const [editingTransition, setEditingTransition] = useState<string | null>(null)

  // Removal prompts
  const [removalPrompts, setRemovalPrompts] = useState<RemovalPrompt[]>([
    {
      id: 'intro',
      name: 'Introdução/Capa',
      startMarker: '[[REMOVE_INTRO_START]]',
      endMarker: '[[REMOVE_INTRO_END]]',
      prompt: 'Marque SOMENTE a tag <capa> com START e SOMENTE a tag <fechar capa> com END. Não marque nada entre elas.'
    },
    {
      id: 'cartao',
      name: 'Cartão Resposta',
      startMarker: '[[REMOVE_CARTAO_START]]',
      endMarker: '[[REMOVE_CARTAO_END]]',
      prompt: 'Marque SOMENTE onde aparece literalmente "CARTÃO RESPOSTA" ou "CARTÃO-RESPOSTA" em maiúsculas com START e onde termina essa seção específica com END.'
    }
  ])

  // Editing states
  const [editingStyle, setEditingStyle] = useState<string | null>(null)
  const [editingRemoval, setEditingRemoval] = useState<string | null>(null)
  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const [dragOverItem, setDragOverItem] = useState<number | null>(null)
  
  // Post-processing options
  const [postProcessing, setPostProcessing] = useState<PostProcessingOptions>({
    removeQuestionNumbers: false,
    removeAlternativeLetters: false,
    customRemovals: []
  })
  const [customRemovalInput, setCustomRemovalInput] = useState('')

  // Load saved data
  useEffect(() => {
    const savedBookName = localStorage.getItem('wordStyler_bookName')
    if (savedBookName) setBookName(savedBookName)
    
    const saved = localStorage.getItem('wordStyler_templates')
    if (saved) {
      const templates = JSON.parse(saved)
      setSavedTemplates(templates)
    }
    
    const lastTemplate = localStorage.getItem('wordStyler_lastTemplate')
    if (lastTemplate && (defaultTemplates[lastTemplate as keyof typeof defaultTemplates] || (saved && JSON.parse(saved)[lastTemplate]))) {
      loadTemplate(lastTemplate)
    }
  }, [])

  // Save changes automatically
  useEffect(() => {
    if (bookName) localStorage.setItem('wordStyler_bookName', bookName)
  }, [bookName])

  const loadTemplate = (templateId: string) => {
    let template
    if (defaultTemplates[templateId as keyof typeof defaultTemplates]) {
      template = defaultTemplates[templateId as keyof typeof defaultTemplates]
    } else if (savedTemplates[templateId]) {
      template = savedTemplates[templateId]
    } else {
      return
    }
    
    setStyles(JSON.parse(JSON.stringify(template.styles)))
    setTransitions(JSON.parse(JSON.stringify(template.transitions || [])))
    setCurrentTemplate(templateId)
    localStorage.setItem('wordStyler_lastTemplate', templateId)
  }

  const saveTemplate = () => {
    if (!templateName.trim()) return
    
    const templateId = templateName.toLowerCase().replace(/\s+/g, '_')
    const newTemplate = {
      name: templateName,
      styles: JSON.parse(JSON.stringify(styles)),
      transitions: JSON.parse(JSON.stringify(transitions))
    }
    
    const updated = { ...savedTemplates, [templateId]: newTemplate }
    setSavedTemplates(updated)
    localStorage.setItem('wordStyler_templates', JSON.stringify(updated))
    
    setCurrentTemplate(templateId)
    setShowSaveDialog(false)
    setTemplateName('')
    
    toast({
      title: "Template salvo",
      description: `Template "${templateName}" foi salvo com sucesso`,
    })
  }

  const addStyle = () => {
    const newStyle: Style = {
      id: `style_${Date.now()}`,
      name: 'Novo Estilo',
      wordStyle: 'Normal',
      marker: `[[NOVO_${Date.now()}]]`,
      prompt: 'Defina o prompt para identificar este estilo',
      color: '#6b7280',
      order: styles.length + 1,
      elementType: 'text',
      hasResidue: false,
      allowInlineImages: false,
      formatting: {
        bold: false,
        italic: false,
        underline: false,
        fontSize: 12,
        alignment: 'left'
      }
    }
    setStyles([...styles, newStyle])
    setEditingStyle(newStyle.id)
  }

  const updateStyle = (id: string, field: string, value: any) => {
    setStyles(styles.map(style => {
      if (style.id !== id) return style
      
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        return {
          ...style,
          [parent]: {
            ...(style[parent as keyof Style] as any) || {},
            [child]: value
          }
        }
      }
      
      return { ...style, [field]: value }
    }))
  }

  const deleteStyle = (id: string) => {
    const updatedStyles = styles.filter(style => style.id !== id)
    updatedStyles.forEach((style, index) => {
      style.order = index + 1
    })
    setStyles(updatedStyles)
    
    // Remove related transitions
    setTransitions(transitions.filter(t => 
      t.from < updatedStyles.length && t.to < updatedStyles.length
    ))
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverItem(index)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverItem(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedItem === null) return

    const draggedStyle = styles[draggedItem]
    const newStyles = [...styles]
    
    newStyles.splice(draggedItem, 1)
    newStyles.splice(dropIndex, 0, draggedStyle)
    
    newStyles.forEach((style, index) => {
      style.order = index + 1
    })
    
    setStyles(newStyles)
    setDraggedItem(null)
    setDragOverItem(null)
  }

  // Transition management
  const getTransition = (fromIndex: number, toIndex: number) => {
    return transitions.find(t => t.from === fromIndex && t.to === toIndex)
  }

  const updateTransition = (fromIndex: number, toIndex: number, type: 'none' | 'required' | 'optional', alternatives: number[] = []) => {
    const existing = transitions.findIndex(t => t.from === fromIndex && t.to === toIndex)
    
    if (type === 'none') {
      if (existing !== -1) {
        setTransitions(transitions.filter((_, i) => i !== existing))
      }
    } else {
      const newTransition = { from: fromIndex, to: toIndex, type, alternatives }
      if (existing !== -1) {
        setTransitions(transitions.map((t, i) => i === existing ? newTransition : t))
      } else {
        setTransitions([...transitions, newTransition])
      }
    }
  }

  // Removal prompt management
  const addRemovalPrompt = () => {
    const newRemoval: RemovalPrompt = {
      id: `removal_${Date.now()}`,
      name: 'Nova Remoção',
      startMarker: `[[REMOVE_${Date.now()}_START]]`,
      endMarker: `[[REMOVE_${Date.now()}_END]]`,
      prompt: 'Defina o prompt para identificar o que remover'
    }
    setRemovalPrompts([...removalPrompts, newRemoval])
    setEditingRemoval(newRemoval.id)
  }

  const updateRemovalPrompt = (id: string, field: keyof RemovalPrompt, value: string) => {
    setRemovalPrompts(removalPrompts.map(removal => 
      removal.id === id ? { ...removal, [field]: value } : removal
    ))
  }

  const deleteRemovalPrompt = (id: string) => {
    setRemovalPrompts(removalPrompts.filter(removal => removal.id !== id))
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const uploadedFile = acceptedFiles[0]
      if (uploadedFile.name.endsWith('.docx')) {
        setFile(uploadedFile)
        setError(null)
        toast({
          title: "Arquivo carregado",
          description: `${uploadedFile.name} pronto para processar`,
        })
      } else {
        setError('Por favor, selecione um arquivo .docx válido')
      }
    }
  }, [toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  })

  const handleProcess = async () => {
    if (!file || !bookName) {
      setError('Por favor, preencha o nome do livro e selecione um arquivo')
      return
    }

    setProcessing(true)
    setError(null)
    setProgress(0)
    setProgressMessage('Iniciando processamento...')
    setResults(null)

    try {
      const processor = new DocumentProcessor()
      const result = await processor.processDocument(
        file,
        bookName,
        styles,
        transitions,
        removalPrompts,
        postProcessing,
        (progress, message) => {
          setProgress(progress)
          setProgressMessage(message)
        }
      )

      if (result.success) {
        setResults(result)
        toast({
          title: "Processamento concluído!",
          description: "Seus documentos foram processados com sucesso",
        })
      } else {
        throw new Error(result.error || 'Erro no processamento')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      toast({
        title: "Erro no processamento",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  const downloadFile = (blob: Blob, filename: string) => {
    saveAs(blob, filename)
  }

  const downloadAllFiles = () => {
    if (results?.zipBlob) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      saveAs(results.zipBlob, `${bookName}_${timestamp}.zip`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-20 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Processador de Estilos Word com IA
          </h1>
          <div className="flex items-center gap-4">
            <select
              value={currentTemplate}
              onChange={(e) => loadTemplate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <optgroup label="Templates Padrão">
                {Object.entries(defaultTemplates).map(([id, template]) => (
                  <option key={id} value={id}>{template.name}</option>
                ))}
              </optgroup>
              {Object.keys(savedTemplates).length > 0 && (
                <optgroup label="Meus Templates">
                  {Object.entries(savedTemplates).map(([id, template]: [string, any]) => (
                    <option key={id} value={id}>{template.name}</option>
                  ))}
                </optgroup>
              )}
            </select>
            <Button
              onClick={() => setShowSaveDialog(true)}
              size="sm"
              variant="outline"
              title="Salvar como novo template"
            >
              <Save className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Save Template Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Salvar Template</h3>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Nome do template"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button
                  onClick={() => {
                    setShowSaveDialog(false)
                    setTemplateName('')
                  }}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={saveTemplate}
                  disabled={!templateName.trim()}
                >
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload and Basic Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arquivo Word (.docx)
                  </label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    {file ? (
                      <div>
                        <p className="text-green-600 font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500 mt-1">Clique ou arraste para substituir</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-600">Arraste um arquivo .docx aqui ou clique para selecionar</p>
                        <p className="text-sm text-gray-500 mt-1">Apenas arquivos Word (.docx)</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Livro
                  </label>
                  <input
                    type="text"
                    value={bookName}
                    onChange={(e) => setBookName(e.target.value)}
                    placeholder="Ex: Simulado_Matematica_2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Style Manager */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Estilos e Sequência
                </h2>
                <Button
                  onClick={addStyle}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>

              <div className="space-y-3">
                {styles.map((style, index) => (
                  <div key={style.id}>
                    <div
                      draggable={editingStyle !== style.id}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`border rounded-lg p-4 transition-all ${
                        draggedItem === index ? 'opacity-50' : ''
                      } ${dragOverItem === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      style={{ borderLeftWidth: '4px', borderLeftColor: style.color }}
                    >
                      {editingStyle === style.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={style.name}
                              onChange={(e) => updateStyle(style.id, 'name', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Nome do estilo"
                            />
                            <input
                              type="text"
                              value={style.wordStyle}
                              onChange={(e) => updateStyle(style.id, 'wordStyle', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Estilo no Word"
                            />
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <select
                              value={style.elementType}
                              onChange={(e) => updateStyle(style.id, 'elementType', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="text">Texto</option>
                              <option value="image">Imagem</option>
                              <option value="table">Tabela</option>
                            </select>
                            
                            {style.elementType === 'image' && (
                              <label className="flex items-center gap-1 text-sm">
                                <input
                                  type="checkbox"
                                  checked={style.hasResidue || false}
                                  onChange={(e) => updateStyle(style.id, 'hasResidue', e.target.checked)}
                                  className="rounded"
                                />
                                Tem resíduo de texto
                              </label>
                            )}
                            
                            {style.elementType === 'text' && (
                              <label className="flex items-center gap-1 text-sm">
                                <input
                                  type="checkbox"
                                  checked={style.allowInlineImages || false}
                                  onChange={(e) => updateStyle(style.id, 'allowInlineImages', e.target.checked)}
                                  className="rounded"
                                />
                                Permite imagens inline
                              </label>
                            )}
                          </div>
                          
                          {style.elementType === 'text' && (
                            <>
                              <textarea
                                value={style.prompt}
                                onChange={(e) => updateStyle(style.id, 'prompt', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Prompt para identificação"
                              />
                              
                              <div className="grid grid-cols-3 gap-2">
                                <label className="flex items-center gap-1 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={style.formatting?.bold || false}
                                    onChange={(e) => updateStyle(style.id, 'formatting.bold', e.target.checked)}
                                  />
                                  Negrito
                                </label>
                                <label className="flex items-center gap-1 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={style.formatting?.italic || false}
                                    onChange={(e) => updateStyle(style.id, 'formatting.italic', e.target.checked)}
                                  />
                                  Itálico
                                </label>
                                <label className="flex items-center gap-1 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={style.formatting?.underline || false}
                                    onChange={(e) => updateStyle(style.id, 'formatting.underline', e.target.checked)}
                                  />
                                  Sublinhado
                                </label>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="text-xs text-gray-600">Tamanho</label>
                                  <input
                                    type="number"
                                    value={style.formatting?.fontSize || 12}
                                    onChange={(e) => updateStyle(style.id, 'formatting.fontSize', parseInt(e.target.value))}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="8"
                                    max="72"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">Alinhamento</label>
                                  <select
                                    value={style.formatting?.alignment || 'left'}
                                    onChange={(e) => updateStyle(style.id, 'formatting.alignment', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="left">Esquerda</option>
                                    <option value="center">Centro</option>
                                    <option value="right">Direita</option>
                                    <option value="justify">Justificado</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">Cor</label>
                                  <input
                                    type="color"
                                    value={style.color}
                                    onChange={(e) => updateStyle(style.id, 'color', e.target.value)}
                                    className="w-full h-8 rounded cursor-pointer"
                                  />
                                </div>
                              </div>
                            </>
                          )}
                          
                          <input
                            type="text"
                            value={style.marker}
                            onChange={(e) => updateStyle(style.id, 'marker', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Marcador"
                          />
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setEditingStyle(null)}
                              size="sm"
                              variant="outline"
                            >
                              <Save className="w-4 h-4 mr-1" />
                              Salvar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Grip className="w-4 h-4 text-gray-400 cursor-move" />
                              <span className="text-xs bg-gray-200 px-2 py-1 rounded">{index + 1}º</span>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                  {style.name}
                                  {style.elementType === 'image' && <Image className="w-4 h-4 text-gray-500" />}
                                  {style.elementType === 'table' && <Table className="w-4 h-4 text-gray-500" />}
                                  {style.allowInlineImages && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                      Permite imagens
                                    </span>
                                  )}
                                </h3>
                                <p className="text-sm text-gray-500">Word: {style.wordStyle}</p>
                                <p className="text-xs text-gray-400 mt-1">Marcador: {style.marker}</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                onClick={() => setEditingStyle(style.id)}
                                size="sm"
                                variant="ghost"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => deleteStyle(style.id)}
                                size="sm"
                                variant="ghost"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                          {style.elementType === 'text' && (
                            <p className="text-sm text-gray-600 mt-2">{style.prompt}</p>
                          )}
                        </>
                      )}
                    </div>
                    
                    {/* Transition between styles */}
                    {index < styles.length - 1 && (
                      <div className="flex items-center justify-center py-2">
                        {editingTransition === `${index}-${index + 1}` ? (
                          <div className="flex flex-col items-center gap-2 bg-gray-100 rounded-lg p-3 w-full">
                            <select
                              value={getTransition(index, index + 1)?.type || 'none'}
                              onChange={(e) => {
                                updateTransition(index, index + 1, e.target.value as any)
                                if (e.target.value !== 'optional') {
                                  setEditingTransition(null)
                                }
                              }}
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="none">Sem relação</option>
                              <option value="required">Obrigatório</option>
                              <option value="optional">Variável</option>
                            </select>
                            
                            {getTransition(index, index + 1)?.type === 'optional' && (
                              <div className="w-full">
                                <p className="text-xs text-gray-600 mb-2">Pode ir para:</p>
                                <div className="grid grid-cols-2 gap-1">
                                  {styles.map((s, i) => {
                                    if (i === index) return null
                                    
                                    const currentAlternatives = getTransition(index, index + 1)?.alternatives || []
                                    const isChecked = i === index + 1 || currentAlternatives.includes(i)
                                    
                                    return (
                                      <label key={i} className="flex items-center gap-1 text-xs p-1 hover:bg-gray-200 rounded">
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          disabled={i === index + 1}
                                          onChange={(e) => {
                                            let newAlternatives = [...currentAlternatives]
                                            if (e.target.checked && !newAlternatives.includes(i)) {
                                              newAlternatives.push(i)
                                            } else if (!e.target.checked) {
                                              newAlternatives = newAlternatives.filter(alt => alt !== i)
                                            }
                                            updateTransition(index, index + 1, 'optional', newAlternatives)
                                          }}
                                        />
                                        <span className={i === index + 1 ? 'font-semibold' : ''}>{s.name}</span>
                                      </label>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                            
                            <Button
                              onClick={() => setEditingTransition(null)}
                              size="sm"
                              variant="outline"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingTransition(`${index}-${index + 1}`)}
                            className={`px-3 py-1 rounded-full text-xs transition-colors ${
                              getTransition(index, index + 1)?.type === 'required' 
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : getTransition(index, index + 1)?.type === 'optional'
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <ChevronDown className="w-3 h-3 inline mr-1" />
                            {getTransition(index, index + 1)?.type === 'required' 
                              ? 'Obrigatório'
                              : getTransition(index, index + 1)?.type === 'optional'
                              ? 'Variável'
                              : 'Configurar'
                            }
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Post-Processing Options */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Pós-Processamento (Opcional)
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Remover elementos após a aplicação de estilos, sem alterar a formatação:
              </p>
              
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={postProcessing.removeQuestionNumbers}
                    onChange={(e) => setPostProcessing({
                      ...postProcessing,
                      removeQuestionNumbers: e.target.checked
                    })}
                    className="rounded"
                  />
                  <span className="text-sm">Remover numeração das questões (1., 2., Q1:, etc.)</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={postProcessing.removeAlternativeLetters}
                    onChange={(e) => setPostProcessing({
                      ...postProcessing,
                      removeAlternativeLetters: e.target.checked
                    })}
                    className="rounded"
                  />
                  <span className="text-sm">Remover letras das alternativas (a), b), A., etc.)</span>
                </label>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remoções personalizadas (regex ou texto):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customRemovalInput}
                      onChange={(e) => setCustomRemovalInput(e.target.value)}
                      placeholder="Ex: (ENEM)|Questão \d+"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && customRemovalInput.trim()) {
                          setPostProcessing({
                            ...postProcessing,
                            customRemovals: [...(postProcessing.customRemovals || []), customRemovalInput.trim()]
                          })
                          setCustomRemovalInput('')
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        if (customRemovalInput.trim()) {
                          setPostProcessing({
                            ...postProcessing,
                            customRemovals: [...(postProcessing.customRemovals || []), customRemovalInput.trim()]
                          })
                          setCustomRemovalInput('')
                        }
                      }}
                      size="sm"
                      disabled={!customRemovalInput.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {postProcessing.customRemovals && postProcessing.customRemovals.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {postProcessing.customRemovals.map((removal, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                          <code className="text-xs">{removal}</code>
                          <Button
                            onClick={() => {
                              setPostProcessing({
                                ...postProcessing,
                                customRemovals: postProcessing.customRemovals?.filter((_, i) => i !== index)
                              })
                            }}
                            size="sm"
                            variant="ghost"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Removal Manager */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Conteúdo para Remover (Durante Processamento)
                </h2>
                <Button
                  onClick={addRemovalPrompt}
                  size="sm"
                  variant="destructive"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>

              <div className="space-y-3">
                {removalPrompts.map((removal) => (
                  <div key={removal.id} className="border border-gray-200 rounded-lg p-4">
                    {editingRemoval === removal.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={removal.name}
                          onChange={(e) => updateRemovalPrompt(removal.id, 'name', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nome da remoção"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={removal.startMarker}
                            onChange={(e) => updateRemovalPrompt(removal.id, 'startMarker', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Marcador de início"
                          />
                          <input
                            type="text"
                            value={removal.endMarker}
                            onChange={(e) => updateRemovalPrompt(removal.id, 'endMarker', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Marcador de fim"
                          />
                        </div>
                        <textarea
                          value={removal.prompt}
                          onChange={(e) => updateRemovalPrompt(removal.id, 'prompt', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Prompt para identificação"
                        />
                        <Button
                          onClick={() => setEditingRemoval(null)}
                          size="sm"
                          variant="outline"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Salvar
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{removal.name}</h3>
                            <p className="text-xs text-gray-400 mt-1">
                              {removal.startMarker} ... {removal.endMarker}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              onClick={() => setEditingRemoval(removal.id)}
                              size="sm"
                              variant="ghost"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => deleteRemovalPrompt(removal.id)}
                              size="sm"
                              variant="ghost"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{removal.prompt}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Status and Results */}
          <div className="space-y-6">
            {/* Process Button */}
            <div className="bg-white rounded-lg shadow p-6">
              <Button
                onClick={handleProcess}
                disabled={processing || !file || !bookName}
                className="w-full"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Processar Documento
                  </>
                )}
              </Button>
            </div>

            {/* Processing Status */}
            {processing && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Status
                </h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">{progressMessage}</p>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-gray-500">{progress}% concluído</p>
                </div>
              </div>
            )}

            {/* Error Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Results */}
            {results && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Processamento Concluído
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Tempo total</p>
                      <p className="font-semibold">{results.processingTime}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Páginas</p>
                      <p className="font-semibold">{results.stats?.totalPages || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Parágrafos</p>
                      <p className="font-semibold">{results.stats?.totalParagraphs || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Questões</p>
                      <p className="font-semibold">{results.stats?.questionsProcessed || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Chamadas API</p>
                      <p className="font-semibold">{results.stats?.apiCalls || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Custo estimado</p>
                      <p className="font-semibold">${results.stats?.estimatedCostUSD?.toFixed(3) || '0.000'}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Arquivos Gerados</h4>
                    <div className="space-y-2">
                      {results.files?.map((file: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{file.size}</span>
                            <Button
                              onClick={() => {
                                if (file.name.includes('indesign') && results.documentBlob) {
                                  downloadFile(results.documentBlob, file.name)
                                } else if (results.documentBlob) {
                                  downloadFile(results.documentBlob, file.name)
                                }
                              }}
                              size="sm"
                              variant="ghost"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={downloadAllFiles}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Baixar Todos os Arquivos (ZIP)
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}