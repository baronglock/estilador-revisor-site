import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { validateEnv, env } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'

// Validate environment variables on startup
try {
  validateEnv()
} catch (error) {
  console.error('Environment validation failed:', error)
}

// Initialize OpenAI with validated API key
const openai = new OpenAI({
  apiKey: env.openaiApiKey,
})

// Token pricing configuration (in BRL)
// Based on actual OpenAI pricing: ~$0.01 per 1k tokens for GPT-4
// Converting to BRL: $0.01 = R$ 0.05 (assuming 1 USD = 5 BRL)
const TOKEN_PRICING = {
  costPer1kTokens: 0.50, // R$ 0,50 per 1000 tokens for GPT-4
  costPer1kTokensMini: 0.01, // R$ 0,01 per 1000 tokens for GPT-4o-mini (free tier)
  estimatedTokensPerWord: 1.3, // Average tokens per word in Portuguese
}

// Get user account from Supabase
async function getUserAccount(userId: string) {
  const supabase = await createClient()
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error || !profile) {
    return null
  }
  
  return {
    userId: profile.id,
    plan: profile.plan || 'free',
    creditsBalance: parseFloat(profile.credits_balance || '0'),
    isActive: true,
    tokensUsedTotal: profile.tokens_used_total || 0,
  }
}

// Helper functions for token calculation
function estimateTokenCount(text: string): number {
  // Rough estimation: ~1.3 tokens per word for Portuguese text
  const words = text.split(/\s+/).length
  return Math.ceil(words * TOKEN_PRICING.estimatedTokensPerWord)
}

function calculateCost(tokens: number, isFreePlan: boolean = false): number {
  const rate = isFreePlan ? TOKEN_PRICING.costPer1kTokensMini : TOKEN_PRICING.costPer1kTokens
  return (tokens / 1000) * rate
}

