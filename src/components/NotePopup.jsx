import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useNoteStore } from '../stores/noteStore'
import { useTaskStore } from '../stores/taskStore'
import { useAuthStore } from '../stores/authStore'
import TaskItem from './TaskItem'
import ColorPicker from './ColorPicker'
import { HiOutlinePlus, HiOutlineSwatch, HiXMark } from 'react-icons/hi2'
import { openPiPWindow } from '../lib/notePopupUtils'

/**
 * NotePopup — a self-contained mini note editor.
 * Used in two contexts:
 *   1. As the main content of a popup browser window (App.jsx popup mode)
 *   2. As a React portal into a Document PiP window (from FloatingNoteWindow)
 *
 * Props:
 *   note       — note object
 *   onClose    — optional close handler (shown as × button)
 *   isPopupWindow — true when rendered as main page of a window.open() popup
 */
export default function NotePopup({ note, onClose, isPopupWindow = false, isPiPContent = false }) {
    const updateNote = useNoteStore(s => s.updateNote)
    const tasks = useTaskStore(s => s.tasks)
    const fetchTasks = useTaskStore(s => s.fetchTasks)
    const createTask = useTaskStore(s => s.createTask)
    const user = useAuthStore(s => s.user)

    const [title, setTitle] = useState(note?.title || '')
    const [body, setBody] = useState(note?.body || '')
    const [newTaskLabel, setNewTask] = useState('')
    const [showColor, setShowColor] = useState(false)
    const [pipWindow, setPipWindow] = useState(null)

    const debounceRef = useRef(null)

    useEffect(() => { if (note?.id) fetchTasks(note.id) }, [note?.id])

    // Keep local state in sync if note changes from outside (realtime)
    useEffect(() => {
        setTitle(note?.title || '')
        setBody(note?.body || '')
    }, [note?.title, note?.body])

    const debouncedSave = useCallback((field, value) => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            if (note?.id) updateNote(note.id, { [field]: value })
        }, 500)
    }, [note?.id, updateNote])

    const handleTitleChange = e => { setTitle(e.target.value); debouncedSave('title', e.target.value) }
    const handleBodyChange = e => { setBody(e.target.value); debouncedSave('body', e.target.value) }

    const handleAddTask = async e => {
        e.preventDefault()
        if (!newTaskLabel.trim() || !note || !user) return
        await createTask(note.id, user.id, newTaskLabel.trim())
        setNewTask('')
    }

    const handleColorChange = color => { if (note?.id) updateNote(note.id, { card_color: color }) }

    // ── Hook: open Document PiP (always-on-top) ──────────────────────────
    const handleHook = async () => {
        const pip = await openPiPWindow(360, 440)
        if (!pip) {
            // Browser doesn't support Document PiP → inform user via title bar flash
            alert('Your browser doesn\'t support Picture-in-Picture for pages.\nUse Chrome 116+ for "always on top" support.\n\nThe note is already open as a popup window you can position manually.')
            return
        }
        setPipWindow(pip)
        pip.addEventListener('pagehide', () => setPipWindow(null))
    }

    const handleRelease = () => {
        if (pipWindow) { pipWindow.close(); setPipWindow(null) }
    }

    if (!note) return null

    const accentColor = note.card_color && note.card_color !== '#ffffff' ? note.card_color : '#6366f1'
    const noteTasks = tasks[note.id] || []

    const editorUI = (
        <div className="note-popup-wrap" style={{ '--accent': accentColor }}>
            {/* ── Header ── */}
            <div className="note-popup-header">
                <div className="note-popup-accent" />
                <div className="note-popup-header-row">
                    <input
                        className="note-popup-title"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="Untitled"
                    />
                    <div className="note-popup-controls">
                        {/* Color */}
                        <button
                            onClick={() => setShowColor(c => !c)}
                            className="np-btn"
                            title="Change color"
                        >
                            <HiOutlineSwatch className="w-3.5 h-3.5" />
                        </button>

                        {/* 📌 Hook / 🔓 Release — hidden when already inside PiP */}
                        {!isPiPContent && (
                            !pipWindow ? (
                                <button
                                    onClick={handleHook}
                                    className="np-btn np-btn-hook"
                                    title="Hook — always on top (Chrome only)"
                                >
                                    📌
                                </button>
                            ) : (
                                <button
                                    onClick={handleRelease}
                                    className="np-btn np-btn-release"
                                    title="Release — exit always-on-top"
                                >
                                    🔓
                                </button>
                            )
                        )}

                        {/* Close — shown in popup window mode or when onClose provided */}
                        {(onClose || isPopupWindow) && (
                            <button
                                onClick={onClose || (() => window.close())}
                                className="np-btn np-btn-close"
                                title="Close"
                            >
                                <HiXMark className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Color picker ── */}
            {showColor && (
                <div className="note-popup-colorpicker">
                    <ColorPicker value={note.card_color || '#ffffff'} onChange={handleColorChange} label="Card Color" />
                </div>
            )}

            {/* ── Body ── */}
            <div className="note-popup-body">
                <textarea
                    className="note-popup-textarea"
                    value={body}
                    onChange={handleBodyChange}
                    placeholder="Write your thoughts..."
                />

                {noteTasks.length > 0 && (
                    <div className="note-popup-tasks">
                        <p className="np-tasks-label">TASKS</p>
                        <div className="space-y-1 mb-2">
                            {noteTasks.map(t => <TaskItem key={t.id} task={t} />)}
                        </div>
                    </div>
                )}

                <form onSubmit={handleAddTask} className="np-add-task">
                    <button type="submit" className="np-add-btn" title="Add task">
                        <HiOutlinePlus className="w-3.5 h-3.5" />
                    </button>
                    <input
                        type="text"
                        value={newTaskLabel}
                        onChange={e => setNewTask(e.target.value)}
                        placeholder="Add a task..."
                        className="np-add-input"
                    />
                </form>
            </div>

            {/* ── Document PiP portal — pass isPiPContent to break recursion ── */}
            {pipWindow && createPortal(
                <NotePopup note={note} isPiPContent />,
                pipWindow.document.body
            )}
        </div>
    )

    return editorUI
}
