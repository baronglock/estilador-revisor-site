import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI with server-side API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Server-side only (no NEXT_PUBLIC_ prefix)
})

// Mock user data - in production, this would come from your database
const getUserPlan = (userId: string) => {
  // This would normally check your database
  return {
    plan: 'free', // 'free', 'pro', 'team', 'enterprise'
    creditsUsed: 0,
    creditsLimit: 1, // Free plan: 1 doc/month
    isActive: true,
  }
}

const PLAN_LIMITS = {
  free: { monthlyDocs: 1, maxParagraphs: 100 },
  pro: { monthlyDocs: 50, maxParagraphs: 1000 },
  team: { monthlyDocs: 200, maxParagraphs: 5000 },
  enterprise: { monthlyDocs: Infinity, maxParagraphs: Infinity },
}

export async function POST(request: NextRequest) {
  try {
    const { paragraphs, systemPrompt, userId = 'anonymous' } = await request.json()

    // Check user plan and limits
    const userPlan = getUserPlan(userId)
    
    if (!userPlan.isActive) {
      return NextResponse.json(
        { error: 'Sua conta está inativa. Por favor, entre em contato com o suporte.' },
        { status: 403 }
      )
    }

    if (userPlan.creditsUsed >= userPlan.creditsLimit) {
      return NextResponse.json(
        { error: `Limite de documentos atingido. Seu plano ${userPlan.plan} permite ${userPlan.creditsLimit} documento(s) por mês.` },
        { status: 403 }
      )
    }

    const planLimit = PLAN_LIMITS[userPlan.plan as keyof typeof PLAN_LIMITS]
    if (paragraphs.length > planLimit.maxParagraphs) {
      return NextResponse.json(
        { error: `Documento muito grande. Seu plano permite até ${planLimit.maxParagraphs} parágrafos.` },
        { status: 403 }
      )
    }

    // Process with OpenAI
    const batchSize = 25
    const processedParagraphs: string[] = []
    
    for (let i = 0; i < paragraphs.length; i += batchSize) {
      const batch = paragraphs.slice(i, Math.min(i + batchSize, paragraphs.length))
      
      // Add context from previous batch for continuity
      const contextStart = Math.max(0, i - 3)
      const contextParagraphs = i > 0 ? paragraphs.slice(contextStart, i) : []
      const fullBatch = [...contextParagraphs, ...batch]
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
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
    }

    // In production, update user's credits used in database
    // await updateUserCredits(userId, userPlan.creditsUsed + 1)

    return NextResponse.json({ 
      processedParagraphs,
      creditsRemaining: userPlan.creditsLimit - userPlan.creditsUsed - 1,
      plan: userPlan.plan
    })

  } catch (error: any) {
    console.error('API Error:', error)
    
    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Muitas requisições. Por favor, aguarde um momento.' },
        { status: 429 }
      )
    }
    
    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Erro de configuração do servidor. Entre em contato com o suporte.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro ao processar documento. Tente novamente.' },
      { status: 500 }
    )
  }
}