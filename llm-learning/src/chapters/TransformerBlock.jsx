import { useState } from 'react'
import CodeBlock from '../components/CodeBlock'
import Callout from '../components/Callout'
import InteractiveDemo from '../components/InteractiveDemo'
import DiagramBox from '../components/DiagramBox'
import Quiz from '../components/Quiz'
import { useTheme } from '../context/ThemeContext'

function ResidualStreamDemo() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [numLayers, setNumLayers] = useState(4)
  const [showX0, setShowX0] = useState(true)

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <label htmlFor="layers-slider" className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Layers:</label>
        <input id="layers-slider" type="range" min={1} max={12} value={numLayers}
          onChange={(e) => setNumLayers(parseInt(e.target.value))} className="flex-1 accent-slate-500" />
        <span className={`text-sm font-mono ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>{numLayers}</span>
        <label className={`flex items-center gap-2 text-sm cursor-pointer ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
          <input type="checkbox" checked={showX0} onChange={(e) => setShowX0(e.target.checked)} className="accent-slate-500" />
          Show x0 skip
        </label>
      </div>
      <div className="flex items-start gap-2 overflow-x-auto pb-4">
        <div className="flex flex-col items-center flex-shrink-0">
          <div className={`w-20 h-10 border rounded-lg flex items-center justify-center text-xs font-mono ${
            isDark ? 'bg-cyan-900/40 border-cyan-700/40 text-cyan-300' : 'bg-cyan-50 border-cyan-200 text-cyan-700'
          }`}>embed</div>
          <div className={`w-0.5 h-4 ${isDark ? 'bg-gray-600' : 'bg-slate-300'}`} />
          <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>x₀</div>
          <div className={`w-0.5 h-4 ${isDark ? 'bg-gray-600' : 'bg-slate-300'}`} />
        </div>
        {Array.from({ length: numLayers }).map((_, i) => (
          <div key={i} className="flex flex-col items-center flex-shrink-0">
            <div className={`text-[9px] font-mono mb-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>λ_r={`{${(1.0).toFixed(1)}}`}</div>
            <div className="relative w-20">
              <div className={`w-20 h-10 border rounded-lg flex items-center justify-center text-xs ${
                isDark ? 'bg-sky-900/20 border-sky-800/30 text-sky-300' : 'bg-sky-50 border-sky-200 text-sky-700'
              }`}>Block {i}</div>
              {showX0 && (
                <div className={`absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>+λ₀·x₀</div>
              )}
            </div>
            <div className={`w-0.5 h-6 mt-1 ${isDark ? 'bg-gray-600' : 'bg-slate-300'}`} />
            <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>x_{i + 1}</div>
            <div className={`w-0.5 h-4 ${isDark ? 'bg-gray-600' : 'bg-slate-300'}`} />
          </div>
        ))}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className={`w-20 h-10 border rounded-lg flex items-center justify-center text-xs font-mono ${
            isDark ? 'bg-gray-800/60 border-gray-700/40 text-gray-300' : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>lm_head</div>
        </div>
      </div>
      <p className={`text-xs mt-4 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
        The "residual stream" flows left to right. Each block <strong>adds</strong> to it (never replaces).
        {showX0 && " The x₀ skip connection blends the original embedding back in at each layer — this helps gradients flow all the way back."}
      </p>
    </div>
  )
}

