import { useTheme } from '../context/ThemeContext'

export default function DiagramBox({ children, label }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="my-8">
      {label && (
        <p className={`text-xs mb-2 text-center ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
          {label}
        </p>
      )}
      <div className={`border rounded-2xl p-6 overflow-x-auto transition-colors duration-200 ${
        isDark
          ? 'bg-gray-900/80 border-gray-800'
          : 'bg-slate-50/80 border-slate-200'
      }`}>
        {children}
      </div>
    </div>
  )
}
