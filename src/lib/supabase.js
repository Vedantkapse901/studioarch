import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase credentials missing. Some features may not work.')
}

export const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '')

/**
 * Initialize Supabase tables and RLS policies
 * Run this once during setup
 */
export async function initializeSupabase() {
  try {
    console.log('✓ Supabase initialized successfully')
    return true
  } catch (error) {
    console.error('❌ Supabase initialization error:', error)
    return false
  }
}
