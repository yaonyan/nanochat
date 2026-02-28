import { Info, KeyRound, Code2, Puzzle, BarChart3 } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const variants = {
  info: {
    dark: 'bg-sky-950/20 border-sky-800/30',
    light: 'bg-sky-50/60 border-sky-200',
    icon: Info,
    label: 'Info',
    darkLabel: 'text-sky-400',
    lightLabel: 'text-sky-700',
    darkIcon: 'text-sky-400',
    lightIcon: 'text-sky-600',
  },
  key: {
    dark: 'bg-amber-950/20 border-amber-800/30',
    light: 'bg-amber-50/60 border-amber-200',
    icon: KeyRound,
    label: 'Key Concept',
    darkLabel: 'text-amber-400',
    lightLabel: 'text-amber-700',
    darkIcon: 'text-amber-400',
    lightIcon: 'text-amber-600',
  },
  code: {
    dark: 'bg-emerald-950/20 border-emerald-800/30',
    light: 'bg-emerald-50/60 border-emerald-200',
    icon: Code2,
    label: 'In nanochat',
    darkLabel: 'text-emerald-400',
    lightLabel: 'text-emerald-700',
    darkIcon: 'text-emerald-400',
    lightIcon: 'text-emerald-600',
  },
  quiz: {
    dark: 'bg-gray-800/30 border-gray-700/50',
    light: 'bg-slate-50 border-slate-200',
    icon: Puzzle,
    label: 'Think About It',
    darkLabel: 'text-gray-300',
    lightLabel: 'text-slate-700',
    darkIcon: 'text-gray-400',
    lightIcon: 'text-slate-500',
  },
  math: {
    dark: 'bg-gray-800/30 border-gray-700/50',
    light: 'bg-slate-50 border-slate-200',
    icon: BarChart3,
    label: 'Math',
    darkLabel: 'text-gray-300',
    lightLabel: 'text-slate-700',
    darkIcon: 'text-gray-400',
    lightIcon: 'text-slate-500',
  }
}

export default function Callout({ type = 'info', children }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const v = variants[type] || variants.info
  const Icon = v.icon

  return (
    <div className={`my-6 rounded-xl border p-5 transition-colors duration-200 ${isDark ? v.dark : v.light}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className={isDark ? v.darkIcon : v.lightIcon} />
        <span className={`text-sm font-semibold ${isDark ? v.darkLabel : v.lightLabel}`}>{v.label}</span>
      </div>
      <div className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        {children}
      </div>
    </div>
  )
}
