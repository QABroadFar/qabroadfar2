// Script to check users in Supabase database
import { createClient } from '@supabase/supabase-js'

// Ensure these environment variables are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkUsers() {
  console.log('Checking users in Supabase database...')
  
  try {
    // Get all users
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
    
    if (error) {
      console.error('Error fetching users:', error)
      return
    }
    
    console.log('All users:')
    console.table(users)
    
    // Check for super_admin users
    const { data: superAdminUsers, error: superAdminError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'super_admin')
    
    if (superAdminError) {
      console.error('Error fetching super_admin users:', superAdminError)
      return
    }
    
    console.log('Super admin users:')
    console.table(superAdminUsers)
    
    // Check for superadmin users (without underscore)
    const { data: superadminUsers, error: superadminError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'superadmin')
    
    if (superadminError) {
      console.error('Error fetching superadmin users:', superadminError)
      return
    }
    
    console.log('Superadmin users (without underscore):')
    console.table(superadminUsers)
    
  } catch (error) {
    console.error('Error checking database:', error)
  }
}

checkUsers()