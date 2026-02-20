import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set) => ({
    user: null,
    session: null,
    loading: true,

    initialize: () => {
        // Get current session first
        supabase.auth.getSession().then(({ data: { session } }) => {
            set({
                session,
                user: session?.user ?? null,
                loading: false
            })
        })

        // Listen for future auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
                    set({
                        session,
                        user: session?.user ?? null,
                        loading: false
                    })
                }
            }
        )

        return subscription
    },

    signInWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent'
                }
            }
        })
        if (error) console.error('Sign in error:', error)
    },

    signOut: async () => {
        await supabase.auth.signOut()
        localStorage.removeItem('gcal_access_token')
        set({ user: null, session: null })
    }
}))
