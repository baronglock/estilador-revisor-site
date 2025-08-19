import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI with server-side API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Server-side only (no NEXT_PUBLIC_ prefix)
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
    const { paragraphs, systemPrompt, userId = 'anonymous' } = await request.json()

    // Check user account and credits
    const userAccount = getUserAccount(userId)
    
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

    // Log usage for monitoring
    const modelUsed = isFreePlan ? 'GPT-4o-mini' : 'GPT-4.1'
    console.log(`Document processed: ${totalTokensUsed} tokens, Cost: R$ ${actualCost.toFixed(2)}, Model: ${modelUsed}, User: ${userId}`)

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
    console.error('API Error:', error)
    
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