export async function POST(request: NextRequest) {
  try {
    // Validate request body size (max 1MB)
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 1048576) {
      return NextResponse.json(
        { error: 'Documento muito grande. Tamanho máximo: 1MB' },
        { status: 413 }
      )
    }

    const body = await request.json()
    
    // Input validation
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Requisição inválida' },
        { status: 400 }
      )
    }
    
    const { paragraphs, systemPrompt, userId = 'anonymous' } = body
    
    // Validate required fields
    if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
      return NextResponse.json(
        { error: 'Documento vazio ou formato inválido' },
        { status: 400 }
      )
    }
    
    if (!systemPrompt || typeof systemPrompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt do sistema é obrigatório' },
        { status: 400 }
      )
    }
    
    // Limit maximum paragraphs to prevent abuse
    if (paragraphs.length > 500) {
      return NextResponse.json(
        { error: 'Documento excede o limite de 500 parágrafos' },
        { status: 400 }
      )
    }
    
    // Get authenticated user - REQUIRED
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Reject if not authenticated
    if (authError || !user) {
      return NextResponse.json(
        { 
          error: 'Não autorizado',
          message: 'Você precisa fazer login para usar este serviço. Crie uma conta gratuita para começar.'
        },
        { status: 401 }
      )
    }
    
    // Get user account from database
    const userAccount = await getUserAccount(user.id)
    
    if (!userAccount) {
      return NextResponse.json(
        { 
          error: 'Conta não encontrada',
          message: 'Erro ao carregar dados da conta. Por favor, tente fazer login novamente.'
        },
        { status: 404 }
      )
    }
    
    if (!userAccount.isActive) {
      return NextResponse.json(
        { error: 'Sua conta está inativa. Por favor, entre em contato com o suporte.' },
        { status: 403 }
      )
    }

    // Estimate token usage and cost for the entire document
    const fullText = paragraphs.join(' ')
    const estimatedTokens = estimateTokenCount(fullText + systemPrompt)
    // Free plan users get lower quality model at lower cost
    const isFreePlan = userAccount.plan === 'free' && userAccount.creditsBalance <= 0.50
    const estimatedCost = calculateCost(estimatedTokens, isFreePlan)
    
    // Check if user has enough credits
    if (userAccount.creditsBalance < estimatedCost) {
      return NextResponse.json(
        { 
          error: 'Créditos insuficientes',
          details: {
            message: `Você precisa de R$ ${estimatedCost.toFixed(2)} para processar este documento, mas tem apenas R$ ${userAccount.creditsBalance.toFixed(2)} em créditos.`,
            required: estimatedCost.toFixed(2),
            available: userAccount.creditsBalance.toFixed(2),
            estimatedTokens,
            suggestion: 'Compre mais créditos ou reduza o tamanho do documento.'
          }
        },
        { status: 403 }
      )
    }

    // Show warning if document is large
    if (estimatedCost > 5.00) {
      console.log(`⚠️ Large document processing: Estimated cost R$ ${estimatedCost.toFixed(2)} for ${estimatedTokens} tokens`)
    }

    // Process with OpenAI
    const batchSize = 25
    const processedParagraphs: string[] = []
    let totalTokensUsed = 0
    let totalCompletionTokens = 0
    let totalPromptTokens = 0
    
    for (let i = 0; i < paragraphs.length; i += batchSize) {
      const batch = paragraphs.slice(i, Math.min(i + batchSize, paragraphs.length))
      
      // Add context from previous batch for continuity
      const contextStart = Math.max(0, i - 3)
      const contextParagraphs = i > 0 ? paragraphs.slice(contextStart, i) : []
      const fullBatch = [...contextParagraphs, ...batch]
      
      // Use GPT-4o-mini for free plan, GPT-4.1 for paid plans
      const model = userAccount.plan === 'free' ? 'gpt-4o-mini' : 'gpt-4.1'
      
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: fullBatch.join('\n\n')
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      })

      const response = completion.choices[0].message.content || ''
      const responseParagraphs = response.split('\n\n').filter(p => p.trim())
      
      // Skip context paragraphs in the response
      const newParagraphs = i > 0 
        ? responseParagraphs.slice(contextParagraphs.length)
        : responseParagraphs
      
      processedParagraphs.push(...newParagraphs)
      
      // Track actual token usage from OpenAI response
      if (completion.usage) {
        totalTokensUsed += completion.usage.total_tokens
        totalCompletionTokens += completion.usage.completion_tokens || 0
        totalPromptTokens += completion.usage.prompt_tokens || 0
      }
    }

    // Calculate actual cost based on real token usage
    const actualCost = calculateCost(totalTokensUsed, isFreePlan)
    const newBalance = userAccount.creditsBalance - actualCost
    
    // Update user's credits in database (always required since user must be authenticated)
    const { data: updateResult, error: updateError } = await supabase.rpc(
      'update_user_credits',
      {
        p_user_id: user.id,
        p_tokens_used: totalTokensUsed,
        p_cost: actualCost,
        p_document_name: `Document_${new Date().toISOString()}`,
        p_model: isFreePlan ? 'GPT-4o-mini' : 'GPT-4.1',
        p_paragraphs: paragraphs.length
      }
    )
    
    if (updateError) {
      console.error('Failed to update user credits:', updateError)
      // Still return the result even if credit update fails
      // But log it for monitoring
    } else {
      console.log('Credits updated:', updateResult)
    }

    // Log usage for monitoring
    const modelUsed = isFreePlan ? 'GPT-4o-mini' : 'GPT-4.1'
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId: user.id,
      email: user.email,
      tokensUsed: totalTokensUsed,
      cost: actualCost.toFixed(2),
      model: modelUsed,
      paragraphs: paragraphs.length,
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    }
    console.log('Document processed:', JSON.stringify(logEntry))

    return NextResponse.json({ 
      processedParagraphs,
      usage: {
        tokensUsed: totalTokensUsed,
        promptTokens: totalPromptTokens,
        completionTokens: totalCompletionTokens,
        cost: actualCost.toFixed(2),
        creditsRemaining: newBalance.toFixed(2),
        estimatedTokens,
        estimatedCost: estimatedCost.toFixed(2),
        accuracy: ((estimatedTokens / totalTokensUsed) * 100).toFixed(1) + '%',
        modelUsed: isFreePlan ? 'GPT-4o-mini (Basic)' : 'GPT-4.1 (Premium)'
      },
      plan: userAccount.plan
    })

  } catch (error: any) {
    // Log error safely (don't expose sensitive info)
    console.error('API Error:', {
      message: error?.message || 'Unknown error',
      status: error?.status,
      code: error?.code,
      timestamp: new Date().toISOString()
    })
    
    // Handle specific OpenAI errors
    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Muitas requisições. Por favor, aguarde um momento e tente novamente.' },
        { status: 429 }
      )
    }
    
    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Erro de configuração do servidor. Entre em contato com o suporte.' },
        { status: 500 }
      )
    }

    if (error?.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'Quota da API excedida. Entre em contato com o suporte.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro ao processar documento. Tente novamente.' },
      { status: 500 }
    )
  }
}