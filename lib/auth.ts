import { supabase } from './supabase'
import type { User } from '../App'

export async function signUp(
  email: string,
  password: string,
  name: string,
  role: 'junior' | 'senior'
) {
  if (!supabase) {
    throw new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
      }
    }
  })
  
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  if (!supabase) {
    throw new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  return data
}

export async function signOut() {
  if (!supabase) return
  
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null
  
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 2000)
    })
    
    const userPromise = supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return null
      
      return {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        role: user.user_metadata?.role || 'junior',
      }
    })
    
    return await Promise.race([userPromise, timeoutPromise])
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  if (!supabase) return () => {}
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const user = await getCurrentUser()
      callback(user)
    } else {
      callback(null)
    }
  })
  
  return () => subscription.unsubscribe()
}

