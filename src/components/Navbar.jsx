import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { usePreferencesStore } from '../stores/preferencesStore'
import { useNoteStore } from '../stores/noteStore'
import { HiOutlineMagnifyingGlass, HiOutlineSun, HiOutlineMoon, HiOutlineCog6Tooth, HiOutlinePlus } from 'react-icons/hi2'

export default function Navbar() {
    const user = useAuthStore(s => s.user)
    const theme = usePreferencesStore(s => s.theme)
    const savePreferences = usePreferencesStore(s => s.savePreferences)
    const toggleSettings = usePreferencesStore(s => s.toggleSettings)
    const searchQuery = useNoteStore(s => s.searchQuery)
    const setSearchQuery = useNoteStore(s => s.setSearchQuery)
    const createNote = useNoteStore(s => s.createNote)
    const openEditor = useNoteStore(s => s.openEditor)

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark'
        savePreferences(user.id, { theme: newTheme })
    }

    const handleCreateNote = async () => {
        const note = await createNote(user.id)
        if (note) openEditor(note)
    }

    const avatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture

    return (
        <div className="sidebar-header">
            {/* Top row: Logo + actions */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
                        }}>
                        <span className="text-white text-xs font-bold">N</span>
                    </div>
                    <span className="text-base font-bold text-surface-900 dark:text-white tracking-tight">
                        NoteSync
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    {/* New note */}
                    <button
                        onClick={handleCreateNote}
                        id="create-note-button"
                        className="p-1.5 rounded-lg text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-200 cursor-pointer hover:text-primary-500"
                        title="New Note"
                    >
                        <HiOutlinePlus className="w-5 h-5" />
                    </button>

                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        id="theme-toggle-button"
                        className="p-1.5 rounded-lg text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-200 cursor-pointer"
                        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {theme === 'dark'
                            ? <HiOutlineSun className="w-4.5 h-4.5" />
                            : <HiOutlineMoon className="w-4.5 h-4.5" />
                        }
                    </button>

                    {/* Settings */}
                    <button
                        onClick={toggleSettings}
                        id="settings-button"
                        className="p-1.5 rounded-lg text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-200 cursor-pointer"
                        title="Settings"
                    >
                        <HiOutlineCog6Tooth className="w-4.5 h-4.5" />
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                    type="search"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    id="search-notes-input"
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-sm bg-surface-100 dark:bg-surface-800/60 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 dark:placeholder:text-surface-500 border border-surface-200 dark:border-surface-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all duration-200"
                />
            </div>
        </div>
    )
}
