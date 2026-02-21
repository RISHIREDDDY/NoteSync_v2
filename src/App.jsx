import { useEffect, useRef, Component } from 'react'
import { useAuthStore } from './stores/authStore'
import { useNoteStore } from './stores/noteStore'
import { useTaskStore } from './stores/taskStore'
import { usePreferencesStore } from './stores/preferencesStore'
import Login from './components/Login'
import Navbar from './components/Navbar'
import NotesList from './components/NotesList'
import NoteEditor from './components/NoteEditor'
import SettingsDrawer from './components/SettingsDrawer'
import FloatingNoteWindow from './components/FloatingNoteWindow'
import NotePopup from './components/NotePopup'

// Error Boundary
class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', padding: '2rem', fontFamily: 'Inter, sans-serif',
                    background: '#0f172a', color: '#e2e8f0'
                }}>
                    <div style={{ maxWidth: '500px', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#ef4444' }}>
                            Something went wrong
                        </h1>
                        <pre style={{
                            background: '#1e293b', padding: '1rem', borderRadius: '0.5rem',
                            textAlign: 'left', fontSize: '0.8rem', overflow: 'auto', color: '#fbbf24'
                        }}>
                            {this.state.error?.message}
                        </pre>
                        <button onClick={() => window.location.reload()}
                            style={{
                                marginTop: '1rem', padding: '0.5rem 1.5rem', borderRadius: '0.5rem',
                                background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer'
                            }}>
                            Reload
                        </button>
                    </div>
                </div>
            )
        }
        return this.props.children
    }
}

function AppContent() {
    const user = useAuthStore(s => s.user)
    const loading = useAuthStore(s => s.loading)
    const backgroundColor = usePreferencesStore(s => s.backgroundColor)
    const backgroundGradient = usePreferencesStore(s => s.backgroundGradient)
    const floatingNotes = useNoteStore(s => s.floatingNotes)
    const notes = useNoteStore(s => s.notes)

    // Detect popup window mode: ?floatNote=<noteId>
    const floatNoteId = new URLSearchParams(window.location.search).get('floatNote')
    const initRef = useRef(false)
    const dataRef = useRef(false)

    // Initialize auth (only once)
    useEffect(() => {
        if (initRef.current) return
        initRef.current = true
        const subscription = useAuthStore.getState().initialize()
        return () => {
            if (subscription) subscription.unsubscribe()
        }
    }, [])

    // Load data when user becomes available
    useEffect(() => {
        if (!user) {
            dataRef.current = false
            return
        }
        if (dataRef.current) return
        dataRef.current = true

        const userId = user.id
        useNoteStore.getState().fetchNotes(userId)
        useTaskStore.getState().fetchAllTasks(userId)
        usePreferencesStore.getState().loadPreferences(userId)

        const unsubNotes = useNoteStore.getState().subscribeToChanges(userId)
        const unsubTasks = useTaskStore.getState().subscribeToChanges(userId)

        return () => {
            unsubNotes()
            unsubTasks()
            dataRef.current = false
        }
    }, [user?.id])

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a, #1e1b4b)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12, display: 'inline-flex',
                        alignItems: 'center', justifyContent: 'center',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        marginBottom: 16
                    }}>
                        <span style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>N</span>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: 14 }}>Loading NoteSync...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return <Login />
    }

    // ── Popup window mode ──────────────────────────────────────────────
    const bgStyle = {}
    if (backgroundGradient) bgStyle.background = backgroundGradient
    else if (backgroundColor) bgStyle.backgroundColor = backgroundColor

    if (floatNoteId) {
        const note = notes.find(n => n.id === floatNoteId)
        if (note) {
            return (
                <div style={{
                    height: '100vh',
                    background: 'var(--color-surface-50)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }} className={document.documentElement.className}>
                    <NotePopup note={note} isPopupWindow />
                </div>
            )
        }
        // Note not loaded yet — show loader while Supabase fetches
        return (
            <div style={{
                height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #0f172a, #1e1b4b)', color: '#94a3b8',
                fontFamily: 'Inter, sans-serif', fontSize: 14
            }}>
                Loading note...
            </div>
        )
    }


    return (
        <div className="app-layout" style={bgStyle}>
            {/* Left Sidebar */}
            <aside className="app-sidebar">
                <Navbar />
                <NotesList />
            </aside>

            {/* Right Editor Panel */}
            <main className="app-main">
                <NoteEditor />
            </main>

            <SettingsDrawer />

            {/* Floating pop-out note windows */}
            {floatingNotes.map(note => (
                <FloatingNoteWindow key={note.id} note={note} />
            ))}
        </div>
    )
}

export default function App() {
    return (
        <ErrorBoundary>
            <AppContent />
        </ErrorBoundary>
    )
}
