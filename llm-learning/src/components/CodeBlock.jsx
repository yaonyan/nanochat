import { useState, useEffect, useRef } from 'react'
import { Copy, Check, FileCode } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { createHighlighter } from 'shiki'

let highlighterPromise = null

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark-default', 'github-light-default'],
      langs: ['python', 'bash', 'javascript', 'json', 'text'],
    })
  }
  return highlighterPromise
}

// Eagerly start loading
getHighlighter()

export default function CodeBlock({ code, language = 'python', filename, startLine }) {
  const [copied, setCopied] = useState(false)
  const [html, setHtml] = useState('')
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const containerRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    getHighlighter().then((highlighter) => {
      if (cancelled) return
      const result = highlighter.codeToHtml(code.trim(), {
        lang: language,
        theme: isDark ? 'github-dark-default' : 'github-light-default',
      })
      setHtml(result)
    })
    return () => { cancelled = true }
  }, [code, language, isDark])

  const handleCopy = () => {
    navigator.clipboard.writeText(code.trim())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`rounded-xl overflow-hidden border my-6 transition-colors duration-200 ${
      isDark ? 'border-gray-800' : 'border-slate-200'
    }`}>
      {filename && (
        <div className={`flex items-center justify-between px-4 py-2 text-xs ${
          isDark ? 'bg-gray-800/80' : 'bg-slate-100'
        }`}>
          <span className={`font-mono flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            <FileCode size={12} />
            {filename}{startLine ? ` · lines ${startLine}+` : ''}
          </span>
          <button
            onClick={handleCopy}
            className={`cursor-pointer transition-colors ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-slate-400 hover:text-slate-600'}`}
            aria-label="Copy code"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
        </div>
      )}
      <div
        ref={containerRef}
        className="shiki-wrapper overflow-x-auto"
        dangerouslySetInnerHTML={html ? { __html: html } : undefined}
        style={!html ? {
          padding: '1.25rem',
          background: isDark ? '#0d1117' : '#f8fafc',
          minHeight: '3rem',
        } : undefined}
      />
    </div>
  )
}
