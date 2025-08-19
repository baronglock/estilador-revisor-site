"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, FileText, Edit, CreditCard, Download,
  TrendingUp, Calendar, Clock, DollarSign, Plus,
  Filter, Search, MoreVertical, Eye, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/layout/Navigation'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('7d')
  const [activeTab, setActiveTab] = useState('overview')

  // Mock user data
  const user = {
    name: 'João Silva',
    email: 'joao@example.com',
    plan: 'Profissional',
    credits: 42,
    creditsTotal: 50,
    nextBilling: '2024-02-15'
  }

  // Mock statistics
  const stats = {
    documentsProcessed: 128,
    documentsThisMonth: 23,
    creditsUsed: 8,
    averageProcessingTime: '2.3 min',
    totalSaved: 'R$ 450',
    accuracy: '95.8%'
  }

  // Mock chart data
  const usageData = [
    { date: '01/01', styler: 5, revision: 2 },
    { date: '02/01', styler: 8, revision: 3 },
    { date: '03/01', styler: 3, revision: 1 },
    { date: '04/01', styler: 12, revision: 5 },
    { date: '05/01', styler: 7, revision: 4 },
    { date: '06/01', styler: 9, revision: 3 },
    { date: '07/01', styler: 6, revision: 2 }
  ]

  const documentTypes = [
    { name: 'Simulados', value: 45, color: '#3B82F6' },
    { name: 'Provas', value: 30, color: '#8B5CF6' },
    { name: 'Exercícios', value: 15, color: '#10B981' },
    { name: 'Outros', value: 10, color: '#F59E0B' }
  ]

  const recentDocuments = [
    {
      id: 1,
      name: 'Simulado_Matematica_2024.docx',
      type: 'Estilização',
      date: '2024-01-07',
      status: 'Concluído',
      pages: 45,
      credits: 1
    },
    {
      id: 2,
      name: 'Prova_Portugues_3ano.docx',
      type: 'Revisão',
      date: '2024-01-06',
      status: 'Concluído',
      pages: 28,
      credits: 1
    },
    {
      id: 3,
      name: 'Exercicios_Fisica.docx',
      type: 'Estilização',
      date: '2024-01-05',
      status: 'Processando',
      pages: 15,
      credits: 1
    },
    {
      id: 4,
      name: 'Simulado_Historia_Brasil.docx',
      type: 'Estilização',
      date: '2024-01-04',
      status: 'Concluído',
      pages: 32,
      credits: 1
    },
    {
      id: 5,
      name: 'Redacao_ENEM_Modelo.docx',
      type: 'Revisão',
      date: '2024-01-03',
      status: 'Concluído',
      pages: 8,
      credits: 1
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />
      
      {/* Header */}
      <div className="pt-20 pb-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Bem-vindo de volta, {user.name}
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar Relatório
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Documento
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 mt-8">
            {['overview', 'documents', 'usage', 'billing'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'overview' && 'Visão Geral'}
                {tab === 'documents' && 'Documentos'}
                {tab === 'usage' && 'Uso'}
                {tab === 'billing' && 'Faturamento'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm text-green-600 font-medium">
                    +12%
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.documentsThisMonth}
                </div>
                <div className="text-sm text-gray-600">
                  Documentos este mês
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-600">
                    {user.credits}/{user.creditsTotal}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {user.credits}
                </div>
                <div className="text-sm text-gray-600">
                  Créditos disponíveis
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.averageProcessingTime}
                </div>
                <div className="text-sm text-gray-600">
                  Tempo médio
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                  <span className="text-sm text-green-600 font-medium">
                    <TrendingUp className="w-4 h-4 inline" />
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalSaved}
                </div>
                <div className="text-sm text-gray-600">
                  Economia total
                </div>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Uso nos últimos 7 dias
                  </h3>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1"
                  >
                    <option value="7d">7 dias</option>
                    <option value="30d">30 dias</option>
                    <option value="90d">90 dias</option>
                  </select>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="styler" 
                      stroke="#3B82F6" 
                      name="Estilização"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revision" 
                      stroke="#8B5CF6" 
                      name="Revisão"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Tipos de Documento
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={documentTypes}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {documentTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {documentTypes.map((type) => (
                    <div key={type.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: type.color }}
                        />
                        <span className="text-sm text-gray-600">{type.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {type.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Recent Documents */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-sm"
            >
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Documentos Recentes
                  </h3>
                  <Button variant="ghost" size="sm">
                    Ver todos
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b">
                      <th className="p-4">Nome</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4">Data</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Páginas</th>
                      <th className="p-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDocuments.map((doc) => (
                      <tr key={doc.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center">
                            <FileText className="w-5 h-5 text-gray-400 mr-3" />
                            <span className="text-sm font-medium text-gray-900">
                              {doc.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            doc.type === 'Estilização' 
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {doc.type}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {doc.date}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            doc.status === 'Concluído'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {doc.pages}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Todos os Documentos</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar documentos..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>
            <p className="text-gray-600">Lista completa de documentos processados...</p>
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Detalhes de Uso</h2>
            <p className="text-gray-600">Análise detalhada do uso de créditos e recursos...</p>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Informações de Faturamento</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Plano Atual</p>
                  <p className="text-lg font-semibold">{user.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Próxima Cobrança</p>
                  <p className="text-lg font-semibold">{user.nextBilling}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Valor Mensal</p>
                  <p className="text-lg font-semibold">R$ 29,00</p>
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                <Button variant="outline">Alterar Plano</Button>
                <Button variant="outline">Adicionar Créditos</Button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Histórico de Faturas</h3>
              <p className="text-gray-600">Lista de faturas anteriores...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}