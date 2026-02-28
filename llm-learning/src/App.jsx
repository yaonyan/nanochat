import { useState, useRef, useEffect } from 'react'
import { useTheme } from './context/ThemeContext'
import Sidebar from './components/Sidebar'
import Overview from './chapters/Overview'
import Tokenizer from './chapters/Tokenizer'
import Embeddings from './chapters/Embeddings'
import Attention from './chapters/Attention'
import TransformerBlock from './chapters/TransformerBlock'
import GPTModel from './chapters/GPTModel'
import Training from './chapters/Training'
import Inference from './chapters/Inference'
import RunProject from './chapters/RunProject'
import Serving from './chapters/Serving'
import {
  Brain, Type, Axis3D, Eye, Layers, Building2, Zap, MessageSquare, Rocket, Globe,
  ChevronLeft, ChevronRight
} from 'lucide-react'

const chapters = [
  { id: 'overview', title: 'How LLMs Work', icon: Brain, component: Overview },
  { id: 'tokenizer', title: 'Tokenization (BPE)', icon: Type, component: Tokenizer },
  { id: 'embeddings', title: 'Embeddings & Positional Encoding', icon: Axis3D, component: Embeddings },
  { id: 'attention', title: 'Self-Attention', icon: Eye, component: Attention },
  { id: 'transformer', title: 'Transformer Block', icon: Layers, component: TransformerBlock },
  { id: 'gpt-model', title: 'The Full GPT Model', icon: Building2, component: GPTModel },
  { id: 'training', title: 'Training & Optimization', icon: Zap, component: Training },
  { id: 'inference', title: 'Inference & Generation', icon: MessageSquare, component: Inference },
  { id: 'run-project', title: 'Run nanochat Yourself', icon: Rocket, component: RunProject },
  { id: 'serving', title: 'Serving & API Design', icon: Globe, component: Serving },
]

function App() {
  const { theme } = useTheme()
  const [activeChapter, setActiveChapter] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const mainRef = useRef(null)

  const ActiveComponent = chapters.find(c => c.id === activeChapter)?.component || Overview
  const currentIndex = chapters.findIndex(c => c.id === activeChapter)
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null

  const navigate = (id) => {
    setActiveChapter(id)
    if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={`flex h-screen transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-[#020617] text-gray-100'
        : 'bg-white text-slate-900'
    }`}>
      <Sidebar
        chapters={chapters}
        activeChapter={activeChapter}
        setActiveChapter={navigate}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <main ref={mainRef} className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-10 lg:px-10">
          <ActiveComponent />

          {/* Navigation footer */}
          <div className={`flex justify-between mt-16 pt-8 border-t ${
            theme === 'dark' ? 'border-gray-800' : 'border-slate-200'
          }`}>
            {prevChapter ? (
              <button
                onClick={() => navigate(prevChapter.id)}
                className={`group flex items-center gap-2 px-5 py-3 rounded-xl text-sm cursor-pointer transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-gray-800/60 hover:bg-gray-800 text-gray-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
                <span className={theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}>Prev:</span>
                {prevChapter.title}
              </button>
            ) : <div />}
            {nextChapter ? (
              <button
                onClick={() => navigate(nextChapter.id)}
                className={`group flex items-center gap-2 px-5 py-3 rounded-xl text-sm cursor-pointer transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-white/[0.06] hover:bg-white/[0.1] border border-gray-700/50 text-gray-300'
                    : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700'
                }`}
              >
                <span className={theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}>Next:</span>
                {nextChapter.title}
                <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            ) : <div />}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