function ActivationDemo() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [inputVal, setInputVal] = useState(0.5)
  const relu = (x) => Math.max(0, x)
  const reluSq = (x) => Math.pow(relu(x), 2)

  const range = Array.from({ length: 41 }, (_, i) => (i - 20) / 10)

  return (
    <div>
      <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
        nanochat uses <strong>ReLU²</strong> (ReLU squared) as its activation function. Compare it to standard alternatives:
      </p>
      <div className="overflow-x-auto">
        <div className="flex items-end gap-0.5 h-32 mb-2">
          {range.map((x, i) => {
            const h1 = Math.max(0, reluSq(x) * 30)
            const h2 = Math.max(0, relu(x) * 30)
            return (
              <div key={i} className="flex items-end gap-px" style={{ width: '8px' }}>
                <div className="w-2 rounded-t" style={{ height: `${h1}px`, backgroundColor: isDark ? 'rgba(148, 163, 184, 0.5)' : 'rgba(71, 85, 105, 0.4)' }} title={`ReLU²(${x}) = ${reluSq(x).toFixed(2)}`} />
                <div className="w-2 rounded-t" style={{ height: `${h2}px`, backgroundColor: isDark ? 'rgba(52, 211, 153, 0.35)' : 'rgba(16, 185, 129, 0.3)' }} title={`ReLU(${x}) = ${relu(x).toFixed(2)}`} />
              </div>
            )
          })}
        </div>
        <div className={`flex justify-between text-[10px] font-mono ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>
          <span>-2.0</span><span>-1.0</span><span>0</span><span>1.0</span><span>2.0</span>
        </div>
      </div>
      <div className="flex gap-4 mt-3 text-xs">
        <span className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded ${isDark ? 'bg-slate-400/50' : 'bg-slate-500/40'}`} /> ReLU² (nanochat)</span>
        <span className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded ${isDark ? 'bg-emerald-400/35' : 'bg-emerald-500/30'}`} /> ReLU</span>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <label htmlFor="activation-slider" className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Input value x =</label>
        <input id="activation-slider" type="range" min={-20} max={20} value={inputVal * 10}
          onChange={(e) => setInputVal(parseInt(e.target.value) / 10)} className="flex-1 accent-slate-500" />
        <span className={`font-mono text-sm w-10 text-right ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>{inputVal.toFixed(1)}</span>
      </div>
      <div className="flex gap-4 mt-2 text-sm">
        <span className={isDark ? 'text-gray-400' : 'text-slate-500'}>ReLU²({inputVal.toFixed(1)}) = <span className={`font-mono ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{reluSq(inputVal).toFixed(3)}</span></span>
        <span className={isDark ? 'text-gray-400' : 'text-slate-500'}>ReLU({inputVal.toFixed(1)}) = <span className={`font-mono ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>{relu(inputVal).toFixed(3)}</span></span>
      </div>
    </div>
  )
}

