import { useTaskStore } from '../stores/taskStore'
import { useNoteStore } from '../stores/noteStore'
import { HiOutlineTrash } from 'react-icons/hi2'
import { format, isToday, isYesterday } from 'date-fns'

const EMPTY_TASKS = []

export default function NoteCard({ note, isSelected, onSelect }) {
    const deleteNote = useNoteStore(s => s.deleteNote)
    const tasks = useTaskStore(s => s.tasks[note.id]) || EMPTY_TASKS

    const completedCount = tasks.filter(t => t.is_completed).length
    const totalTasks = tasks.length

    const bodyPreview = note.body
        ? note.body.split('\n').slice(0, 2).join(' ').substring(0, 100)
        : ''

    const handleDelete = (e) => {
        e.stopPropagation()
        if (confirm('Delete this note and all its tasks?')) {
            deleteNote(note.id)
        }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        if (isToday(date)) return format(date, 'HH:mm')
        if (isYesterday(date)) return 'Yesterday'
        return format(date, 'd MMM')
    }

    const accentColor = note.card_color && note.card_color !== '#ffffff'
        ? note.card_color
        : '#6366f1'

    return (
        <div
            className={`note-list-item group relative cursor-pointer transition-all duration-200 ${isSelected ? 'note-list-item-active' : ''}`}
            onClick={onSelect}
            id={`note-card-${note.id}`}
        >
            {/* Colored accent bar */}
            <div
                className="note-accent-bar"
                style={{ backgroundColor: accentColor }}
            />

            {/* Content */}
            <div className="note-list-content">
                {/* Top row: title + date */}
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate flex-1">
                        {note.title || 'Untitled Note'}
                    </h3>
                    <span className="text-[11px] text-surface-400 dark:text-surface-500 shrink-0 mt-0.5">
                        {formatDate(note.updated_at)}
                    </span>
                </div>

                {/* Body preview */}
                {bodyPreview && (
                    <p className="text-xs text-surface-500 dark:text-surface-400 line-clamp-2 leading-relaxed mb-1.5">
                        {bodyPreview}
                    </p>
                )}

                {/* Bottom row: task badge */}
                {totalTasks > 0 && (
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400">
                            <span className="w-1.5 h-1.5 rounded-full" style={{
                                backgroundColor: completedCount === totalTasks ? '#22c55e' : '#6366f1'
                            }} />
                            {completedCount}/{totalTasks}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete button */}
            <button
                onClick={handleDelete}
                className="absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                id={`delete-note-${note.id}`}
            >
                <HiOutlineTrash className="w-3.5 h-3.5" />
            </button>
        </div>
    )
}
