import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { FcGoogle } from 'react-icons/fc'
import { HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineBell } from 'react-icons/hi2'

export default function Login() {
    const signInWithGoogle = useAuthStore(s => s.signInWithGoogle)
    const [hovering, setHovering] = useState(false)

    return (
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 30%, #312e81 60%, #1e293b 100%)'
            }}>

            {/* Background orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md animate-slide-up">
                {/* Logo + branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                        style={{
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)'
                        }}>
                        <span className="text-white text-2xl font-bold">N</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
                        NoteSync
                    </h1>
                    <p className="text-surface-400 text-lg">
                        Intelligent notes & tasks, perfectly synced
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl p-8 border border-white/10"
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(24px)'
                    }}>

                    {/* Features */}
                    <div className="space-y-4 mb-8">
                        {[
                            { icon: HiOutlineDocumentText, label: 'Rich notes with embedded tasks', color: '#818cf8' },
                            { icon: HiOutlineCheckCircle, label: 'Smart task tracking & highlights', color: '#34d399' },
                            { icon: HiOutlineBell, label: 'Google Calendar reminders', color: '#fbbf24' }
                        ].map(({ icon: Icon, label, color }, i) => (
                            <div key={i}
                                className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-white/5"
                                style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ background: `${color}20` }}>
                                    <Icon className="w-5 h-5" style={{ color }} />
                                </div>
                                <span className="text-surface-300 text-sm font-medium">{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Sign in button */}
                    <button
                        onClick={signInWithGoogle}
                        onMouseEnter={() => setHovering(true)}
                        onMouseLeave={() => setHovering(false)}
                        className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl font-semibold text-base transition-all duration-300 cursor-pointer"
                        style={{
                            background: hovering
                                ? 'linear-gradient(135deg, #ffffff, #f1f5f9)'
                                : '#ffffff',
                            color: '#1e293b',
                            boxShadow: hovering
                                ? '0 8px 30px rgba(255, 255, 255, 0.2)'
                                : '0 4px 14px rgba(0, 0, 0, 0.1)',
                            transform: hovering ? 'translateY(-1px)' : 'translateY(0)'
                        }}
                        id="google-sign-in-button"
                    >
                        <FcGoogle className="w-5 h-5" />
                        Continue with Google
                    </button>

                    <p className="text-center text-surface-500 text-xs mt-4">
                        Syncs across all your devices, instantly
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-surface-600 text-xs mt-6">
                    Built with ❤️ for productivity
                </p>
            </div>
        </div>
    )
}
