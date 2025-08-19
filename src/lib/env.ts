// Environment variables validation
// This ensures all required environment variables are present

const requiredEnvVars = {
  // Required for OpenAI API
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  
  // Optional for rate limiting (but recommended for production)
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  
  // Optional for future integrations
  // SUPABASE_URL: process.env.SUPABASE_URL,
  // SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  // STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  // STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
}

// Validate required environment variables
export function validateEnv() {
  const missingVars: string[] = []
  
  // Check OpenAI API key (critical)
  if (!requiredEnvVars.OPENAI_API_KEY) {
    missingVars.push('OPENAI_API_KEY')
  }
  
  // Log warnings for optional but recommended variables
  if (!requiredEnvVars.UPSTASH_REDIS_REST_URL || !requiredEnvVars.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('⚠️ Rate limiting is disabled. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for production.')
  }
  
  // Throw error if critical variables are missing
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env.local file or Vercel environment variables.'
    )
  }
  
  // Validate API key format (basic check)
  if (requiredEnvVars.OPENAI_API_KEY && !requiredEnvVars.OPENAI_API_KEY.startsWith('sk-')) {
    console.warn('⚠️ OPENAI_API_KEY format might be incorrect. It should start with "sk-"')
  }
  
  return true
}

// Export validated environment variables
export const env = {
  openaiApiKey: requiredEnvVars.OPENAI_API_KEY!,
  upstashRedisUrl: requiredEnvVars.UPSTASH_REDIS_REST_URL,
  upstashRedisToken: requiredEnvVars.UPSTASH_REDIS_REST_TOKEN,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
}