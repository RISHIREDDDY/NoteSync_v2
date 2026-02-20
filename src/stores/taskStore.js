import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { createCalendarEvent, deleteCalendarEvent } from '../lib/googleCalendar'

export const useTaskStore = create((set, get) => ({
    tasks: {},  // keyed by noteId: [tasks]

    fetchTasks: async (noteId) => {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('note_id', noteId)
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Fetch tasks error:', error)
            return
        }
        set(state => ({
            tasks: { ...state.tasks, [noteId]: data || [] }
        }))
    },

    fetchAllTasks: async (userId) => {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Fetch all tasks error:', error)
            return
        }
        const grouped = {}
        data?.forEach(task => {
            if (!grouped[task.note_id]) grouped[task.note_id] = []
            grouped[task.note_id].push(task)
        })
        set({ tasks: grouped })
    },

    createTask: async (noteId, userId, label) => {
        const { data, error } = await supabase
            .from('tasks')
            .insert({
                note_id: noteId,
                user_id: userId,
                label,
                is_completed: false
            })
            .select()
            .single()

        if (error) {
            console.error('Create task error:', error)
            return null
        }
        set(state => ({
            tasks: {
                ...state.tasks,
                [noteId]: [...(state.tasks[noteId] || []), data]
            }
        }))
        return data
    },

    updateTask: async (taskId, noteId, updates) => {
        const { error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', taskId)

        if (error) {
            console.error('Update task error:', error)
            return
        }
        set(state => ({
            tasks: {
                ...state.tasks,
                [noteId]: (state.tasks[noteId] || []).map(t =>
                    t.id === taskId ? { ...t, ...updates } : t
                )
            }
        }))
    },

    toggleTask: async (task) => {
        const newCompleted = !task.is_completed
        const updates = { is_completed: newCompleted }

        // Google Calendar integration
        try {
            if (newCompleted && task.gcal_event_id) {
                // Task completed → delete calendar event
                await deleteCalendarEvent(task.gcal_event_id)
                updates.gcal_event_id = null
            } else if (!newCompleted && task.due_at && !task.gcal_event_id) {
                // Task unchecked + has due date → recreate calendar event
                const event = await createCalendarEvent(task)
                updates.gcal_event_id = event.id
            }
        } catch (e) {
            console.warn('Google Calendar sync failed:', e)
        }

        await get().updateTask(task.id, task.note_id, updates)
    },

    setDueDate: async (task, dueAt) => {
        const updates = { due_at: dueAt }

        try {
            if (dueAt && !task.is_completed) {
                // Create/update calendar event
                if (task.gcal_event_id) {
                    await deleteCalendarEvent(task.gcal_event_id)
                }
                const event = await createCalendarEvent({ ...task, due_at: dueAt })
                updates.gcal_event_id = event.id
            } else if (!dueAt && task.gcal_event_id) {
                // Remove due date → delete calendar event
                await deleteCalendarEvent(task.gcal_event_id)
                updates.gcal_event_id = null
            }
        } catch (e) {
            console.warn('Google Calendar sync failed:', e)
        }

        await get().updateTask(task.id, task.note_id, updates)
    },

    deleteTask: async (taskId, noteId) => {
        const task = (get().tasks[noteId] || []).find(t => t.id === taskId)

        // Clean up calendar event
        if (task?.gcal_event_id) {
            try {
                await deleteCalendarEvent(task.gcal_event_id)
            } catch (e) {
                console.warn('Failed to delete calendar event:', e)
            }
        }

        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId)

        if (error) {
            console.error('Delete task error:', error)
            return
        }
        set(state => ({
            tasks: {
                ...state.tasks,
                [noteId]: (state.tasks[noteId] || []).filter(t => t.id !== taskId)
            }
        }))
    },

    getTaskCountForNote: (noteId) => {
        const tasks = get().tasks[noteId] || []
        const completed = tasks.filter(t => t.is_completed).length
        return { completed, total: tasks.length }
    },

    subscribeToChanges: (userId) => {
        const channel = supabase
            .channel('tasks-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
                (payload) => {
                    const { eventType, new: newRecord, old: oldRecord } = payload
                    set(state => {
                        const tasks = { ...state.tasks }
                        const noteId = newRecord?.note_id || oldRecord?.note_id

                        if (!noteId) return state

                        const noteTasks = [...(tasks[noteId] || [])]

                        if (eventType === 'INSERT') {
                            if (!noteTasks.find(t => t.id === newRecord.id)) {
                                noteTasks.push(newRecord)
                            }
                        } else if (eventType === 'UPDATE') {
                            const idx = noteTasks.findIndex(t => t.id === newRecord.id)
                            if (idx >= 0) noteTasks[idx] = newRecord
                            else noteTasks.push(newRecord)
                        } else if (eventType === 'DELETE') {
                            const idx = noteTasks.findIndex(t => t.id === oldRecord.id)
                            if (idx >= 0) noteTasks.splice(idx, 1)
                        }

                        tasks[noteId] = noteTasks
                        return { tasks }
                    })
                }
            )
            .subscribe()

        return () => supabase.removeChannel(channel)
    }
}))
