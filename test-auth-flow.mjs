// Test script to verify authentication flow
import { createClient } from '@supabase/supabase-js'
import { SignJWT } from "jose"
import { compare } from 'bcryptjs'

// Ensure these environment variables are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

async function testAuthentication() {
  console.log('Testing authentication flow...')
  
  try {
    // Get super admin user
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, role, full_name, password')
      .eq('username', 'superadmin')
      .eq('is_active', true)
      .single()
    
    if (error || !user) {
      console.error('Error fetching super admin user:', error)
      return
    }
    
    console.log('Super admin user found:')
    console.log('Username:', user.username)
    console.log('Role:', user.role)
    console.log('ID:', user.id)
    
    // Test JWT token creation
    const token = await new SignJWT({ userId: user.id, username: user.username, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(secret)
    
    console.log('JWT token created successfully')
    
    // Test token verification
    const { payload } = await jwtVerify(token, secret)
    console.log('Token verified successfully')
    console.log('Payload:', payload)
    
    // Check role comparison
    console.log('Role comparison:')
    console.log('user.role === "super_admin":', user.role === "super_admin")
    console.log('payload.role === "super_admin":', payload.role === "super_admin")
    
  } catch (error) {
    console.error('Error in authentication test:', error)
  }
}

// Function to verify JWT token (copied from middleware)
async function jwtVerify(token, secret) {
  try {
    const { payload } = await new SignJWT().jwtVerify(token, secret)
    return {
      payload
    }
  } catch (error) {
    return null
  }
}

testAuthentication()