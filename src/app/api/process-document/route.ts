import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { validateEnv, env } from '@/lib/env'

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

// Mock user account data - in production, this would come from your database
const getUserAccount = (userId: string) => {
  // This would normally check your database for user's credits and plan
  return {
    userId,
    plan: 'prepaid', // 'free', 'prepaid', 'professional', 'enterprise'
    creditsBalance: 29.00, // R$ 29,00 in credits
    isActive: true,
    tokensUsedThisMonth: 0,
    monthlyBonus: 0, // 15% for professional, 25% for enterprise
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
    
    // Sanitize user ID
    const sanitizedUserId = userId.replace(/[^a-zA-Z0-9-_]/g, '').substring(0, 50)

    // Check user account and credits
    const userAccount = getUserAccount(sanitizedUserId)
    
    if (!userAccount.isActive) {
      return NextResponse.json(
        { error: 'Sua conta está inativa. Por favor, entre em contato com o suporte.' },
        { status: 403 }
      )
    }

    // Estimate token usage and cost for the entire document
    const fullText = paragraphs.join(' ')
    const estimatedTokens = estimateTokenCount(fullText + systemPrompt)
    const isFreePlan = userAccount.plan === 'free'
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
    
    // TODO: In production, update user's credits in database
    // await updateUserCredits(userId, {
    //   newBalance,
    //   tokensUsed: totalTokensUsed,
    //   cost: actualCost,
    //   documentId: generateDocumentId()
    // })

    // Log usage for monitoring (sanitized)
    const modelUsed = isFreePlan ? 'GPT-4o-mini' : 'GPT-4.1'
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId: sanitizedUserId,
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