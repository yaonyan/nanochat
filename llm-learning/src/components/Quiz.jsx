import { useState } from 'react'
import { HelpCircle, CheckCircle2, XCircle } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function Quiz({ question, options, correctIndex, explanation }) {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const handleSelect = (i) => {
    if (revealed) return
    setSelected(i)
    setRevealed(true)
  }

  return (
    <div className={`my-8 rounded-2xl border p-6 transition-colors duration-200 ${
      isDark ? 'border-gray-800 bg-gray-900/40' : 'border-slate-200 bg-slate-50/50'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        <HelpCircle size={16} className={isDark ? 'text-gray-400' : 'text-slate-500'} />
        <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Quiz</span>
      </div>
      <p className={`mb-4 ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>{question}</p>
      <div className="space-y-2">
        {options.map((opt, i) => {
          let style = isDark
            ? 'border-gray-700 hover:border-gray-500 bg-gray-800/40'
            : 'border-slate-200 hover:border-slate-400 bg-white/60'
          if (revealed) {
            if (i === correctIndex) {
              style = isDark
                ? 'border-green-600/40 bg-green-950/30 text-green-300'
                : 'border-green-400 bg-green-50 text-green-800'
            } else if (i === selected) {
              style = isDark
                ? 'border-red-600/40 bg-red-950/30 text-red-300'
                : 'border-red-400 bg-red-50 text-red-800'
            }
          }
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ${style}`}
            >
              <span className={`font-mono mr-3 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          )
        })}
      </div>
      {revealed && (
        <div className={`mt-4 p-4 rounded-xl text-sm flex items-start gap-2 ${
          selected === correctIndex
            ? isDark ? 'bg-green-950/20 text-green-300' : 'bg-green-50 text-green-800'
            : isDark ? 'bg-amber-950/20 text-amber-300' : 'bg-amber-50 text-amber-800'
        }`}>
          {selected === correctIndex
            ? <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
            : <XCircle size={16} className="flex-shrink-0 mt-0.5" />
          }
          <span>
            {selected === correctIndex ? 'Correct! ' : 'Not quite. '}
            {explanation}
          </span>
        </div>
      )}
    </div>
  )
}
