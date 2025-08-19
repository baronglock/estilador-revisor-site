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
      name: 'Teste Grátis',
      description: 'Experimente sem compromisso',
      price: { monthly: 0, yearly: 0 },
      credits: { monthly: 'R$ 0,50', yearly: 'R$ 0,50' },
      color: 'border-gray-200',
      badge: null,
      features: [
        { text: 'R$ 0,50 em créditos (único)', included: true },
        { text: '1 documento pequeno (até 20 páginas)', included: true },
        { text: 'Modelo GPT-4o-mini (básico)', included: true },
        { text: 'Suporte por email', included: true },
        { text: 'Validade: 7 dias', included: true },
        { text: 'Processamento padrão', included: true },
        { text: 'Modelo GPT-4.1 premium', included: false },
        { text: 'API access', included: false }
      ],
      cta: 'Testar Grátis'
    },
    {
      name: 'Pré-pago',
      description: 'Pague apenas pelo que usar',
      price: { monthly: 29, yearly: 29 },
      credits: { monthly: 'R$ 29', yearly: 'R$ 29' },
      color: 'border-green-500',
      badge: 'Flexível',
      features: [
        { text: 'R$ 29 em créditos', included: true },
        { text: '~5-6 documentos grandes', included: true },
        { text: 'Modelo GPT-4.1 (máxima precisão)', included: true },
        { text: 'Custo médio: R$ 5,00 por doc (120 pág)', included: true },
        { text: 'Validade: 90 dias', included: true },
        { text: 'Suporte prioritário', included: true },
        { text: 'Histórico de documentos', included: true },
        { text: 'Sem renovação automática', included: true }
      ],
      cta: 'Comprar Créditos'
    },
    {
      name: 'Profissional',
      description: 'Melhor custo-benefício',
      price: { monthly: 99, yearly: 990 },
      credits: { monthly: 'R$ 115', yearly: 'R$ 1.500' },
      color: 'border-blue-500',
      badge: 'Mais Popular',
      features: [
        { text: 'R$ 115 em créditos/mês (15% bônus)', included: true },
        { text: '~20-25 documentos grandes/mês', included: true },
        { text: 'Modelo GPT-4.1 (máxima precisão)', included: true },
        { text: 'Processamento prioritário', included: true },
        { text: 'Suporte 24/7', included: true },
        { text: 'Créditos acumulam por 3 meses', included: true },
        { text: 'Relatórios de uso detalhados', included: true },
        { text: 'Desconto anual: 25% extra', included: true }
      ],
      cta: 'Assinar Agora'
    },
    {
      name: 'Empresarial',
      description: 'Para grandes volumes',
      price: { monthly: 299, yearly: 2990 },
      credits: { monthly: 'R$ 380', yearly: 'R$ 5.000' },
      color: 'border-purple-500',
      badge: 'Enterprise',
      features: [
        { text: 'R$ 380 em créditos/mês (27% bônus)', included: true },
        { text: '~70-80 documentos grandes/mês', included: true },
        { text: 'Modelo GPT-4.1 (máxima precisão)', included: true },
        { text: 'API completo incluído', included: true },
        { text: 'Suporte dedicado', included: true },
        { text: 'Créditos nunca expiram', included: true },
        { text: 'Faturamento personalizado', included: true },
        { text: 'SLA garantido 99.9%', included: true }
      ],
      cta: 'Falar com Vendas'
    }
  ]

  const costCalculator = {
    examples: [
      { 
        type: 'Documento Pequeno',
        pages: '10-20 páginas',
        tokens: '~10.000 tokens',
        cost: 'R$ 2,50 - R$ 5,00',
        description: 'Cartas, contratos simples',
        modelFree: 'R$ 0,10 - R$ 0,20'
      },
      { 
        type: 'Documento Médio',
        pages: '30-60 páginas',
        tokens: '~30.000 tokens',
        cost: 'R$ 7,50 - R$ 15,00',
        description: 'Relatórios, artigos',
        modelFree: 'R$ 0,30 - R$ 0,60'
      },
      { 
        type: 'Documento Grande',
        pages: '80-120 páginas',
        tokens: '~80.000 tokens',
        cost: 'R$ 20,00 - R$ 40,00',
        description: 'Teses, manuais',
        modelFree: 'R$ 0,80 - R$ 1,20'
      },
      { 
        type: 'Livro/E-book',
        pages: '200+ páginas',
        tokens: '~200.000+ tokens',
        cost: 'R$ 50,00 - R$ 100,00',
        description: 'Livros completos',
        modelFree: 'R$ 2,00 - R$ 4,00'
      }
    ]
  }

  const faqs = [
    {
      question: 'Como funcionam os créditos?',
      answer: 'Os créditos são consumidos baseados na quantidade de tokens processados. Com GPT-4.1 (planos pagos), o custo é R$ 0,50 por 1.000 tokens. Um documento de 120 páginas usa ~80.000 tokens, custando cerca de R$ 40,00. Você pode acompanhar o consumo em tempo real.'
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
      question: 'Qual a diferença entre os modelos GPT-4.1 e GPT-4o-mini?',
      answer: 'GPT-4.1 (planos pagos) oferece máxima precisão, melhor compreensão de contexto e resultados superiores. GPT-4o-mini (plano grátis) é mais rápido e econômico, ideal para testes, mas com qualidade reduzida.'
    },
    {
      question: 'Os créditos expiram?',
      answer: 'Depende do plano: Teste grátis (30 dias), Pré-pago (90 dias), Profissional (acumulam por 3 meses), Empresarial (nunca expiram). Planos com assinatura recebem novos créditos mensalmente.'
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
              Preços Transparentes e Flexíveis
            </h1>
            
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Sistema de créditos baseado em uso real. Pague apenas pelos tokens processados.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto mb-8">
              <p className="text-sm text-blue-800">
                <strong>💡 Como funciona:</strong> Cada documento consome créditos baseado na quantidade de texto processado (tokens). 
                Um documento típico de 120 páginas custa aproximadamente R$ 5,00 usando o modelo GPT-4.1 (premium).
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto mb-8">
              <p className="text-sm text-green-800">
                <strong>✨ Qualidade Premium:</strong> Planos pagos usam o modelo GPT-4.1 para máxima precisão e qualidade. 
                O plano gratuito usa GPT-4o-mini, ideal para testes rápidos.
              </p>
            </div>

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
                    <div className="text-sm text-gray-600">Créditos:</div>
                    <div className="font-semibold text-gray-900">
                      {plan.credits[billingPeriod]}
                    </div>
                    {plan.name === 'Profissional' || plan.name === 'Empresarial' ? (
                      <div className="text-xs text-gray-500 mt-1">
                        {billingPeriod === 'yearly' ? 'por ano' : 'por mês'}
                      </div>
                    ) : null}
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
              Estimativa de Custos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Custos médios baseados no tamanho e complexidade dos documentos
            </p>
          </motion.div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {costCalculator.examples.map((example, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl p-6"
                >
                  <div className="text-lg font-bold text-gray-900 mb-2">
                    {example.type}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">{example.pages}</div>
                  <div className="text-xs text-gray-500 mb-3">{example.tokens}</div>
                  
                  <div className="border-t pt-3">
                    <div className="mb-2">
                      <div className="text-xs text-gray-500">GPT-4.1 (Premium):</div>
                      <div className="text-xl font-semibold text-blue-600">
                        {example.cost}
                      </div>
                    </div>
                    <div className="mb-1">
                      <div className="text-xs text-gray-500">GPT-4o-mini (Grátis):</div>
                      <div className="text-sm text-green-600">
                        {example.modelFree}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {example.description}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <Info className="w-4 h-4 inline mr-1" />
                <strong>Nota:</strong> Os valores são estimativas baseadas no modelo GPT-4.1. O custo real depende da complexidade do texto, 
                quantidade de estilos aplicados e tamanho do documento. Documentos técnicos ou com formatação complexa podem ter custo maior. 
                O modelo gratuito (GPT-4o-mini) tem custo muito menor mas qualidade reduzida.
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