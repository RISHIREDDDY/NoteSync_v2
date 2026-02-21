import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useNoteStore } from '../stores/noteStore'
import { useTaskStore } from '../stores/taskStore'
import { useAuthStore } from '../stores/authStore'
import TaskItem from './TaskItem'
import ColorPicker from './ColorPicker'
import NotePopup from './NotePopup'
import { HiOutlinePlus, HiOutlineSwatch, HiXMark, HiMinus, HiArrowTopRightOnSquare } from 'react-icons/hi2'
import { openNotePopup, openPiPWindow } from '../lib/notePopupUtils'

export default function FloatingNoteWindow({ note }) {
    const updateNote = useNoteStore(s => s.updateNote)
    const closeFloat = useNoteStore(s => s.closeFloat)
    const tasks = useTaskStore(s => s.tasks)
    const fetchTasks = useTaskStore(s => s.fetchTasks)
    const createTask = useTaskStore(s => s.createTask)
    const user = useAuthStore(s => s.user)

    const [title, setTitle] = useState(note.title || '')
    const [body, setBody] = useState(note.body || '')
    const [newTaskLabel, setNewTask] = useState('')
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [minimized, setMinimized] = useState(false)
    const [pipWindow, setPipWindow] = useState(null)

    const [pos, setPos] = useState(() => ({
        x: 120 + Math.random() * 80,
        y: 80 + Math.random() * 80,
    }))

    const dragging = useRef(false)
    const dragOffset = useRef({ x: 0, y: 0 })
    const debounceRef = useRef(null)

    useEffect(() => { fetchTasks(note.id) }, [note.id, fetchTasks])

    useEffect(() => {
        setTitle(note.title || '')
        setBody(note.body || '')
    }, [note.title, note.body])

    const debouncedUpdate = useCallback((field, value) => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => { updateNote(note.id, { [field]: value }) }, 500)
    }, [note.id, updateNote])

    const handleTitleChange = e => { setTitle(e.target.value); debouncedUpdate('title', e.target.value) }
    const handleBodyChange = e => { setBody(e.target.value); debouncedUpdate('body', e.target.value) }
    const handleAddTask = async e => {
        e.preventDefault()
        if (!newTaskLabel.trim() || !user) return
        try {
            await createTask(note.id, user.id, newTaskLabel.trim())
            setNewTask('')
        } catch (err) {
            console.error('[FloatingNoteWindow] Failed to create task:', err)
        }
    }
    const handleColorChange = color => updateNote(note.id, { card_color: color })

    // ── Drag ──────────────────────────────────────────────────
    const onMouseDown = e => {
        if (e.target.closest('button') || e.target.closest('input')) return
        dragging.current = true
        dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
        e.preventDefault()
    }
    useEffect(() => {
        const onMove = e => { if (!dragging.current) return; setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y }) }
        const onUp = () => { dragging.current = false }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
        return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    }, [])

    // ── Hook: Document PiP ────────────────────────────────────
    const handleHook = async () => {
        const pip = await openPiPWindow(360, 440)
        if (!pip) {
            // Fallback: open as a separate browser popup window
            openNotePopup(note.id)
            closeFloat(note.id)
            return
        }
        setPipWindow(pip)
        pip.addEventListener('pagehide', () => setPipWindow(null))
    }
    const handleRelease = () => { pipWindow?.close(); setPipWindow(null) }

    // ── Pop-out: open as separate browser window ──────────────
    const handlePopOut = () => {
        openNotePopup(note.id)
        closeFloat(note.id) // close in-app float; note is now in its own window
    }

    const accentColor = note.card_color && note.card_color !== '#ffffff' ? note.card_color : '#6366f1'
    const noteTasks = tasks[note.id] || []

    return (
        <>
            <div
                className="floating-note"
                style={{ left: pos.x, top: pos.y, '--accent': accentColor }}
                id={`floating-note-${note.id}`}
            >
                {/* ── Header ── */}
                <div
                    className="floating-note-header"
                    onMouseDown={onMouseDown}
                    onDoubleClick={() => setMinimized(m => !m)}
                    title="Drag · Double-click to minimize"
                >
                    <div className="floating-note-accent" />
                    <div className="floating-note-header-content">
                        <input
                            className="floating-note-title"
                            value={title}
                            onChange={handleTitleChange}
                            placeholder="Untitled"
                            onMouseDown={e => e.stopPropagation()}
                        />
                        <div className="floating-note-controls">
                            {/* Color */}
                            <button onClick={() => setShowColorPicker(c => !c)} className="fn-ctrl-btn" title="Color">
                                <HiOutlineSwatch className="w-3.5 h-3.5" />
                            </button>
                            {/* Pop-out to browser window */}
                            <button onClick={handlePopOut} className="fn-ctrl-btn" title="Open in separate window">
                                <HiArrowTopRightOnSquare className="w-3.5 h-3.5" />
                            </button>
                            {/* 📌 Hook / 🔓 Release */}
                            {!pipWindow ? (
                                <button onClick={handleHook} className="fn-ctrl-btn" title="Hook — always on top">
                                    <span style={{ fontSize: 13 }}>📌</span>
                                </button>
                            ) : (
                                <button onClick={handleRelease} className="fn-ctrl-btn" title="Release PiP">
                                    <span style={{ fontSize: 13 }}>🔓</span>
                                </button>
                            )}
                            {/* Minimize */}
                            <button onClick={() => setMinimized(m => !m)} className="fn-ctrl-btn" title={minimized ? 'Expand' : 'Minimize'}>
                                <HiMinus className="w-3.5 h-3.5" />
                            </button>
                            {/* Close */}
                            <button onClick={() => closeFloat(note.id)} className="fn-ctrl-btn fn-ctrl-close" title="Close">
                                <HiXMark className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Color picker */}
                {showColorPicker && !minimized && (
                    <div className="floating-note-color-picker">
                        <ColorPicker value={note.card_color || '#ffffff'} onChange={handleColorChange} label="Card Color" />
                    </div>
                )}

                {/* Body */}
                {!minimized && (
                    <div className="floating-note-body">
                        <textarea
                            className="floating-note-textarea"
                            value={body}
                            onChange={handleBodyChange}
                            placeholder="Write your thoughts..."
                        />
                        {noteTasks.length > 0 && (
                            <div className="floating-note-tasks">
                                <p className="fn-tasks-label">TASKS</p>
                                <div className="space-y-1 mb-2">
                                    {noteTasks.map(t => <TaskItem key={t.id} task={t} />)}
                                </div>
                            </div>
                        )}
                        <form onSubmit={handleAddTask} className="fn-add-task">
                            <button type="submit" className="fn-add-task-btn" title="Add task">
                                <HiOutlinePlus className="w-3.5 h-3.5" />
                            </button>
                            <input
                                type="text"
                                value={newTaskLabel}
                                onChange={e => setNewTask(e.target.value)}
                                placeholder="Add a task..."
                                className="fn-add-task-input"
                            />
                        </form>
                    </div>
                )}

                {/* Native CSS resize:both handles resizing — no custom grip needed */}
            </div>

            {/* ── Document PiP portal ── */}
            {pipWindow && createPortal(
                <NotePopup note={note} />,
                pipWindow.document.body
            )}
        </>
    )
}
