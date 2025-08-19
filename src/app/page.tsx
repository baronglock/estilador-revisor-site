"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Sparkles, FileText, Edit, Zap, Shield, Globe, 
  CheckCircle, ArrowRight, BarChart3, Users, Clock,
  Layers, Target, Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/layout/Navigation'

export default function LandingPage() {
  const features = [
    {
      icon: FileText,
      title: 'Estilização Inteligente',
      description: 'Aplique estilos automaticamente em documentos Word usando IA avançada',
      color: 'bg-blue-500'
    },
    {
      icon: Edit,
      title: 'Revisão Automatizada',
      description: 'Corrija e melhore textos com precisão usando modelos de linguagem',
      color: 'bg-purple-500'
    },
    {
      icon: Zap,
      title: 'Processamento Rápido',
      description: 'Processe documentos grandes em minutos, não horas',
      color: 'bg-yellow-500'
    },
    {
      icon: Shield,
      title: '100% Seguro',
      description: 'Seus documentos são processados com total privacidade e segurança',
      color: 'bg-green-500'
    },
    {
      icon: Globe,
      title: 'Acesso em Nuvem',
      description: 'Trabalhe de qualquer lugar, sem necessidade de instalação',
      color: 'bg-indigo-500'
    },
    {
      icon: Users,
      title: 'Para Equipes',
      description: 'Colabore com sua equipe em tempo real',
      color: 'bg-pink-500'
    }
  ]

  const stats = [
    { value: '10k+', label: 'Documentos Processados' },
    { value: '95%', label: 'Precisão de Estilização' },
    { value: '500+', label: 'Clientes Satisfeitos' },
    { value: '24/7', label: 'Suporte Disponível' }
  ]

  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Professora',
      content: 'Economizei horas de trabalho formatando provas e simulados. Simplesmente incrível!',
      avatar: '👩‍🏫'
    },
    {
      name: 'João Santos',
      role: 'Editor',
      content: 'A ferramenta de revisão é extremamente precisa. Melhorou muito nossa produtividade.',
      avatar: '👨‍💼'
    },
    {
      name: 'Ana Costa',
      role: 'Coordenadora Pedagógica',
      content: 'Essencial para nossa equipe. Padronizamos todos os materiais em minutos.',
      avatar: '👩‍💻'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Powered by GPT-4</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Transforme seus documentos com
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Inteligência Artificial</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Estilize, revise e formate documentos Word automaticamente. 
              Economize tempo e garanta qualidade profissional em todos os seus materiais.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="px-8">
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="px-8">
                  Ver Planos
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              ✓ Sem cartão de crédito • ✓ 1 documento grátis • ✓ Cancele quando quiser
            </p>
          </motion.div>

          {/* Hero Image/Demo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 relative"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-1">
              <div className="bg-white rounded-lg p-8">
                <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Preview do Sistema</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ferramentas poderosas para transformar seu fluxo de trabalho com documentos
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-blue-100">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Como funciona
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Três passos simples para transformar seus documentos
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Faça o upload',
                description: 'Envie seu documento Word em formato .docx',
                icon: Upload
              },
              {
                step: '2',
                title: 'Configure',
                description: 'Escolha estilos e opções de processamento',
                icon: Settings
              },
              {
                step: '3',
                title: 'Baixe o resultado',
                description: 'Receba seu documento processado e formatado',
                icon: Download
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4 text-2xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full">
                    <ArrowRight className="w-6 h-6 text-gray-300 -ml-3" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              O que nossos clientes dizem
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">⭐</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Pronto para começar?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de profissionais que já transformaram seu fluxo de trabalho
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8">
                  Teste Grátis por 7 Dias
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                  Ver Planos e Preços
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-8 h-8 text-blue-400" />
                <span className="font-bold text-xl">EstiladorAI</span>
              </div>
              <p className="text-gray-400">
                Transformando documentos com inteligência artificial
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/styler" className="hover:text-white">Estilador</Link></li>
                <li><Link href="/revision" className="hover:text-white">Revisor</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Preços</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">Sobre</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contato</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white">Privacidade</Link></li>
                <li><Link href="/terms" className="hover:text-white">Termos</Link></li>
                <li><Link href="/cookies" className="hover:text-white">Cookies</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 EstiladorAI. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Import necessary components
import { Upload, Settings, Download } from 'lucide-react'