"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Edit, Upload, Settings, Play, Download, Info,
  CheckCircle, AlertCircle, Loader2, FileText, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Navigation from '@/components/layout/Navigation'
import { useDropzone } from 'react-dropzone'

export default function RevisionPage() {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<any>(null)
  
  // Revision settings
  const [settings, setSettings] = useState({
    mode: 'complete', // 'complete', 'grammar', 'style', 'clarity'
    language: 'pt-BR',
    tone: 'formal', // 'formal', 'informal', 'academic', 'creative'
    improvements: {
      grammar: true,
      spelling: true,
      punctuation: true,
      clarity: true,
      conciseness: true,
      vocabulary: true,
      structure: true,
      consistency: true
    }
  })

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  })

  const handleProcess = async () => {
    if (!file) return

    setProcessing(true)
    setProgress(0)

    // INTEGRATION POINT: Add your revision code here
    // This is where you would integrate your existing revision logic
    
    // Simulate processing for now
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setProcessing(false)
          setResults({
            originalWords: 1523,
            revisedWords: 1489,
            corrections: 47,
            improvements: 23,
            readabilityBefore: 65,
            readabilityAfter: 82
          })
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center space-x-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Revisão com IA Avançada</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Revisor de Texto Inteligente
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Melhore a qualidade dos seus textos com correções automáticas e sugestões inteligentes
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upload Area */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Documento para Revisão
                </h2>
                
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Edit className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  {file ? (
                    <div>
                      <p className="text-green-600 font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {(file.size / 1024).toFixed(1)} KB • Clique para substituir
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600">
                        Arraste um documento ou clique para selecionar
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Suporta .docx, .txt e .pdf
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Processing */}
              {processing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Revisando Documento
                  </h3>
                  <Progress value={progress} className="mb-2" />
                  <p className="text-sm text-gray-600">
                    Analisando gramática, ortografia e estilo...
                  </p>
                </motion.div>
              )}

              {/* Results */}
              {results && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Revisão Concluída
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Correções</p>
                      <p className="text-2xl font-bold text-gray-900">{results.corrections}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Melhorias</p>
                      <p className="text-2xl font-bold text-gray-900">{results.improvements}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Legibilidade</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xl font-bold text-red-500">{results.readabilityBefore}</p>
                        <span className="text-gray-400">→</span>
                        <p className="text-xl font-bold text-green-600">{results.readabilityAfter}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Palavras</p>
                      <p className="text-2xl font-bold text-gray-900">{results.revisedWords}</p>
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Documento Revisado
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Settings Sidebar */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configurações de Revisão
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Modo de Revisão
                    </label>
                    <select
                      value={settings.mode}
                      onChange={(e) => setSettings({ ...settings, mode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="complete">Completa</option>
                      <option value="grammar">Apenas Gramática</option>
                      <option value="style">Apenas Estilo</option>
                      <option value="clarity">Clareza e Concisão</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tom do Texto
                    </label>
                    <select
                      value={settings.tone}
                      onChange={(e) => setSettings({ ...settings, tone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="formal">Formal</option>
                      <option value="informal">Informal</option>
                      <option value="academic">Acadêmico</option>
                      <option value="creative">Criativo</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Melhorias
                    </label>
                    <div className="space-y-2">
                      {Object.entries(settings.improvements).map(([key, value]) => (
                        <label key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setSettings({
                              ...settings,
                              improvements: {
                                ...settings.improvements,
                                [key]: e.target.checked
                              }
                            })}
                            className="rounded text-purple-600 mr-2"
                          />
                          <span className="text-sm text-gray-700 capitalize">
                            {key === 'grammar' && 'Gramática'}
                            {key === 'spelling' && 'Ortografia'}
                            {key === 'punctuation' && 'Pontuação'}
                            {key === 'clarity' && 'Clareza'}
                            {key === 'conciseness' && 'Concisão'}
                            {key === 'vocabulary' && 'Vocabulário'}
                            {key === 'structure' && 'Estrutura'}
                            {key === 'consistency' && 'Consistência'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-purple-50 rounded-xl p-6"
              >
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Info className="w-5 h-5 text-purple-600" />
                  Como funciona
                </h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Análise completa do texto com IA</li>
                  <li>• Correções ortográficas e gramaticais</li>
                  <li>• Sugestões de melhorias estilísticas</li>
                  <li>• Mantém formatação original</li>
                  <li>• Exporta com marcações de mudança</li>
                </ul>
              </motion.div>

              <Button
                onClick={handleProcess}
                disabled={!file || processing}
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Revisando...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Revisar Documento
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Integration Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 bg-yellow-50 border border-yellow-200 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              Área de Integração
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              Esta página está preparada para receber seu código de revisão existente. 
              Para integrar:
            </p>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Adicione seu código de processamento de revisão no método handleProcess()</li>
              <li>Configure a conexão com sua API de revisão</li>
              <li>Ajuste os parâmetros de settings conforme necessário</li>
              <li>Implemente a lógica de download do documento revisado</li>
            </ol>
            <div className="mt-4 p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-xs">
              // src/app/revision/page.tsx - Line 89<br/>
              // INTEGRATION POINT: Add your revision code here<br/>
              // const result = await yourRevisionAPI.process(file, settings)
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}