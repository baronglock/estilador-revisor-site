# Supabase Setup Instructions

## ✅ Already Done in Vercel
Since you connected Supabase through Vercel's integration, these environment variables are automatically set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📋 Steps to Complete in Supabase Dashboard

### 1. Run the Database Schema
1. Go to your Supabase dashboard: https://app.supabase.com
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy and paste the entire contents of `supabase/schema.sql`
5. Click "Run" to create all tables and functions

### 2. Enable Email Authentication
1. Go to "Authentication" → "Providers"
2. Make sure "Email" is enabled
3. Configure email templates if needed

### 3. Configure Auth Settings
1. Go to "Authentication" → "URL Configuration"
2. Set your Site URL to your Vercel domain (e.g., `https://your-app.vercel.app`)
3. Add these redirect URLs:
   - `https://your-app.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for local development)

### 4. (Optional) Configure Email Templates
1. Go to "Authentication" → "Email Templates"
2. Customize the confirmation email template
3. Add your brand colors and logo

## 🔑 Authentication Flow

### New User Signup
1. User signs up at `/auth/signup`
2. Receives R$ 0.50 free credit automatically
3. Email verification sent
4. After verification, can start using the service

### User Login
1. User logs in at `/auth/login`
2. Session stored in cookies
3. Redirected to dashboard

### API Usage
- Authenticated users: Credits deducted from their balance
- Anonymous users: Limited to R$ 0.10 test credit

## 📊 Database Tables Created

- **profiles**: User profiles with credits balance
- **usage_history**: Track all document processing
- **credits_transactions**: Record all credit changes
- **subscriptions**: Manage user plans (for future Stripe integration)

## 🔍 Monitor Usage

In Supabase dashboard:
1. Go to "Table Editor"
2. Check `profiles` table for user balances
3. Check `usage_history` for processing logs
4. Check `credits_transactions` for all transactions

## ⚠️ Important Notes

- Users start with R$ 0.50 free credit
- Each document processing deducts credits based on tokens used
- The system tracks everything automatically
- All tables have Row Level Security (RLS) enabled for safety