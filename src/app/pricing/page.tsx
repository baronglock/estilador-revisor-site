"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Check, X, Sparkles, Zap, Building2, HelpCircle,
  CreditCard, FileText, Edit, Users, Shield, Clock,
  ArrowRight, Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/layout/Navigation'

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const plans = [
    {
      name: 'Grátis',
      description: 'Perfeito para experimentar',
      price: { monthly: 0, yearly: 0 },
      credits: { monthly: 1, yearly: 12 },
      color: 'border-gray-200',
      badge: null,
      features: [
        { text: '1 documento por mês', included: true },
        { text: 'Estilização básica', included: true },
        { text: 'Até 10 páginas por documento', included: true },
        { text: 'Suporte por email', included: true },
        { text: 'Revisão de texto', included: false },
        { text: 'API access', included: false },
        { text: 'Processamento prioritário', included: false },
        { text: 'Documentos ilimitados', included: false }
      ],
      cta: 'Começar Grátis'
    },
    {
      name: 'Profissional',
      description: 'Para profissionais individuais',
      price: { monthly: 29, yearly: 290 },
      credits: { monthly: 50, yearly: 600 },
      color: 'border-blue-500',
      badge: 'Mais Popular',
      features: [
        { text: '50 documentos por mês', included: true },
        { text: 'Estilização avançada', included: true },
        { text: 'Até 100 páginas por documento', included: true },
        { text: 'Suporte prioritário', included: true },
        { text: 'Revisão de texto básica', included: true },
        { text: 'Templates personalizados', included: true },
        { text: 'Processamento prioritário', included: false },
        { text: 'API access', included: false }
      ],
      cta: 'Teste 7 Dias Grátis'
    },
    {
      name: 'Equipe',
      description: 'Para equipes pequenas',
      price: { monthly: 99, yearly: 990 },
      credits: { monthly: 200, yearly: 2400 },
      color: 'border-purple-500',
      badge: 'Melhor Valor',
      features: [
        { text: '200 documentos por mês', included: true },
        { text: 'Todos os recursos Pro', included: true },
        { text: 'Documentos ilimitados de páginas', included: true },
        { text: 'Suporte 24/7', included: true },
        { text: 'Revisão de texto avançada', included: true },
        { text: '5 usuários inclusos', included: true },
        { text: 'Processamento prioritário', included: true },
        { text: 'API access básico', included: true }
      ],
      cta: 'Começar Agora'
    },
    {
      name: 'Empresa',
      description: 'Soluções personalizadas',
      price: { monthly: 'Custom', yearly: 'Custom' },
      credits: { monthly: 'Ilimitado', yearly: 'Ilimitado' },
      color: 'border-gradient-to-r from-purple-500 to-blue-500',
      badge: 'Enterprise',
      features: [
        { text: 'Documentos ilimitados', included: true },
        { text: 'Todos os recursos', included: true },
        { text: 'Usuários ilimitados', included: true },
        { text: 'Suporte dedicado', included: true },
        { text: 'SLA garantido', included: true },
        { text: 'Treinamento personalizado', included: true },
        { text: 'API completo', included: true },
        { text: 'Integração customizada', included: true }
      ],
      cta: 'Falar com Vendas'
    }
  ]

  const costCalculator = {
    averageDocSize: 30, // páginas
    processingCost: 0.15, // por documento
    examples: [
      { docs: 10, cost: 1.5, savings: 27.5 },
      { docs: 50, cost: 7.5, savings: 21.5 },
      { docs: 200, cost: 30, savings: 69 },
      { docs: 500, cost: 75, savings: 'Custom' }
    ]
  }

  const faqs = [
    {
      question: 'Como funcionam os créditos?',
      answer: 'Cada documento processado consome 1 crédito, independente do tamanho (dentro dos limites do plano). Créditos não utilizados não acumulam para o próximo mês.'
    },
    {
      question: 'Posso mudar de plano a qualquer momento?',
      answer: 'Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças entram em vigor no próximo ciclo de cobrança.'
    },
    {
      question: 'Há desconto para pagamento anual?',
      answer: 'Sim! Oferecemos 2 meses grátis quando você escolhe o pagamento anual, economizando aproximadamente 17% comparado ao mensal.'
    },
    {
      question: 'Como funciona o teste grátis?',
      answer: 'O teste grátis de 7 dias está disponível para o plano Profissional. Não solicitamos cartão de crédito e você pode cancelar a qualquer momento.'
    },
    {
      question: 'Posso comprar créditos adicionais?',
      answer: 'Sim! Você pode comprar pacotes de créditos adicionais a R$0,50 por crédito, ou optar por fazer upgrade do plano.'
    },
    {
      question: 'Qual a política de reembolso?',
      answer: 'Oferecemos garantia de 30 dias. Se não estiver satisfeito, devolvemos seu dinheiro sem perguntas.'
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
            <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Economize até 17% no plano anual</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Planos e Preços
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Escolha o plano ideal para suas necessidades. Comece grátis e escale conforme cresce.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-gray-100 rounded-lg p-1 mb-12">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingPeriod === 'yearly'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600'
                }`}
              >
                Anual
                <span className="ml-2 text-xs text-green-600">-17%</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl shadow-lg border-2 ${plan.color} ${
                  plan.name === 'Profissional' ? 'scale-105' : ''
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      {plan.badge}
                    </span>
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {plan.description}
                  </p>
                  
                  <div className="mb-6">
                    {typeof plan.price[billingPeriod] === 'number' ? (
                      <>
                        <span className="text-4xl font-bold text-gray-900">
                          R${plan.price[billingPeriod]}
                        </span>
                        <span className="text-gray-600">
                          /{billingPeriod === 'monthly' ? 'mês' : 'ano'}
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-gray-900">
                        Personalizado
                      </span>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-6">
                    <div className="text-sm text-gray-600">Créditos inclusos:</div>
                    <div className="font-semibold text-gray-900">
                      {plan.credits[billingPeriod]} {typeof plan.credits[billingPeriod] === 'number' ? 'documentos' : ''}
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mr-2 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full"
                    variant={plan.name === 'Profissional' ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost Calculator Section */}
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
              Calculadora de Economia
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Veja quanto você pode economizar baseado no seu volume de documentos
            </p>
          </motion.div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {costCalculator.examples.map((example, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl p-6 text-center"
                >
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {example.docs}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">documentos/mês</div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">
                      Custo estimado:
                    </div>
                    <div className="text-xl font-semibold text-blue-600">
                      R${example.cost}
                    </div>
                    <div className="text-sm text-green-600">
                      {typeof example.savings === 'number' 
                        ? `Economia de R$${example.savings}`
                        : 'Plano personalizado'
                      }
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                <Info className="w-4 h-4 inline mr-1" />
                Baseado em documentos de ~{costCalculator.averageDocSize} páginas. 
                Custo médio de processamento: R${costCalculator.processingCost}/documento
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Comparison */}
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
              Compare os Recursos
            </h2>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-lg">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-6">Recursos</th>
                  <th className="text-center p-6">Grátis</th>
                  <th className="text-center p-6 bg-blue-50">Profissional</th>
                  <th className="text-center p-6">Equipe</th>
                  <th className="text-center p-6">Empresa</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Estilização de Documentos', free: '✓', pro: '✓', team: '✓', enterprise: '✓' },
                  { feature: 'Revisão de Texto', free: '-', pro: 'Básica', team: 'Avançada', enterprise: 'Completa' },
                  { feature: 'Templates', free: '5', pro: '50', team: 'Ilimitado', enterprise: 'Ilimitado' },
                  { feature: 'Suporte', free: 'Email', pro: 'Prioritário', team: '24/7', enterprise: 'Dedicado' },
                  { feature: 'API Access', free: '-', pro: '-', team: 'Básico', enterprise: 'Completo' },
                  { feature: 'Usuários', free: '1', pro: '1', team: '5', enterprise: 'Ilimitado' },
                  { feature: 'Armazenamento', free: '1GB', pro: '10GB', team: '100GB', enterprise: 'Ilimitado' },
                  { feature: 'Processamento', free: 'Normal', pro: 'Rápido', team: 'Prioritário', enterprise: 'Dedicado' }
                ].map((row, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-6 font-medium">{row.feature}</td>
                    <td className="p-6 text-center">{row.free}</td>
                    <td className="p-6 text-center bg-blue-50">{row.pro}</td>
                    <td className="p-6 text-center">{row.team}</td>
                    <td className="p-6 text-center">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h2>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-start">
                  <HelpCircle className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                  {faq.question}
                </h3>
                <p className="text-gray-600 ml-7">
                  {faq.answer}
                </p>
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
              Ainda tem dúvidas?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Nossa equipe está pronta para ajudar você a escolher o melhor plano
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8">
                Falar com Especialista
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                Agendar Demonstração
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}