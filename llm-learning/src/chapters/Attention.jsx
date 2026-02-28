import { useState, useMemo } from 'react'
import CodeBlock from '../components/CodeBlock'
import Callout from '../components/Callout'
import InteractiveDemo from '../components/InteractiveDemo'
import DiagramBox from '../components/DiagramBox'
import Quiz from '../components/Quiz'
import { useTheme } from '../context/ThemeContext'

function AttentionHeatmap() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const tokens = ['The', 'cat', 'sat', 'on', 'the', 'mat']

  const weights = useMemo(() => {
    const w = []
    for (let i = 0; i < tokens.length; i++) {
      const row = []
      let sum = 0
      for (let j = 0; j <= i; j++) {
        let val = 0.1
        if (j === 0) val = 0.3
        if (j === i) val = 0.4
        if (j === i - 1) val = 0.25
        if (tokens[j] === 'cat' && i > 1) val = 0.35
        row.push(val)
        sum += val
      }
      const normalized = row.map(v => v / sum)
      while (normalized.length < tokens.length) normalized.push(0)
      w.push(normalized)
    }
    return w
  }, [])

  const [hoveredCell, setHoveredCell] = useState(null)

  return (
    <div>
      <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
        Each row shows how much a token "attends to" all previous tokens. Future tokens are masked (causal attention).
      </p>
      <div className="overflow-x-auto">
        <div className="inline-block">
          <div className="flex ml-16">
            {tokens.map((t, i) => (
              <div key={i} className={`w-14 text-center text-xs font-mono pb-1 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{t}</div>
            ))}
          </div>
          {tokens.map((rowToken, i) => (
            <div key={i} className="flex items-center">
              <span className={`w-16 text-right text-xs font-mono pr-2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{rowToken}</span>
              {weights[i].map((w, j) => {
                const isHovered = hoveredCell && hoveredCell[0] === i && hoveredCell[1] === j
                const isMasked = j > i
                return (
                  <div
                    key={j}
                    className={`w-14 h-10 flex items-center justify-center text-[10px] font-mono cursor-pointer transition-shadow
                      ${isMasked ? (isDark ? 'bg-gray-900 text-gray-700' : 'bg-slate-100 text-slate-300') : ''}
                      ${isHovered ? 'ring-2 ring-sky-400' : ''}
                    `}
                    style={isMasked ? {} : {
                      backgroundColor: isDark ? `rgba(100, 116, 139, ${w})` : `rgba(71, 85, 105, ${w * 0.5})`,
                      color: w > 0.25 ? 'white' : (isDark ? 'rgba(156, 163, 175, 0.8)' : 'rgba(71, 85, 105, 0.8)'),
                      border: '1px solid ' + (isDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(226, 232, 240, 0.5)'),
                    }}
                    onMouseEnter={() => setHoveredCell([i, j])}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {isMasked ? '✗' : w.toFixed(2)}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      {hoveredCell && !(hoveredCell[1] > hoveredCell[0]) && (
        <p className={`text-xs mt-3 ${isDark ? 'text-sky-300' : 'text-sky-700'}`}>
          "{tokens[hoveredCell[0]]}" attends to "{tokens[hoveredCell[1]]}" with weight {weights[hoveredCell[0]][hoveredCell[1]].toFixed(3)}
        </p>
      )}
      <p className={`text-xs mt-3 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
        Hover over cells to inspect. ✗ = masked (can't look at future tokens).
        Row = query token, Column = key token.
      </p>
    </div>
  )
}

function MultiHeadDemo() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activeHead, setActiveHead] = useState(0)
  const heads = [
    { name: 'Head 0', pattern: 'Syntactic', desc: 'Focuses on adjacent tokens — captures local grammar patterns' },
    { name: 'Head 1', pattern: 'Positional', desc: 'Attends strongly to the first token (BOS) — captures document context' },
    { name: 'Head 2', pattern: 'Semantic', desc: 'Connects related nouns regardless of distance — captures meaning' },
    { name: 'Head 3', pattern: 'Copy', desc: 'Attends to tokens that match or are similar — enables repetition/reference' },
    { name: 'Head 4', pattern: 'Previous', desc: 'Always strongly attends to the immediately previous token' },
    { name: 'Head 5', pattern: 'Induction', desc: 'Looks for patterns: if A-B appeared before, after A predict B' },
  ]
  const head = heads[activeHead]

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {heads.map((h, i) => (
          <button
            key={i}
            onClick={() => setActiveHead(i)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              i === activeHead
                ? isDark
                  ? 'bg-white/[0.08] border border-gray-600 text-gray-200'
                  : 'bg-slate-200 border border-slate-300 text-slate-800'
                : isDark
                  ? 'bg-gray-800 text-gray-500 hover:text-gray-300'
                  : 'bg-slate-100 text-slate-500 hover:text-slate-700'
            }`}
          >
            {h.name}
          </button>
        ))}
      </div>
      <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-800/50' : 'bg-slate-50'}`}>
        <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{head.pattern} Pattern</p>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{head.desc}</p>
      </div>
      <p className={`text-xs mt-3 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
        Each head learns a different "type of relationship" between tokens. With 6 heads,
        the model can simultaneously track syntax, semantics, position, and more.
        The outputs of all heads are concatenated and projected back.
      </p>
    </div>
  )
}

export default function Attention() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div>
      <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Self-Attention</h1>
      <p className={`mb-8 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>The mechanism that lets tokens "talk to each other"</p>

      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        Self-attention is the core innovation that makes Transformers work. It allows each token
        to look at <em>all previous tokens</em> and decide which ones are relevant for predicting
        what comes next.
      </p>

      <Callout type="key">
        <strong>Self-attention</strong> computes three things for each token:
        <br />• <strong>Query (Q)</strong> — "What am I looking for?"
        <br />• <strong>Key (K)</strong> — "What do I contain?"
        <br />• <strong>Value (V)</strong> — "What information do I provide?"
        <br /><br />
        The attention score between tokens is Q·K (dot product). High scores mean "pay attention".
        The output is a weighted sum of V, where weights come from softmax(Q·K).
      </Callout>

      <h2 className={`text-2xl font-semibold mt-10 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>The Q, K, V Projections</h2>

      <CodeBlock filename="nanochat/gpt.py" startLine={69}
        code={`self.c_q = nn.Linear(self.n_embd, self.n_head * self.head_dim, bias=False)
self.c_k = nn.Linear(self.n_embd, self.n_kv_head * self.head_dim, bias=False)
self.c_v = nn.Linear(self.n_embd, self.n_kv_head * self.head_dim, bias=False)
self.c_proj = nn.Linear(self.n_embd, self.n_embd, bias=False)`}
      />

      <p className={`leading-relaxed mb-4 mt-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        Each input vector is projected three times to create Q, K, and V. Then they are reshaped
        into multiple "heads" (6 query heads, 6 key/value heads in nanochat):
      </p>

      <CodeBlock filename="nanochat/gpt.py" startLine={80}
        code={`# Project the input to get queries, keys, and values
# Shape: (B, T, H, D) - Flash Attention's native layout
q = self.c_q(x).view(B, T, self.n_head, self.head_dim)
k = self.c_k(x).view(B, T, self.n_kv_head, self.head_dim)
v = self.c_v(x).view(B, T, self.n_kv_head, self.head_dim)

# Apply Rotary Embeddings to queries and keys
q, k = apply_rotary_emb(q, cos, sin), apply_rotary_emb(k, cos, sin)
q, k = norm(q), norm(k) # QK norm`}
      />

      <DiagramBox label="Self-Attention Computation">
        <div className="flex flex-col gap-4 text-sm text-center">
          <div className="flex justify-center gap-6">
            <div className={`rounded-xl p-3 w-28 border ${isDark ? 'bg-cyan-900/30 border-cyan-700/30' : 'bg-cyan-50 border-cyan-200'}`}>
              <p className={isDark ? 'text-cyan-400 font-semibold' : 'text-cyan-700 font-semibold'}>Input x</p>
              <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>(B, T, 768)</p>
            </div>
          </div>
          <div className={isDark ? 'text-gray-500' : 'text-slate-400'}>↓ three linear projections</div>
          <div className="flex justify-center gap-4">
            {[
              { name: 'Q', dark: 'bg-sky-900/20 border-sky-800/30', light: 'bg-sky-50 border-sky-200', textD: 'text-sky-400', textL: 'text-sky-700' },
              { name: 'K', dark: 'bg-slate-800/40 border-slate-700/40', light: 'bg-slate-100 border-slate-200', textD: 'text-slate-300', textL: 'text-slate-700' },
              { name: 'V', dark: 'bg-emerald-900/20 border-emerald-800/30', light: 'bg-emerald-50 border-emerald-200', textD: 'text-emerald-400', textL: 'text-emerald-700' },
            ].map(({ name, dark, light, textD, textL }) => (
              <div key={name} className={`rounded-xl p-3 w-24 border ${isDark ? dark : light}`}>
                <p className={`font-semibold ${isDark ? textD : textL}`}>{name}</p>
                <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>(B,T,6,128)</p>
              </div>
            ))}
          </div>
          <div className={isDark ? 'text-gray-500' : 'text-slate-400'}>↓ Q·K^T / √d → softmax → mask future → ×V</div>
          <div className="flex justify-center">
            <div className={`rounded-xl p-3 w-36 border ${isDark ? 'bg-gray-800/60 border-gray-700/40' : 'bg-slate-100 border-slate-200'}`}>
              <p className={`font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Attention Output</p>
              <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>(B, T, 768)</p>
            </div>
          </div>
        </div>
      </DiagramBox>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Causal Masking</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        In language modeling, a token can only attend to <em>previous</em> tokens (and itself).
        It must not "see the future" — otherwise it would be cheating! This is enforced by a
        <strong> causal mask</strong> that sets future attention scores to -∞ before softmax.
      </p>

      <InteractiveDemo title="Visualize Causal Attention Weights">
        <AttentionHeatmap />
      </InteractiveDemo>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Multi-Head Attention</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        Instead of one big attention computation, we split into multiple <strong>heads</strong>.
        Each head operates on a slice of the embedding dimensions and can learn different patterns:
      </p>

      <InteractiveDemo title="Explore Attention Head Patterns">
        <MultiHeadDemo />
      </InteractiveDemo>

      <Callout type="math">
        <p className="font-mono text-center text-base mb-2">
          Attention(Q, K, V) = softmax(Q·K^T / √d_k) · V
        </p>
        <p>Where <code>d_k = 128</code> (head_dim = n_embd / n_head = 768/6). The √d_k scaling prevents
        the dot products from growing too large and saturating the softmax.</p>
      </Callout>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Flash Attention</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        The naive attention computation requires materializing the full T×T attention matrix — which is
        very expensive in memory. nanochat uses <strong>Flash Attention</strong>, which computes
        attention in <em>tiles</em> without materializing the full matrix:
      </p>

      <CodeBlock filename="nanochat/gpt.py" startLine={98}
        code={`# Flash Attention (FA3 on Hopper+, PyTorch SDPA fallback elsewhere)
if kv_cache is None:
    # Training: causal attention with optional sliding window
    y = flash_attn.flash_attn_func(q, k, v, causal=True, window_size=window_size)`}
      />

      <Callout type="info">
        Flash Attention doesn't change the math — the output is identical. It's a <strong>hardware-aware
        algorithm</strong> that uses GPU SRAM tiling to avoid memory bottlenecks. nanochat uses FA3
        on Hopper GPUs (H100) and falls back to PyTorch's SDPA on other hardware.
      </Callout>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Sliding Window Attention</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        nanochat also uses <strong>sliding window attention</strong> in some layers. Instead of attending
        to the full context, a layer only attends to the nearest N tokens. This saves compute while
        still maintaining quality (deeper layers use full attention):
      </p>

      <CodeBlock filename="nanochat/gpt.py" startLine={37}
        code={`# Sliding window attention pattern string, tiled across layers
# Characters: L=long (full context), S=short (half context)
# Examples: "L"=all full, "SL"=alternating, "SSL"=two short then one long
window_pattern: str = "SSSL"  # 3 short + 1 long, tiled`}
      />

      <Quiz
        question="Why does nanochat apply QK-norm (normalizing Q and K) before computing attention?"
        options={[
          "It makes the attention computation faster",
          "It ensures attention weights are always positive",
          "It prevents the dot products from exploding or vanishing, improving training stability",
          "It reduces the number of parameters",
        ]}
        correctIndex={2}
        explanation="QK-norm stabilizes training by keeping the scale of dot products consistent. Without normalization, Q and K vectors can grow large during training, causing attention logits to become extreme (near -∞ or +∞), which makes gradients vanish. Normalizing them keeps the dot products in a well-behaved range."
      />

      <Quiz
        question="In the 'SSSL' window pattern, what happens at the final layer?"
        options={[
          "It uses a short sliding window",
          "It always uses full context attention regardless of the pattern",
          "It skips attention entirely",
          "It uses the pattern letter assigned to it",
        ]}
        correctIndex={1}
        explanation="The final layer always gets full context attention (L), regardless of the pattern string. This ensures the model's output can attend to the entire input. Earlier layers can use shorter windows because intermediate representations don't need the full picture."
      />
    </div>
  )
}
