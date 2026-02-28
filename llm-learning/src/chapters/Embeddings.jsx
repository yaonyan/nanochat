import { useState } from 'react'
import CodeBlock from '../components/CodeBlock'
import Callout from '../components/Callout'
import InteractiveDemo from '../components/InteractiveDemo'
import DiagramBox from '../components/DiagramBox'
import Quiz from '../components/Quiz'
import { useTheme } from '../context/ThemeContext'

function EmbeddingDemo() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [tokenId, setTokenId] = useState(464)
  const dim = 768

  const generateEmbedding = (id) => {
    const values = []
    let seed = id * 31 + 17
    for (let i = 0; i < 8; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      values.push(((seed / 0x7fffffff) * 2 - 1).toFixed(3))
    }
    return values
  }

  const embedding = generateEmbedding(tokenId)

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <label htmlFor="token-id-input" className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Token ID:</label>
        <input
          id="token-id-input"
          type="number"
          min={0}
          max={32767}
          value={tokenId}
          onChange={(e) => setTokenId(Math.min(32767, Math.max(0, parseInt(e.target.value) || 0)))}
          className={`w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400/40 ${
            isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-slate-300 text-slate-800'
          }`}
        />
        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>(0 to 32,767)</span>
      </div>

      <div className={`rounded-xl p-4 font-mono text-xs ${isDark ? 'bg-gray-800/50' : 'bg-slate-50'}`}>
        <p className={`mb-2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>embedding_table[{tokenId}] → vector of {dim} dimensions:</p>
        <div className="flex flex-wrap gap-1">
          {embedding.map((v, i) => (
            <span key={i} className={`px-2 py-1 rounded ${
              parseFloat(v) >= 0
                ? isDark ? 'text-green-400 bg-green-900/20' : 'text-green-700 bg-green-100'
                : isDark ? 'text-red-400 bg-red-900/20' : 'text-red-700 bg-red-100'
            }`}>
              {v}
            </span>
          ))}
          <span className={`px-2 py-1 ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>... ({dim - 8} more values)</span>
        </div>
      </div>

      <p className={`text-xs mt-3 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
        Each token ID maps to a unique {dim}-dimensional vector. These values are <strong>learned during training</strong> — they start random and encode meaning over time.
      </p>
    </div>
  )
}

function RoPEDemo() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [pos, setPos] = useState(0)

  const computeRoPE = (position, dims = 8) => {
    const base = 10000
    const pairs = []
    for (let i = 0; i < dims; i += 2) {
      const freq = 1.0 / Math.pow(base, i / dims)
      const angle = position * freq
      pairs.push({
        dim: `${i},${i + 1}`,
        freq: freq.toExponential(2),
        angle: angle.toFixed(3),
        cos: Math.cos(angle).toFixed(3),
        sin: Math.sin(angle).toFixed(3),
      })
    }
    return pairs
  }

  const pairs = computeRoPE(pos)

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <label htmlFor="rope-pos" className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Position in sequence:</label>
        <input
          id="rope-pos"
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(parseInt(e.target.value))}
          className="flex-1 accent-slate-500"
        />
        <span className={`text-sm font-mono w-8 text-right ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>{pos}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className={`border-b ${isDark ? 'text-gray-500 border-gray-800' : 'text-slate-400 border-slate-200'}`}>
              <th className="py-2 px-3 text-left">Dim pair</th>
              <th className="py-2 px-3 text-left">Frequency</th>
              <th className="py-2 px-3 text-left">Angle (rad)</th>
              <th className="py-2 px-3 text-left">cos(θ)</th>
              <th className="py-2 px-3 text-left">sin(θ)</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((p, i) => (
              <tr key={i} className={`border-b ${isDark ? 'border-gray-800/50' : 'border-slate-100'}`}>
                <td className={`py-2 px-3 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>{p.dim}</td>
                <td className={`py-2 px-3 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{p.freq}</td>
                <td className={`py-2 px-3 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>{p.angle}</td>
                <td className={`py-2 px-3 ${parseFloat(p.cos) >= 0 ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>{p.cos}</td>
                <td className={`py-2 px-3 ${parseFloat(p.sin) >= 0 ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>{p.sin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className={`text-xs mt-3 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
        Low-frequency dimensions (bottom rows) change slowly across positions — they encode <strong>coarse position</strong>.
        High-frequency dimensions (top rows) change rapidly — encoding <strong>fine position</strong>.
        Drag the slider to see how cos/sin values change.
      </p>
    </div>
  )
}

export default function Embeddings() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div>
      <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Embeddings & Positional Encoding</h1>
      <p className={`mb-8 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Giving meaning and position to tokens</p>

      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        Token IDs are just integers — they don't carry any information about meaning or relationships.
        The <strong>embedding layer</strong> converts each token ID into a dense vector that the neural
        network can work with.
      </p>

      <h2 className={`text-2xl font-semibold mt-10 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Token Embedding</h2>

      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        The embedding is simply a big lookup table: a matrix of shape
        <code className={`font-mono text-sm mx-1 ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>(vocab_size, n_embd)</code> — for example, in a common d12 setup this is
        <code className={`font-mono text-sm mx-1 ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>(32768, 768)</code>. Each row is an n_embd-dimensional vector
        representing one token.
      </p>

      <CodeBlock
        filename="nanochat/gpt.py"
        startLine={163}
        code={`self.transformer = nn.ModuleDict({
    "wte": nn.Embedding(padded_vocab_size, config.n_embd),
    "h": nn.ModuleList([Block(config, layer_idx) for layer_idx in range(config.n_layer)]),
})`}
      />

      <InteractiveDemo title="Explore the Embedding Table">
        <EmbeddingDemo />
      </InteractiveDemo>

      <Callout type="math">
        <p>Given a token ID <code>t</code>, the embedding lookup is:</p>
        <p className="font-mono mt-2 text-center text-lg">x = W_e[t] ∈ ℝ^n_embd</p>
        <p className="mt-2">This is just indexing row <code>t</code> from the embedding matrix W_e.
        After embedding, nanochat applies RMSNorm:</p>
        <p className="font-mono mt-2 text-center text-lg">x = RMSNorm(x)</p>
      </Callout>

      <CodeBlock
        filename="nanochat/gpt.py"
        startLine={400}
        code={`# Forward the trunk of the Transformer
x = self.transformer.wte(idx) # embed current token
x = norm(x)
x0 = x  # save initial normalized embedding for x0 residual`}
      />

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Rotary Positional Embeddings (RoPE)</h2>

      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        The model needs to know token <strong>positions</strong> — "the" at position 0 vs position 100 should
        behave differently. nanochat uses <strong>Rotary Position Embeddings (RoPE)</strong>, which encode position
        by <em>rotating</em> the query and key vectors in pairs of dimensions.
      </p>

      <Callout type="key">
        <strong>RoPE</strong> encodes position by rotating pairs of dimensions at different frequencies.
        Low-frequency rotations capture coarse position (nearby vs far), while high-frequency rotations
        encode fine-grained position. The key property: the dot product of two rotated vectors depends
        only on their <strong>relative distance</strong>, not absolute position.
      </Callout>

      <CodeBlock
        filename="nanochat/gpt.py"
        startLine={51}
        code={`def apply_rotary_emb(x, cos, sin):
    assert x.ndim == 4  # multihead attention
    d = x.shape[3] // 2
    x1, x2 = x[..., :d], x[..., d:] # split up last dim into two halves
    y1 = x1 * cos + x2 * sin        # rotate pairs of dims
    y2 = x1 * (-sin) + x2 * cos
    return torch.cat([y1, y2], 3)`}
      />

      <DiagramBox label="RoPE: Rotating dimension pairs">
        <div className="text-center text-sm">
          <div className="flex justify-center gap-8 mb-4">
            <div>
              <p className={`mb-1 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Before rotation:</p>
              <p className={`font-mono ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>[x₁, x₂]</p>
            </div>
            <div className="text-slate-500 font-bold text-2xl">→</div>
            <div>
              <p className={`mb-1 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>After rotation:</p>
              <p className={`font-mono ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>[x₁·cos(θ) + x₂·sin(θ), -x₁·sin(θ) + x₂·cos(θ)]</p>
            </div>
          </div>
          <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
            θ = position × frequency, where frequency = 1/10000^(2i/d) for dimension pair i
          </p>
        </div>
      </DiagramBox>

      <InteractiveDemo title="Explore RoPE frequencies">
        <RoPEDemo />
      </InteractiveDemo>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Pre-computing Rotary Embeddings</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        Since the cos/sin values only depend on position and dimension (not on the data), they are
        pre-computed once and cached:
      </p>

      <CodeBlock
        filename="nanochat/gpt.py"
        startLine={243}
        code={`def _precompute_rotary_embeddings(self, seq_len, head_dim, base=10000):
    # stride the channels
    channel_range = torch.arange(0, head_dim, 2, dtype=torch.float32)
    inv_freq = 1.0 / (base ** (channel_range / head_dim))
    # stride the time steps
    t = torch.arange(seq_len, dtype=torch.float32)
    # calculate the rotation frequencies at each (time, channel) pair
    freqs = torch.outer(t, inv_freq)
    cos, sin = freqs.cos(), freqs.sin()`}
      />

      <Callout type="info">
        nanochat pre-computes RoPE for 10× the sequence length as a buffer. This is tiny in memory
        and avoids recomputation. The embeddings are stored as registered buffers (not saved in checkpoints).
      </Callout>

      <Quiz
        question="Why does nanochat use Rotary Positional Embeddings instead of learned position embeddings?"
        options={[
          "They are faster to compute",
          "They allow the model to generalize to longer sequences and encode relative positions naturally",
          "They use less memory",
          "They are simpler to implement",
        ]}
        correctIndex={1}
        explanation="RoPE's key advantage is that the dot product between two rotated vectors depends only on their relative distance, not absolute position. This gives the model a natural sense of 'how far apart are these tokens' and can generalize better to unseen sequence lengths."
      />
    </div>
  )
}
