import Callout from '../components/Callout'
import DiagramBox from '../components/DiagramBox'
import Quiz from '../components/Quiz'
import { useTheme } from '../context/ThemeContext'

export default function Overview() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div>
      <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>
        How LLMs Work Under the Hood
      </h1>
      <p className={`mb-8 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
        An interactive journey through a real LLM codebase — Karpathy's nanochat
      </p>

      <p className={`leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        Large Language Models (LLMs) like ChatGPT, Claude, and Gemini can write essays, answer questions, and code.
        But how do they actually work? In this interactive guide, we'll walk through <strong>every single piece</strong> of
        the machinery, using real code from <code className={`font-mono text-sm ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>nanochat</code> — an open-source,
        minimal implementation that trains an LLM from scratch for under $100.
      </p>

      <Callout type="key">
        An LLM is fundamentally a <strong>next-token predictor</strong>. Given a sequence of tokens (words/subwords),
        it predicts the probability distribution over what token comes next. That's it. All the "intelligence"
        emerges from doing this prediction really well over billions of training examples.
      </Callout>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>The Big Picture</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        Here's the full pipeline from raw text to a chatbot you can talk to:
      </p>

      <DiagramBox label="The LLM Pipeline">
        <div className="flex flex-col gap-3 text-sm font-mono">
          {[
            { step: '1', label: 'Tokenization', desc: 'Raw text → integer token IDs', file: 'tokenizer.py' },
            { step: '2', label: 'Embedding', desc: 'Token IDs → dense vectors + positional info', file: 'gpt.py (wte + RoPE)' },
            { step: '3', label: 'Transformer Layers', desc: 'Self-attention + MLP, repeated N times', file: 'gpt.py (Block)' },
            { step: '4', label: 'Output Head', desc: 'Final vectors → vocabulary probabilities', file: 'gpt.py (lm_head)' },
            { step: '5', label: 'Training', desc: 'Cross-entropy loss, backprop, Muon + AdamW optimizer', file: 'base_train.py + optim.py' },
            { step: '6', label: 'Inference', desc: 'Autoregressive token-by-token generation', file: 'engine.py' },
          ].map(({ step, label, desc, file }) => (
            <div key={step} className={`flex items-center gap-4 px-4 py-3 rounded-xl border ${
              isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-slate-200'
            }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                isDark ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-600'
              }`}>{step}</div>
              <div className="flex-1">
                <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>{label}</span>
                <span className={`ml-2 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>{desc}</span>
              </div>
              <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>{file}</span>
            </div>
          ))}
        </div>
      </DiagramBox>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>nanochat at a Glance</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        nanochat by Andrej Karpathy is "the simplest experimental harness for training LLMs". It trains a GPT-2 level model
        in ~3 hours on 8×H100 GPUs for about $72 — a task that cost ~$43,000 in 2019.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
        {[
          { label: 'Architecture', value: 'GPT + RoPE' },
          { label: 'Attention', value: 'Flash Attn 3' },
          { label: 'Optimizer', value: 'Muon + AdamW' },
          { label: 'Tokenizer', value: 'BPE (32K)' },
          { label: 'Activation', value: 'ReLU²' },
          { label: 'Norm', value: 'RMSNorm' },
          { label: 'Position', value: 'Rotary (RoPE)' },
          { label: 'Training', value: '~3h / 8×H100' },
        ].map(({ label, value }) => (
          <div key={label} className={`border rounded-xl p-4 text-center transition-colors ${
            isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-slate-50 border-slate-200'
          }`}>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{label}</p>
            <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>{value}</p>
          </div>
        ))}
      </div>

      <Callout type="code">
        The full nanochat model is defined in <code>nanochat/gpt.py</code> — only ~450 lines of code for
        the entire GPT architecture. The training loop is in <code>scripts/base_train.py</code>.
        This is what makes it great for learning!
      </Callout>

      <Quiz
        question="What is the fundamental task that an LLM is trained to do?"
        options={[
          "Understand human language deeply",
          "Predict the next token in a sequence",
          "Memorize all the text it has seen",
          "Generate random creative text",
        ]}
        correctIndex={1}
        explanation="LLMs are trained with a simple objective: given all the previous tokens, predict the next one. This is called 'next-token prediction' or 'causal language modeling'. All the apparent intelligence emerges from this simple task applied at massive scale."
      />

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>How to Use This Guide</h2>
      <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        Each chapter focuses on one piece of the LLM pipeline. You'll see:
      </p>
      <ul className={`list-disc list-inside mt-3 space-y-2 ml-4 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
        <li><strong className={isDark ? 'text-gray-200' : 'text-slate-800'}>Concepts</strong> — explained clearly with diagrams</li>
        <li><strong className={isDark ? 'text-gray-200' : 'text-slate-800'}>Real code</strong> — actual snippets from nanochat, with line numbers</li>
        <li><strong className={isDark ? 'text-gray-200' : 'text-slate-800'}>Interactive demos</strong> — try things out yourself</li>
        <li><strong className={isDark ? 'text-gray-200' : 'text-slate-800'}>Quizzes</strong> — test your understanding</li>
        <li><strong className={isDark ? 'text-gray-200' : 'text-slate-800'}>Math</strong> — the essential equations, explained step by step</li>
      </ul>
      <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
        Navigate through the chapters in order using the sidebar, or jump to any topic that interests you.
        Let's start with how raw text becomes numbers a model can understand →
      </p>
    </div>
  )
}
