import { useNoteStore } from '../stores/noteStore'
import NoteCard from './NoteCard'
import { HiOutlineDocumentPlus } from 'react-icons/hi2'
import { useAuthStore } from '../stores/authStore'

export default function NotesList() {
    const notes = useNoteStore(s => s.notes)
    const searchQuery = useNoteStore(s => s.searchQuery)
    const createNote = useNoteStore(s => s.createNote)
    const openEditor = useNoteStore(s => s.openEditor)
    const selectedNote = useNoteStore(s => s.selectedNote)
    const user = useAuthStore(s => s.user)

    const filteredNotes = searchQuery.trim()
        ? notes.filter(n =>
            n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.body?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : notes

    const handleCreateNote = async () => {
        const note = await createNote(user.id)
        if (note) openEditor(note)
    }

    if (filteredNotes.length === 0 && !searchQuery) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6 animate-fade-in flex-1">
                <div className="w-16 h-16 rounded-2xl mb-5 flex items-center justify-center"
                    style={{
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))'
                    }}>
                    <HiOutlineDocumentPlus className="w-8 h-8 text-primary-400" />
                </div>
                <h2 className="text-base font-semibold text-surface-600 dark:text-surface-300 mb-1.5">
                    No notes yet
                </h2>
                <p className="text-surface-400 dark:text-surface-500 mb-5 text-center text-sm max-w-[200px]">
                    Create your first note to get started
                </p>
                <button
                    onClick={handleCreateNote}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium cursor-pointer transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)'
                    }}
                    id="create-first-note-button"
                >
                    <HiOutlineDocumentPlus className="w-4 h-4" />
                    New Note
                </button>
            </div>
        )
    }

    if (filteredNotes.length === 0 && searchQuery) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6 animate-fade-in flex-1">
                <p className="text-surface-400 dark:text-surface-500 text-sm text-center">
                    No notes matching "<span className="font-medium text-surface-600 dark:text-surface-300">{searchQuery}</span>"
                </p>
            </div>
        )
    }

    return (
        <div className="notes-list flex-1 overflow-y-auto">
            {filteredNotes.map((note, i) => (
                <div key={note.id} style={{ animationDelay: `${i * 30}ms` }} className="animate-fade-in">
                    <NoteCard
                        note={note}
                        isSelected={selectedNote?.id === note.id}
                        onSelect={() => openEditor(note)}
                    />
                </div>
            ))}
        </div>
    )
}
