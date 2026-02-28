import { Menu, X, Sun, Moon, Github, MessageCircleQuestion } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function Sidebar({ chapters, activeChapter, setActiveChapter, isOpen, setIsOpen }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg cursor-pointer transition-colors ${
          isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-slate-600 hover:bg-slate-100 shadow-sm'
        }`}
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-40 h-screen w-72 flex flex-col
        transform transition-all duration-300 ease-out
        ${isDark
          ? 'bg-gray-900/95 border-r border-gray-800 backdrop-blur-sm'
          : 'bg-white/95 border-r border-slate-200 backdrop-blur-sm'
        }
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-gray-800' : 'border-slate-200'}`}>
          <h1 className={`text-xl font-bold tracking-tight ${isDark ? 'text-gray-100' : 'text-slate-800'}`}>
            LLM Under the Hood
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
            Interactive guide &middot; based on nanochat
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {chapters.map((chapter, i) => {
            const Icon = chapter.icon
            const isActive = activeChapter === chapter.id
            return (
              <button
                key={chapter.id}
                onClick={() => { setActiveChapter(chapter.id) }}
                className={`
                  w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 
                  flex items-center gap-3 cursor-pointer
                  ${isActive
                    ? isDark
                      ? 'bg-white/[0.06] text-gray-100'
                      : 'bg-slate-100 text-slate-900'
                    : isDark
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }
                `}
              >
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2 : 1.5}
                  className={`flex-shrink-0 transition-colors ${
                    isActive
                      ? isDark ? 'text-gray-200' : 'text-slate-700'
                      : isDark ? 'text-gray-500' : 'text-slate-400'
                  }`}
                />
                <span className="flex flex-col min-w-0">
                  <span className={`text-[10px] leading-tight ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>
                    Chapter {i + 1}
                  </span>
                  <span className="truncate">{chapter.title}</span>
                </span>
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between ${isDark ? 'border-gray-800' : 'border-slate-200'}`}>
          <a
            href="https://github.com/karpathy/nanochat"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${
              isDark ? 'text-gray-500 hover:text-gray-300' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Github size={14} />
            <span>nanochat</span>
          </a>

          <a
            href="https://deepwiki.com/karpathy/nanochat"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${
              isDark ? 'text-gray-500 hover:text-gray-300' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <MessageCircleQuestion size={14} />
            <span>Ask AI</span>
          </a>

          <button
            onClick={toggle}
            className={`p-2 rounded-lg cursor-pointer transition-all duration-200 ${
              isDark
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
