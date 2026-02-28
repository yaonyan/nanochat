import { Play } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function InteractiveDemo({ title, children }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`my-8 rounded-2xl border overflow-hidden transition-colors duration-200 ${
      isDark
        ? 'border-gray-800 bg-gray-900/60'
        : 'border-slate-200 bg-slate-50/60'
    }`}>
      <div className={`px-5 py-3 border-b flex items-center gap-2 ${
        isDark
          ? 'bg-gray-800/60 border-gray-800'
          : 'bg-slate-100/80 border-slate-200'
      }`}>
        <Play size={14} className={isDark ? 'text-gray-400' : 'text-slate-500'} />
        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Interactive Demo</span>
        <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>— {title}</span>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}
