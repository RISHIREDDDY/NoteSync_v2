import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useNoteStore = create((set, get) => ({
    notes: [],
    searchQuery: '',
    selectedNote: null,
    editorOpen: false,
    floatingNotes: [],

    setSearchQuery: (query) => set({ searchQuery: query }),

    openEditor: (note = null) => set({ selectedNote: note, editorOpen: true }),
    closeEditor: () => set({ selectedNote: null, editorOpen: false }),

    popOut: (note) => set(state => {
        const alreadyOpen = state.floatingNotes.find(n => n.id === note.id)
        if (alreadyOpen) return {}
        return { floatingNotes: [...state.floatingNotes, note] }
    }),
    closeFloat: (noteId) => set(state => ({
        floatingNotes: state.floatingNotes.filter(n => n.id !== noteId)
    })),

    fetchNotes: async (userId) => {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })

        if (error) {
            console.error('Fetch notes error:', error)
            return
        }
        set({ notes: data || [] })
    },

    createNote: async (userId) => {
        const { data, error } = await supabase
            .from('notes')
            .insert({
                user_id: userId,
                title: 'Untitled Note',
                body: '',
                card_color: '#ffffff'
            })
            .select()
            .single()

        if (error) {
            console.error('Create note error:', error)
            return null
        }
        set(state => ({ notes: [data, ...state.notes] }))
        return data
    },

    updateNote: async (noteId, updates) => {
        const { error } = await supabase
            .from('notes')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', noteId)

        if (error) {
            console.error('Update note error:', error)
            return
        }
        set(state => ({
            notes: state.notes.map(n => n.id === noteId ? { ...n, ...updates } : n),
            selectedNote: state.selectedNote?.id === noteId
                ? { ...state.selectedNote, ...updates }
                : state.selectedNote
        }))
    },

    deleteNote: async (noteId) => {
        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', noteId)

        if (error) {
            console.error('Delete note error:', error)
            return
        }
        set(state => ({
            notes: state.notes.filter(n => n.id !== noteId),
            selectedNote: state.selectedNote?.id === noteId ? null : state.selectedNote,
            editorOpen: state.selectedNote?.id === noteId ? false : state.editorOpen,
            floatingNotes: state.floatingNotes.filter(n => n.id !== noteId)
        }))
    },

    subscribeToChanges: (userId) => {
        const channel = supabase
            .channel('notes-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${userId}` },
                (payload) => {
                    const { eventType, new: newRecord, old: oldRecord } = payload
                    set(state => {
                        let notes = [...state.notes]
                        if (eventType === 'INSERT') {
                            if (!notes.find(n => n.id === newRecord.id)) {
                                notes = [newRecord, ...notes]
                            }
                        } else if (eventType === 'UPDATE') {
                            notes = notes.map(n => n.id === newRecord.id ? newRecord : n)
                        } else if (eventType === 'DELETE') {
                            notes = notes.filter(n => n.id !== oldRecord.id)
                        }
                        return {
                            notes,
                            selectedNote: state.selectedNote?.id === newRecord?.id
                                ? newRecord
                                : state.selectedNote
                        }
                    })
                }
            )
            .subscribe()

        return () => supabase.removeChannel(channel)
    }
}))
