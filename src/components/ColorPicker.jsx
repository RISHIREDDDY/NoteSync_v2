import { useState } from 'react'

const PRESET_COLORS = [
    '#ffffff', '#f8fafc', '#fef3c7', '#fce7f3', '#dbeafe',
    '#d1fae5', '#ede9fe', '#fee2e2', '#ffedd5', '#e0e7ff',
    '#1e293b', '#312e81', '#831843', '#065f46', '#991b1b',
    '#92400e', '#1e3a5f', '#4c1d95', '#134e4a', '#6b21a8'
]

export default function ColorPicker({ value, onChange, label }) {
    const [customOpen, setCustomOpen] = useState(false)

    return (
        <div>
            {label && (
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    {label}
                </label>
            )}
            <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(color => (
                    <button
                        key={color}
                        onClick={() => onChange(color)}
                        className={`w-7 h-7 rounded-lg border-2 transition-all duration-150 cursor-pointer hover:scale-110 ${value === color
                                ? 'border-primary-500 ring-2 ring-primary-500/30 scale-110'
                                : 'border-surface-200 dark:border-surface-600'
                            }`}
                        style={{ backgroundColor: color }}
                    />
                ))}
                {/* Custom color input */}
                <div className="relative">
                    <button
                        onClick={() => setCustomOpen(!customOpen)}
                        className="w-7 h-7 rounded-lg border-2 border-dashed border-surface-300 dark:border-surface-600 flex items-center justify-center text-surface-400 text-xs font-bold cursor-pointer hover:border-primary-400 transition-all duration-150"
                    >
                        +
                    </button>
                    {customOpen && (
                        <input
                            type="color"
                            value={value || '#ffffff'}
                            onChange={e => onChange(e.target.value)}
                            className="absolute top-full left-0 mt-1 w-8 h-8 cursor-pointer"
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
