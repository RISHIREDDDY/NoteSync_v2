import { useState, useEffect, useRef, useCallback } from 'react'
import { useNoteStore } from '../stores/noteStore'
import { useTaskStore } from '../stores/taskStore'
import { useAuthStore } from '../stores/authStore'
import TaskItem from './TaskItem'
import ColorPicker from './ColorPicker'
import { HiOutlinePlus, HiOutlineSwatch, HiOutlineDocumentText, HiArrowTopRightOnSquare } from 'react-icons/hi2'
import { openNotePopup } from '../lib/notePopupUtils'

export default function NoteEditor() {
    const selectedNote = useNoteStore(s => s.selectedNote)
    const editorOpen = useNoteStore(s => s.editorOpen)
    const updateNote = useNoteStore(s => s.updateNote)
    const user = useAuthStore(s => s.user)
    const tasks = useTaskStore(s => s.tasks)
    const fetchTasks = useTaskStore(s => s.fetchTasks)
    const createTask = useTaskStore(s => s.createTask)
    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [newTaskLabel, setNewTaskLabel] = useState('')
    const [showColorPicker, setShowColorPicker] = useState(false)
    const titleRef = useRef(null)
    const debounceRef = useRef(null)

    useEffect(() => {
        if (selectedNote) {
            setTitle(selectedNote.title || '')
            setBody(selectedNote.body || '')
            setShowColorPicker(false)
            fetchTasks(selectedNote.id)
        }
    }, [selectedNote?.id])

    const debouncedUpdate = useCallback((field, value) => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            if (selectedNote) {
                updateNote(selectedNote.id, { [field]: value })
            }
        }, 500)
    }, [selectedNote, updateNote])

    const handleTitleChange = (e) => {
        setTitle(e.target.value)
        debouncedUpdate('title', e.target.value)
    }

    const handleBodyChange = (e) => {
        setBody(e.target.value)
        debouncedUpdate('body', e.target.value)
    }

    const handleAddTask = async (e) => {
        e.preventDefault()
        if (!newTaskLabel.trim() || !selectedNote) return
        await createTask(selectedNote.id, user.id, newTaskLabel.trim())
        setNewTaskLabel('')
    }

    const handleColorChange = (color) => {
        if (selectedNote) {
            updateNote(selectedNote.id, { card_color: color })
        }
    }

    // Empty state when no note is selected
    if (!editorOpen || !selectedNote) {
        return (
            <div className="editor-panel flex items-center justify-center">
                <div className="text-center animate-fade-in">
                    <div className="w-20 h-20 rounded-2xl mb-6 mx-auto flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08))'
                        }}>
                        <HiOutlineDocumentText className="w-10 h-10 text-surface-300 dark:text-surface-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-surface-400 dark:text-surface-500 mb-2">
                        Select a note
                    </h2>
                    <p className="text-sm text-surface-400 dark:text-surface-600">
                        Choose a note from the sidebar or create a new one
                    </p>
                </div>
            </div>
        )
    }

    const noteTasks = tasks[selectedNote.id] || []

    return (
        <div className="editor-panel" id="note-editor-panel">
            {/* Editor toolbar */}
            <div className="editor-toolbar">
                <div className="flex items-center gap-2">
                    <div
                        className="w-4 h-4 rounded-full border border-surface-200 dark:border-surface-600 cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: selectedNote.card_color || '#6366f1' }}
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        title="Change card color"
                    />
                    <span className="text-xs text-surface-400 dark:text-surface-500 font-medium">
                        {noteTasks.length > 0
                            ? `${noteTasks.filter(t => t.is_completed).length}/${noteTasks.length} tasks`
                            : 'No tasks'}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-200 cursor-pointer"
                        title="Card color"
                    >
                        <HiOutlineSwatch className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => selectedNote && openNotePopup(selectedNote.id)}
                        className="p-1.5 rounded-lg text-surface-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 cursor-pointer"
                        title="Open in separate window (pop-out)"
                        id="popout-note-btn"
                    >
                        <HiArrowTopRightOnSquare className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Color picker */}
            {showColorPicker && (
                <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-700/50 animate-fade-in">
                    <ColorPicker
                        value={selectedNote.card_color || '#ffffff'}
                        onChange={handleColorChange}
                        label="Card Color"
                    />
                </div>
            )}

            {/* Content */}
            <div className="editor-content">
                {/* Title */}
                <input
                    ref={titleRef}
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Note title..."
                    className="w-full text-2xl font-bold text-surface-900 dark:text-white bg-transparent outline-none placeholder:text-surface-300 dark:placeholder:text-surface-600 mb-4"
                    id="note-title-input"
                />

                {/* Body */}
                <textarea
                    value={body}
                    onChange={handleBodyChange}
                    placeholder="Write your thoughts..."
                    className="w-full text-sm text-surface-700 dark:text-surface-300 bg-transparent outline-none placeholder:text-surface-300 dark:placeholder:text-surface-600 resize-none leading-relaxed mb-6 flex-1"
                    style={{ minHeight: '200px' }}
                    id="note-body-textarea"
                />

                {/* Tasks section */}
                <div className="border-t border-surface-200 dark:border-surface-700/50 pt-4">
                    <h4 className="text-xs font-semibold text-surface-500 dark:text-surface-400 mb-3 uppercase tracking-wider">
                        Tasks
                    </h4>

                    {/* Task list */}
                    <div className="space-y-1 mb-3">
                        {noteTasks.map(task => (
                            <TaskItem key={task.id} task={task} />
                        ))}
                    </div>

                    {/* Add task */}
                    <form onSubmit={handleAddTask} className="flex items-center gap-2">
                        <button
                            type="submit"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 cursor-pointer shrink-0"
                        >
                            <HiOutlinePlus className="w-4 h-4" />
                        </button>
                        <input
                            type="text"
                            value={newTaskLabel}
                            onChange={e => setNewTaskLabel(e.target.value)}
                            placeholder="Add a task..."
                            className="flex-1 text-sm bg-transparent text-surface-700 dark:text-surface-300 outline-none placeholder:text-surface-400 dark:placeholder:text-surface-500 py-2"
                            id="add-task-input"
                        />
                    </form>
                </div>
            </div>
        </div>
    )
}