export default function TransformerBlock() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div>
      <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>The Transformer Block</h1>
      <p className={`mb-8 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Attention + MLP + Residual connections — the building block of LLMs</p>

      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        A Transformer is just a stack of identical blocks. Each block has two sub-layers:
        <strong> self-attention</strong> (tokens communicate) and an <strong>MLP</strong> (each token thinks
        independently). Both are wrapped in residual connections.
      </p>

      <h2 className={`text-2xl font-semibold mt-10 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>The Block</h2>

      <CodeBlock filename="nanochat/gpt.py" startLine={134}
        code={`class Block(nn.Module):
    def __init__(self, config, layer_idx):
        super().__init__()
        self.attn = CausalSelfAttention(config, layer_idx)
        self.mlp = MLP(config)

    def forward(self, x, ve, cos_sin, window_size, kv_cache):
        x = x + self.attn(norm(x), ve, cos_sin, window_size, kv_cache)
        x = x + self.mlp(norm(x))
        return x`} />

      <Callout type="key">
        Notice the pattern: <code>x = x + sublayer(norm(x))</code>. This is called <strong>Pre-Norm residual connection</strong>.
        The norm is applied <em>before</em> the sublayer, and the output is <em>added</em> back to the input.
        This creates a "residual stream" that information flows through, with each layer making incremental additions.
      </Callout>

      <DiagramBox label="Inside a Transformer Block">
        <div className="flex flex-col items-center gap-2 text-sm">
          <div className={`px-4 py-2 rounded-lg font-mono ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'}`}>Input x</div>
          <div className={isDark ? 'text-gray-600' : 'text-slate-400'}>│</div>
          <div className="flex items-center gap-4">
            <div className={isDark ? 'text-gray-600' : 'text-slate-400'}>├───</div>
            <div className="flex flex-col items-center gap-1">
              <div className={`px-3 py-1 border rounded text-xs ${isDark ? 'bg-amber-900/30 border-amber-700/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>RMSNorm</div>
              <div className={`text-xs ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>↓</div>
              <div className={`px-3 py-1 border rounded text-xs ${isDark ? 'bg-sky-900/20 border-sky-800/30 text-sky-400' : 'bg-sky-50 border-sky-200 text-sky-700'}`}>Self-Attention</div>
            </div>
            <div className={isDark ? 'text-gray-600' : 'text-slate-400'}>───→ +</div>
          </div>
          <div className={`px-4 py-2 rounded-lg font-mono text-xs ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'}`}>x = x + attn(norm(x))</div>
          <div className={isDark ? 'text-gray-600' : 'text-slate-400'}>│</div>
          <div className="flex items-center gap-4">
            <div className={isDark ? 'text-gray-600' : 'text-slate-400'}>├───</div>
            <div className="flex flex-col items-center gap-1">
              <div className={`px-3 py-1 border rounded text-xs ${isDark ? 'bg-amber-900/30 border-amber-700/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>RMSNorm</div>
              <div className={`text-xs ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>↓</div>
              <div className={`px-3 py-1 border rounded text-xs ${isDark ? 'bg-emerald-900/20 border-emerald-800/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>MLP (ReLU²)</div>
            </div>
            <div className={isDark ? 'text-gray-600' : 'text-slate-400'}>───→ +</div>
          </div>
          <div className={`px-4 py-2 rounded-lg font-mono ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'}`}>Output x</div>
        </div>
      </DiagramBox>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>RMSNorm</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        nanochat uses a parameter-free RMSNorm — it just divides by the root mean square of the vector.
        No learnable scale/bias parameters:
      </p>

      <CodeBlock filename="nanochat/gpt.py" startLine={42}
        code={`def norm(x):
    # Purely functional rmsnorm with no learnable params
    return F.rms_norm(x, (x.size(-1),))`} />

      <Callout type="math">
        <p className="font-mono text-center">RMSNorm(x) = x / √(mean(x²) + ε)</p>
        <p className="mt-2">This normalizes the magnitude of each vector to roughly 1, which stabilizes
        training. Unlike LayerNorm, there are no learned γ/β parameters — simpler and still works great.</p>
      </Callout>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>The MLP</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        The MLP (Multi-Layer Perceptron) is where the model does "thinking" — it processes each token
        independently through two linear layers with a ReLU² activation:
      </p>

      <CodeBlock filename="nanochat/gpt.py" startLine={121}
        code={`class MLP(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.c_fc = nn.Linear(config.n_embd, 4 * config.n_embd, bias=False)
        self.c_proj = nn.Linear(4 * config.n_embd, config.n_embd, bias=False)

    def forward(self, x):
        x = self.c_fc(x)       # 768 → 3072 (expand 4×)
        x = F.relu(x).square() # ReLU² activation
        x = self.c_proj(x)     # 3072 → 768 (project back)
        return x`} />

      <InteractiveDemo title="Explore ReLU² Activation">
        <ActivationDemo />
      </InteractiveDemo>

      <Callout type="code">
        <strong>Why ReLU²?</strong> ReLU² has sparser activations than GELU (the standard choice), meaning
        more neurons are exactly zero. This can improve training dynamics and the model focuses
        its capacity on fewer, more meaningful features. The squaring also creates stronger gradients
        for large activations.
      </Callout>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>The Residual Stream</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        nanochat adds a clever twist: per-layer learnable scalars that control the residual stream:
      </p>

      <CodeBlock filename="nanochat/gpt.py" startLine={403}
        code={`for i, block in enumerate(self.transformer.h):
    x = self.resid_lambdas[i] * x + self.x0_lambdas[i] * x0
    ve = self.value_embeds[str(i)](idx) if str(i) in self.value_embeds else None
    x = block(x, ve, cos_sin, self.window_sizes[i], kv_cache)`} />

      <Callout type="key">
        <strong>resid_lambdas</strong> scale the current residual (initialized to 1.0).
        <br /><strong>x0_lambdas</strong> blend in the <em>original embedding</em> at each layer (initialized to 0.1).
        <br /><br />
        This "x0 residual" is inspired by ResFormer — it gives the model a direct path from the input
        to every layer, helping gradients flow and preventing information loss in deep networks.
      </Callout>

      <InteractiveDemo title="Visualize the Residual Stream">
        <ResidualStreamDemo />
      </InteractiveDemo>

      <Quiz question="Why is the MLP's hidden dimension 4× the model dimension (768 → 3072 → 768)?"
        options={["It's just a convention with no particular reason","It gives the MLP more capacity to represent complex functions before projecting back","It reduces the number of parameters","It makes the computation faster"]}
        correctIndex={1} explanation="Expanding to 4× the dimension gives the MLP a much larger 'thinking space'. The expansion lets it represent complex combinations of features, and the projection back down forces it to compress this into the most useful information. This bottleneck architecture is standard in Transformers." />

      <Quiz question="What is the purpose of the x0 skip connection (blending the original embedding back in at each layer)?"
        options={["It saves memory by reusing the original embeddings","It prevents the model from forgetting the original token information as it passes through many layers","It makes training faster","It is required for the attention mechanism to work"]}
        correctIndex={1} explanation="In deep networks, information can degrade as it passes through many layers. The x0 skip connection ensures that each layer has direct access to the original token embedding, preventing 'representation collapse' where the model loses track of what the original tokens were." />
    </div>
  )
}
