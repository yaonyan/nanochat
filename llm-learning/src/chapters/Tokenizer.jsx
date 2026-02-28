import { useState } from 'react'
import CodeBlock from '../components/CodeBlock'
import Callout from '../components/Callout'
import InteractiveDemo from '../components/InteractiveDemo'
import DiagramBox from '../components/DiagramBox'
import Quiz from '../components/Quiz'
import { useTheme } from '../context/ThemeContext'

function TokenizerDemo() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [input, setInput] = useState('Hello, world! How are you?')

  const simpleTokenize = (text) => {
    const commonTokens = {
      'Hello': 15496, ',': 11, ' world': 995, '!': 0, ' How': 1374,
      ' are': 389, ' you': 345, '?': 30, 'The': 464, ' ': 220,
      'a': 64, 'b': 65, 'c': 66, 'e': 68, 'h': 71, 'i': 72,
      'l': 75, 'n': 77, 'o': 78, 'r': 81, 't': 83, 'w': 86,
    }
    const tokens = []
    let remaining = text
    while (remaining.length > 0) {
      let bestMatch = ''
      let bestId = -1
      for (const [token, id] of Object.entries(commonTokens)) {
        if (remaining.startsWith(token) && token.length > bestMatch.length) {
          bestMatch = token
          bestId = id
        }
      }
      if (bestMatch) {
        tokens.push({ text: bestMatch, id: bestId })
        remaining = remaining.slice(bestMatch.length)
      } else {
        const char = remaining[0]
        tokens.push({ text: char, id: char.charCodeAt(0) })
        remaining = remaining.slice(1)
      }
    }
    return tokens
  }

  const tokens = simpleTokenize(input)
  const colors = isDark
    ? [
        'bg-sky-500/15 text-sky-300 border-sky-600/25',
        'bg-slate-500/15 text-slate-300 border-slate-500/25',
        'bg-teal-500/15 text-teal-300 border-teal-600/25',
        'bg-zinc-500/15 text-zinc-300 border-zinc-500/25',
        'bg-cyan-500/15 text-cyan-300 border-cyan-600/25',
        'bg-gray-500/15 text-gray-300 border-gray-500/25',
        'bg-emerald-500/15 text-emerald-300 border-emerald-600/25',
        'bg-stone-500/15 text-stone-300 border-stone-500/25',
        'bg-sky-500/15 text-sky-300 border-sky-600/25',
        'bg-neutral-500/15 text-neutral-300 border-neutral-500/25',
      ]
    : [
        'bg-sky-100 text-sky-700 border-sky-200',
        'bg-slate-100 text-slate-700 border-slate-200',
        'bg-teal-100 text-teal-700 border-teal-200',
        'bg-zinc-100 text-zinc-700 border-zinc-200',
        'bg-cyan-100 text-cyan-700 border-cyan-200',
        'bg-gray-100 text-gray-700 border-gray-200',
        'bg-emerald-100 text-emerald-700 border-emerald-200',
        'bg-stone-100 text-stone-700 border-stone-200',
        'bg-sky-100 text-sky-700 border-sky-200',
        'bg-neutral-100 text-neutral-700 border-neutral-200',
      ]

  return (
    <div>
      <label htmlFor="tokenizer-input" className={`text-sm block mb-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Type some text to see how it gets tokenized:</label>
      <input
        id="tokenizer-input"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400/40 transition-colors ${
          isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-slate-300 text-slate-800'
        }`}
        placeholder="Type anything..."
      />
      <div className="mt-4 flex flex-wrap gap-1.5">
        {tokens.map((t, i) => (
          <span
            key={i}
            className={`inline-flex flex-col items-center px-2 py-1 rounded-lg border text-xs ${colors[i % colors.length]}`}
          >
            <span className="font-mono">{JSON.stringify(t.text)}</span>
            <span className="text-[10px] opacity-60">id: {t.id}</span>
          </span>
        ))}
      </div>
      <p className={`text-xs mt-3 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
        {tokens.length} tokens | This is a simplified demo — real BPE tokenizers learn merge rules from a large corpus.
      </p>
    </div>
  )
}

function BPESteps() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [step, setStep] = useState(0)
  const steps = [
    { title: 'Start: Character-level', tokens: ['l', 'o', 'w', 'e', 'r', ' ', 'l', 'o', 'w', 'e', 's', 't'], highlight: [], desc: 'We begin with individual characters as tokens.' },
    { title: 'Find most frequent pair: ("l","o") → merge!', tokens: ['lo', 'w', 'e', 'r', ' ', 'lo', 'w', 'e', 's', 't'], highlight: [0, 5], desc: 'Count all adjacent pairs. ("l","o") appears 2 times — merge them into "lo".' },
    { title: 'Find most frequent pair: ("lo","w") → merge!', tokens: ['low', 'e', 'r', ' ', 'low', 'e', 's', 't'], highlight: [0, 4], desc: 'Now ("lo","w") appears 2 times — merge into "low".' },
    { title: 'Find most frequent pair: ("low","e") → merge!', tokens: ['lowe', 'r', ' ', 'lowe', 's', 't'], highlight: [0, 3], desc: 'Continue merging the most frequent pairs. "lowe" is now a single token.' },
    { title: 'Final vocabulary', tokens: ['lower', ' ', 'lowest'], highlight: [0, 2], desc: 'After enough merges, common words become single tokens. Each token gets an integer ID.' },
  ]
  const current = steps[step]

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{current.title}</span>
        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Step {step + 1}/{steps.length}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4 min-h-[3rem] items-center">
        {current.tokens.map((t, i) => (
          <span
            key={i}
            className={`px-3 py-2 rounded-lg border text-sm font-mono transition-all ${
              current.highlight.includes(i)
                ? isDark
                  ? 'bg-sky-900/30 border-sky-700/40 text-sky-200 scale-105'
                  : 'bg-sky-50 border-sky-300 text-sky-800 scale-105'
                : isDark
                  ? 'bg-gray-800/60 border-gray-700 text-gray-300'
                  : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            {JSON.stringify(t)}
          </span>
        ))}
      </div>
      <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{current.desc}</p>
      <div className="flex gap-2">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className={`px-4 py-2 rounded-lg text-sm disabled:opacity-30 cursor-pointer transition-colors ${
            isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          ← Back
        </button>
        <button
          onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
          disabled={step === steps.length - 1}
          className={`px-4 py-2 rounded-lg text-sm disabled:opacity-30 cursor-pointer transition-colors ${
            isDark
              ? 'bg-gray-700/50 border border-gray-600/50 text-gray-300 hover:bg-gray-700'
              : 'bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  )
}

export default function Tokenizer() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div>
      <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Tokenization</h1>
      <p className={`mb-8 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Converting raw text into numbers the model can process</p>

      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        Computers work with numbers, not text. The first step is converting text into a sequence
        of integer <strong>token IDs</strong>. nanochat uses <strong>Byte Pair Encoding (BPE)</strong>,
        following a GPT-4-style approach with one deliberate split-pattern deviation.
      </p>

      <Callout type="key">
        <strong>BPE</strong> works by starting with individual characters (or bytes), then iteratively merging
        the most frequent adjacent pairs. Common words become single tokens, while rare words are split into subwords.
        This gives a nice balance: common patterns are efficient, but any text can be represented.
      </Callout>

      <InteractiveDemo title="Watch BPE in action">
        <BPESteps />
      </InteractiveDemo>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>The Split Pattern</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        Before BPE merging, the text is pre-split using a GPT-4-style regex pattern (with one deliberate difference: numbers are split as 1-2 digits here).
        This prevents merges across word boundaries:
      </p>

      <CodeBlock
        filename="nanochat/tokenizer.py"
        startLine={30}
        code={`SPLIT_PATTERN = r"""'(?i:[sdmt]|ll|ve|re)|[^\\r\\n\\p{L}\\p{N}]?+\\p{L}+|\\p{N}{1,2}| ?[^\\s\\p{L}\\p{N}]++[\\r\\n]*|\\s*[\\r\\n]|\\s+(?!\\S)|\\s+"""`}
      />

      <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
        This regex splits text into: contractions (<code>'ll</code>, <code>'ve</code>), words, numbers (1-2 digits),
        punctuation, and whitespace — keeping the tokenizer from creating weird cross-boundary tokens.
      </p>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Special Tokens</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        Beyond regular text tokens, nanochat defines special control tokens for structuring conversations:
      </p>

      <CodeBlock
        filename="nanochat/tokenizer.py"
        startLine={13}
        code={`SPECIAL_TOKENS = [
    "<|bos|>",              # Beginning of Sequence — delimits documents
    "<|user_start|>",       # User message start
    "<|user_end|>",         # User message end
    "<|assistant_start|>",  # Assistant message start
    "<|assistant_end|>",    # Assistant message end
    "<|python_start|>",     # Python REPL tool call start
    "<|python_end|>",       # Python REPL tool call end
    "<|output_start|>",     # Python output start
    "<|output_end|>",       # Python output end
]`}
      />

      <Callout type="info">
        The <code>&lt;|bos|&gt;</code> token is prepended at the start of every document during training.
        During chat, the conversation structure tokens let the model learn turn-taking between user and assistant.
      </Callout>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Vocabulary Size</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        nanochat uses a vocabulary of <strong>32,768 tokens</strong>. This means every piece of text
        is encoded as a sequence of integers from 0 to 32,767.
      </p>

      <DiagramBox label="From text to model input">
        <div className="flex flex-col gap-3 text-sm">
          {[
            { label: 'Text:', value: '"The sky is blue"', color: isDark ? 'text-gray-200' : 'text-slate-800' },
            { label: '↓ split:', value: '["The", " sky", " is", " blue"]', color: isDark ? 'text-gray-300' : 'text-slate-700' },
            { label: '↓ lookup:', value: '[464, 6766, 318, 4171]', color: isDark ? 'text-gray-200' : 'text-slate-800' },
            { label: '↓ tensor:', value: 'torch.tensor([[464, 6766, 318, 4171]])', color: isDark ? 'text-gray-300' : 'text-slate-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-3">
              <span className={`w-20 text-right ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{label}</span>
              <span className={`font-mono ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      </DiagramBox>

      <InteractiveDemo title="Try tokenizing text">
        <TokenizerDemo />
      </InteractiveDemo>

      <Quiz
        question="Why does BPE use subword tokenization instead of just whole words?"
        options={[
          "It's faster to process subwords",
          "It provides a fixed vocabulary that can handle any text, including rare/unseen words",
          "Subwords are easier for the model to learn",
          "Whole word tokenization uses less memory",
        ]}
        correctIndex={1}
        explanation="BPE provides a fixed-size vocabulary that can represent ANY text — common words become single tokens for efficiency, while rare/unknown words get broken into known subword pieces. This eliminates the 'unknown token' problem of whole-word approaches."
      />

      <Quiz
        question="In nanochat's tokenizer, what does the <|bos|> token do?"
        options={[
          "It marks the end of a sentence",
          "It signals that a Python tool is being called",
          "It marks the beginning of a new document/sequence",
          "It separates user and assistant messages",
        ]}
        correctIndex={2}
        explanation="<|bos|> stands for 'Beginning of Sequence'. It's prepended at the start of every document during training. This tells the model that a new context is starting, so it shouldn't try to attend to content from a previous document."
      />
    </div>
  )
}
