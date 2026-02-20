import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const usePreferencesStore = create((set, get) => ({
    theme: 'light',
    backgroundColor: null,
    backgroundGradient: null,
    settingsOpen: false,

    toggleSettings: () => set(state => ({ settingsOpen: !state.settingsOpen })),
    closeSettings: () => set({ settingsOpen: false }),

    loadPreferences: async (userId) => {
        // Try localStorage first for instant load
        const cached = localStorage.getItem('notesync_prefs')
        if (cached) {
            const prefs = JSON.parse(cached)
            set({
                theme: prefs.theme || 'light',
                backgroundColor: prefs.backgroundColor,
                backgroundGradient: prefs.backgroundGradient
            })
            get().applyTheme(prefs.theme || 'light')
        }

        // Then sync from Supabase
        const { data } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (data) {
            const prefs = {
                theme: data.theme || 'light',
                backgroundColor: data.background_color,
                backgroundGradient: data.background_gradient
            }
            set(prefs)
            localStorage.setItem('notesync_prefs', JSON.stringify(prefs))
            get().applyTheme(prefs.theme)
        }
    },

    savePreferences: async (userId, updates) => {
        set(updates)

        const state = get()
        const prefs = {
            theme: state.theme,
            backgroundColor: state.backgroundColor,
            backgroundGradient: state.backgroundGradient
        }
        localStorage.setItem('notesync_prefs', JSON.stringify(prefs))

        if (updates.theme) get().applyTheme(updates.theme)

        await supabase
            .from('user_preferences')
            .upsert({
                user_id: userId,
                theme: state.theme,
                background_color: state.backgroundColor,
                background_gradient: state.backgroundGradient,
                updated_at: new Date().toISOString()
            })
    },

    applyTheme: (theme) => {
        const root = document.documentElement
        if (theme === 'dark') {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }
    }
}))
