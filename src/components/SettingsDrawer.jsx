import { useAuthStore } from '../stores/authStore'
import { usePreferencesStore } from '../stores/preferencesStore'
import { HiOutlineXMark, HiOutlineArrowRightOnRectangle, HiOutlineUser } from 'react-icons/hi2'

const GRADIENT_PRESETS = [
    null,
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #0c3483 0%, #a2b6df 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
]

const BG_COLORS = [
    null, '#f8fafc', '#f1f5f9', '#fef3c7', '#dbeafe',
    '#d1fae5', '#ede9fe', '#fee2e2', '#0f172a', '#1e1b4b'
]

export default function SettingsDrawer() {
    const user = useAuthStore(s => s.user)
    const signOut = useAuthStore(s => s.signOut)
    const settingsOpen = usePreferencesStore(s => s.settingsOpen)
    const closeSettings = usePreferencesStore(s => s.closeSettings)
    const theme = usePreferencesStore(s => s.theme)
    const backgroundColor = usePreferencesStore(s => s.backgroundColor)
    const backgroundGradient = usePreferencesStore(s => s.backgroundGradient)
    const savePreferences = usePreferencesStore(s => s.savePreferences)

    if (!settingsOpen) return null

    const handleThemeChange = (newTheme) => {
        savePreferences(user.id, { theme: newTheme })
    }

    const handleBgColor = (color) => {
        savePreferences(user.id, { backgroundColor: color, backgroundGradient: null })
    }

    const handleGradient = (gradient) => {
        savePreferences(user.id, { backgroundGradient: gradient, backgroundColor: null })
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
                onClick={closeSettings}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 bottom-0 z-50 w-80 max-w-[85vw] bg-white dark:bg-surface-900 shadow-2xl animate-slide-right border-l border-surface-200 dark:border-surface-700/50 flex flex-col"
                id="settings-drawer"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700/50">
                    <h2 className="text-lg font-bold text-surface-900 dark:text-white">Settings</h2>
                    <button
                        onClick={closeSettings}
                        className="p-2 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-200 cursor-pointer"
                        id="close-settings-button"
                    >
                        <HiOutlineXMark className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Account */}
                    <section>
                        <h3 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3">
                            Account
                        </h3>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                                    <HiOutlineUser className="w-5 h-5" />
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                                    {user?.user_metadata?.full_name || user?.email}
                                </p>
                                <p className="text-xs text-surface-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                    </section>

                    {/* Theme */}
                    <section>
                        <h3 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3">
                            Theme
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {['light', 'dark'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => handleThemeChange(t)}
                                    className={`p-3 rounded-xl text-sm font-medium capitalize transition-all duration-200 cursor-pointer border ${theme === t
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                        : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-surface-300 dark:hover:border-surface-600'
                                        }`}
                                    id={`theme-${t}-button`}
                                >
                                    {t === 'light' ? '☀️' : '🌙'} {t}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Background Color */}
                    <section>
                        <h3 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3">
                            Background Color
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {BG_COLORS.map((color, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleBgColor(color)}
                                    className={`w-8 h-8 rounded-lg border-2 transition-all duration-150 cursor-pointer hover:scale-110 ${backgroundColor === color && !backgroundGradient
                                        ? 'border-primary-500 ring-2 ring-primary-500/30 scale-110'
                                        : 'border-surface-200 dark:border-surface-600'
                                        }`}
                                    style={{ backgroundColor: color || (theme === 'dark' ? '#020617' : '#f8fafc') }}
                                    title={color ? color : 'Default'}
                                />
                            ))}
                        </div>
                    </section>

                    {/* Background Gradient */}
                    <section>
                        <h3 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3">
                            Background Gradient
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {GRADIENT_PRESETS.map((gradient, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleGradient(gradient)}
                                    className={`w-8 h-8 rounded-lg border-2 transition-all duration-150 cursor-pointer hover:scale-110 ${backgroundGradient === gradient
                                        ? 'border-primary-500 ring-2 ring-primary-500/30 scale-110'
                                        : 'border-surface-200 dark:border-surface-600'
                                        }`}
                                    style={{
                                        background: gradient || (theme === 'dark' ? '#020617' : '#f8fafc')
                                    }}
                                    title={gradient ? `Gradient ${i}` : 'None'}
                                />
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sign out */}
                <div className="p-4 border-t border-surface-200 dark:border-surface-700/50">
                    <button
                        onClick={signOut}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all duration-200 cursor-pointer"
                        id="sign-out-button"
                    >
                        <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    )
}
