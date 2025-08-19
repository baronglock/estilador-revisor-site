-- Create users profile table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'prepaid', 'professional', 'enterprise')),
  credits_balance DECIMAL(10, 2) DEFAULT 0.50, -- Start with R$ 0.50 for free trial
  tokens_used_total BIGINT DEFAULT 0,
  documents_processed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage history table
CREATE TABLE IF NOT EXISTS public.usage_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  document_name TEXT,
  tokens_used INTEGER NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  model_used TEXT NOT NULL,
  paragraphs_count INTEGER,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credits transactions table
CREATE TABLE IF NOT EXISTS public.credits_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'bonus', 'refund')),
  description TEXT,
  stripe_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'prepaid', 'professional', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'paused')),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for usage_history
CREATE POLICY "Users can view own usage" ON public.usage_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage" ON public.usage_history
  FOR INSERT WITH CHECK (true); -- Will be restricted via service role key

-- RLS Policies for credits_transactions
CREATE POLICY "Users can view own transactions" ON public.credits_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, plan, credits_balance)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'free',
    0.50 -- R$ 0.50 free trial credit
  );
  
  -- Record the initial bonus credit
  INSERT INTO public.credits_transactions (user_id, amount, type, description)
  VALUES (NEW.id, 0.50, 'bonus', 'Welcome bonus - teste grátis');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update credits after usage
CREATE OR REPLACE FUNCTION public.update_user_credits(
  p_user_id UUID,
  p_tokens_used INTEGER,
  p_cost DECIMAL,
  p_document_name TEXT,
  p_model TEXT,
  p_paragraphs INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_current_balance DECIMAL;
  v_new_balance DECIMAL;
BEGIN
  -- Get current balance with lock
  SELECT credits_balance INTO v_current_balance
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;
  
  -- Check if user has enough credits
  IF v_current_balance < p_cost THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'current_balance', v_current_balance,
      'required', p_cost
    );
  END IF;
  
  -- Calculate new balance
  v_new_balance := v_current_balance - p_cost;
  
  -- Update user profile
  UPDATE public.profiles
  SET 
    credits_balance = v_new_balance,
    tokens_used_total = tokens_used_total + p_tokens_used,
    documents_processed = documents_processed + 1,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Record usage
  INSERT INTO public.usage_history (
    user_id, document_name, tokens_used, cost, model_used, paragraphs_count
  ) VALUES (
    p_user_id, p_document_name, p_tokens_used, p_cost, p_model, p_paragraphs
  );
  
  -- Record transaction
  INSERT INTO public.credits_transactions (
    user_id, amount, type, description
  ) VALUES (
    p_user_id, -p_cost, 'usage', 'Document processing: ' || p_document_name
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'cost', p_cost,
    'tokens_used', p_tokens_used
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_history_user_id ON public.usage_history(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_history_created_at ON public.usage_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credits_transactions_user_id ON public.credits_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);