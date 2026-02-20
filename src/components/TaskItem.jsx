import { useState, useRef } from 'react'
import { useTaskStore } from '../stores/taskStore'
import { HiOutlineTrash, HiOutlineCalendar } from 'react-icons/hi2'
import { format, isPast } from 'date-fns'

export default function TaskItem({ task }) {
    const toggleTask = useTaskStore(s => s.toggleTask)
    const setDueDate = useTaskStore(s => s.setDueDate)
    const updateTask = useTaskStore(s => s.updateTask)
    const deleteTask = useTaskStore(s => s.deleteTask)
    const [editing, setEditing] = useState(false)
    const [label, setLabel] = useState(task.label)
    const labelRef = useRef(null)

    const isOverdue = !task.is_completed && task.due_at && isPast(new Date(task.due_at))
    const isCompleted = task.is_completed

    let statusClass = ''
    if (isCompleted) statusClass = 'task-completed'
    else if (isOverdue) statusClass = 'task-overdue'

    const handleLabelBlur = () => {
        setEditing(false)
        if (label.trim() && label !== task.label) {
            updateTask(task.id, task.note_id, { label: label.trim() })
        }
    }

    const handleDueDateChange = (e) => {
        const value = e.target.value
        setDueDate(task, value ? new Date(value).toISOString() : null)
    }

    const formattedDue = task.due_at
        ? format(new Date(task.due_at), "MMM d, h:mm a")
        : null

    return (
        <div
            className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${statusClass}`}
            id={`task-item-${task.id}`}
        >
            {/* Checkbox */}
            <button
                onClick={() => toggleTask(task)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer ${isCompleted
                    ? 'bg-green-500 border-green-500'
                    : 'border-surface-300 dark:border-surface-600 hover:border-primary-400'
                    }`}
                id={`task-checkbox-${task.id}`}
            >
                {isCompleted && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </button>

            {/* Label */}
            <div className="flex-1 min-w-0">
                {editing ? (
                    <input
                        ref={labelRef}
                        type="text"
                        value={label}
                        onChange={e => setLabel(e.target.value)}
                        onBlur={handleLabelBlur}
                        onKeyDown={e => e.key === 'Enter' && labelRef.current?.blur()}
                        className="w-full bg-transparent text-sm text-surface-900 dark:text-surface-100 outline-none border-b border-primary-400 pb-0.5"
                        autoFocus
                    />
                ) : (
                    <span
                        onClick={() => setEditing(true)}
                        className={`text-sm cursor-text block truncate ${isCompleted
                            ? 'line-through text-surface-400 dark:text-surface-500'
                            : 'text-surface-800 dark:text-surface-200'
                            }`}
                    >
                        {task.label}
                    </span>
                )}

                {/* Due date display */}
                {formattedDue && (
                    <span className={`text-xs mt-0.5 block ${isOverdue
                        ? 'text-red-500 font-medium'
                        : 'text-surface-400 dark:text-surface-500'
                        }`}>
                        {isOverdue ? '⚠ Overdue: ' : ''}{formattedDue}
                    </span>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {/* Due date picker */}
                <div className="relative">
                    <input
                        type="datetime-local"
                        value={task.due_at ? new Date(task.due_at).toISOString().slice(0, 16) : ''}
                        onChange={handleDueDateChange}
                        className="absolute inset-0 w-8 h-8 opacity-0 cursor-pointer"
                        id={`task-due-date-${task.id}`}
                    />
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-primary-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-200">
                        <HiOutlineCalendar className="w-4 h-4" />
                    </div>
                </div>

                {/* Delete */}
                <button
                    onClick={() => deleteTask(task.id, task.note_id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 cursor-pointer"
                    id={`task-delete-${task.id}`}
                >
                    <HiOutlineTrash className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
