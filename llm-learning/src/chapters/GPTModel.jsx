import CodeBlock from '../components/CodeBlock'
import Callout from '../components/Callout'
import DiagramBox from '../components/DiagramBox'
import Quiz from '../components/Quiz'
import InteractiveDemo from '../components/InteractiveDemo'
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

function ParamCounter() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [depth, setDepth] = useState(12)
  const n_embd = Math.round(128 * Math.sqrt(depth))
  const rounded_embd = Math.ceil(n_embd / 128) * 128
  const n_head = Math.max(1, Math.round(rounded_embd / 128))
  const head_dim = Math.round(rounded_embd / n_head)
  const vocab_size = 32768

  const wte = vocab_size * rounded_embd
  const lm_head = rounded_embd * vocab_size
  const per_layer_attn = rounded_embd * rounded_embd * 4
  const per_layer_mlp = rounded_embd * (4 * rounded_embd) * 2
  const per_layer = per_layer_attn + per_layer_mlp
  const total_layers = per_layer * depth
  const total = wte + lm_head + total_layers

  const formatNum = (n) => {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
    return n
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <label htmlFor="depth-slider" className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Depth (n_layer):</label>
        <input id="depth-slider" type="range" min={4} max={40} value={depth}
          onChange={(e) => setDepth(parseInt(e.target.value))} className="flex-1 accent-slate-500" />
        <span className={`text-lg font-mono w-8 text-right ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>{depth}</span>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Model Dim', value: rounded_embd },
          { label: 'Heads', value: n_head },
          { label: 'Head Dim', value: head_dim },
        ].map(({ label, value }) => (
          <div key={label} className={`rounded-xl p-3 text-center ${isDark ? 'bg-gray-800/50' : 'bg-slate-50'}`}>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{label}</p>
            <p className={`text-lg font-mono ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>{value}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {[
          { label: 'Token Embedding (wte)', params: wte, color: 'bg-sky-500' },
          { label: `Transformer Layers (×${depth})`, params: total_layers, color: 'bg-slate-500' },
          { label: 'LM Head (output)', params: lm_head, color: 'bg-emerald-500' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded ${item.color}`} />
            <span className={`text-sm flex-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{item.label}</span>
            <span className={`text-sm font-mono ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>{formatNum(item.params)}</span>
            <div className={`w-32 h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-slate-200'}`}>
              <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.params / total) * 100}%` }} />
            </div>
          </div>
        ))}
        <div className={`flex items-center gap-3 pt-2 border-t ${isDark ? 'border-gray-800' : 'border-slate-200'}`}>
          <div className="w-3" />
          <span className={`text-sm font-semibold flex-1 ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>Total Parameters</span>
          <span className={`text-sm font-mono font-bold ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{formatNum(total)}</span>
        </div>
      </div>
      <p className={`text-xs mt-4 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
        {depth === 12 && "d12 = ~GPT-1 scale (~117M). Great for quick experiments (~5 min training)."}
        {depth >= 24 && depth <= 26 && "d24–d26 ≈ GPT-2 scale. This is what the speedrun targets (~3 hours on 8×H100)."}
        {depth > 26 && "Scaling beyond GPT-2. nanochat automatically adjusts all hyperparameters based on depth."}
      </p>
    </div>
  )
}

export default function GPTModel() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div>
      <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>The Full GPT Model</h1>
      <p className={`mb-8 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Putting all the pieces together</p>

      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        Now that we understand each component, let's see how they combine into the complete model.
        The GPT class in nanochat ties together the embedding, transformer layers, and output head.
      </p>

      <h2 className={`text-2xl font-semibold mt-10 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Model Configuration</h2>

      <CodeBlock filename="nanochat/gpt.py" startLine={28}
        code={`@dataclass
class GPTConfig:
    sequence_len: int = 2048
    vocab_size: int = 32768
    n_layer: int = 12
    n_head: int = 6       # number of query heads
    n_kv_head: int = 6    # number of key/value heads (GQA)
    n_embd: int = 768
    window_pattern: str = "SSSL"`} />

      <Callout type="key">
        nanochat's design philosophy: <strong>one dial — depth</strong>. The number of layers determines
        all other hyperparameters automatically. Deeper = wider, more heads, longer training, etc.
        This makes experimentation simple — just change <code>--depth</code>.
      </Callout>

      <InteractiveDemo title="Explore Model Scaling">
        <ParamCounter />
      </InteractiveDemo>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>The Forward Pass</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        Here's the complete forward pass — how input tokens become output probabilities:
      </p>

      <CodeBlock filename="nanochat/gpt.py" startLine={388}
        code={`def forward(self, idx, targets=None, kv_cache=None, loss_reduction='mean'):
    B, T = idx.size()

    # 1. Get rotary embeddings for the sequence
    cos_sin = self.cos[:, T0:T0+T], self.sin[:, T0:T0+T]

    # 2. Embed tokens + normalize
    x = self.transformer.wte(idx)  # (B, T) → (B, T, 768)
    x = norm(x)
    x0 = x  # save for x0 residual

    # 3. Pass through all transformer layers
    for i, block in enumerate(self.transformer.h):
        x = self.resid_lambdas[i] * x + self.x0_lambdas[i] * x0
        ve = self.value_embeds[str(i)](idx) if str(i) in self.value_embeds else None
        x = block(x, ve, cos_sin, self.window_sizes[i], kv_cache)
    x = norm(x)

    # 4. Compute logits (un-embed)
    softcap = 15
    logits = self.lm_head(x)  # (B, T, 768) → (B, T, vocab_size)
    logits = logits[..., :self.config.vocab_size]
    logits = logits.float()
    logits = softcap * torch.tanh(logits / softcap)  # squash to [-15, 15]

    # 5. Compute loss if training
    if targets is not None:
        loss = F.cross_entropy(logits.view(-1, logits.size(-1)), targets.view(-1))
        return loss
    else:
        return logits`} />

      <DiagramBox label="Complete Forward Pass">
        <div className="flex flex-col items-center gap-3 text-sm">
          <div className={`px-6 py-2 rounded-lg font-mono text-xs ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'}`}>
            idx: [464, 6766, 318, 4171] (token IDs)
          </div>
          <div className={isDark ? 'text-gray-600' : 'text-slate-400'}>↓ nn.Embedding</div>
          <div className={`px-4 py-2 border rounded-lg text-xs ${isDark ? 'bg-cyan-900/30 border-cyan-700/30 text-cyan-400' : 'bg-cyan-50 border-cyan-200 text-cyan-700'}`}>
            Token Embeddings (B, T, 768) + RMSNorm
          </div>
          <div className={isDark ? 'text-gray-600' : 'text-slate-400'}>↓ save as x₀</div>
          <div className={`border rounded-xl p-4 w-full max-w-sm ${isDark ? 'border-gray-700/40 bg-gray-800/30' : 'border-slate-200 bg-slate-50/50'}`}>
            <p className={`text-xs font-semibold text-center mb-2 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>× n_layer times</p>
            <div className="flex flex-col items-center gap-2">
              <div className={`text-[10px] font-mono ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>x = λ_r·x + λ_0·x₀</div>
              <div className={`px-3 py-1 rounded text-xs ${isDark ? 'bg-sky-900/20 text-sky-400' : 'bg-sky-50 text-sky-700'}`}>Self-Attention + Value Embedding</div>
              <div className={`px-3 py-1 rounded text-xs ${isDark ? 'bg-emerald-900/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>MLP (ReLU²)</div>
            </div>
          </div>
          <div className={isDark ? 'text-gray-600' : 'text-slate-400'}>↓ RMSNorm</div>
          <div className={`px-4 py-2 border rounded-lg text-xs ${isDark ? 'bg-gray-800/50 border-gray-700/40 text-gray-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
            lm_head: Linear(768 → 32768)
          </div>
          <div className={isDark ? 'text-gray-600' : 'text-slate-400'}>↓ softcap(tanh) → squash to [-15, 15]</div>
          <div className={`px-6 py-2 rounded-lg font-mono text-xs ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'}`}>
            logits: (B, T, 32768) — probability for each next token
          </div>
          <div className="flex gap-8 mt-2">
            <div className="text-center">
              <div className={`text-xs ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>Training ↓</div>
              <div className={`px-3 py-1 border rounded text-xs ${isDark ? 'bg-red-900/30 border-red-700/30 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
                cross_entropy(logits, targets)
              </div>
            </div>
            <div className="text-center">
              <div className={`text-xs ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>Inference ↓</div>
              <div className={`px-3 py-1 border rounded text-xs ${isDark ? 'bg-green-900/30 border-green-700/30 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}>
                sample from softmax(logits)
              </div>
            </div>
          </div>
        </div>
      </DiagramBox>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Logit Softcapping</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        Before computing the loss, nanochat "softcaps" the logits to the range [-15, 15] using tanh:
      </p>

      <Callout type="math">
        <p className="font-mono text-center">logits = 15 · tanh(logits / 15)</p>
        <p className="mt-2">This prevents any single logit from becoming astronomically large. Without this, a single
        overconfident prediction could dominate the loss and destabilize training.</p>
      </Callout>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Weight Initialization</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        How weights are initialized matters enormously. nanochat initializes each layer type carefully:
      </p>

      <CodeBlock filename="nanochat/gpt.py" startLine={188}
        code={`@torch.no_grad()
def init_weights(self):
    # Embedding: normal, std=1.0
    torch.nn.init.normal_(self.transformer.wte.weight, mean=0.0, std=1.0)
    # LM head: normal, std=0.001 (very small — starts near uniform)
    torch.nn.init.normal_(self.lm_head.weight, mean=0.0, std=0.001)

    # Transformer blocks
    s = 3**0.5 * n_embd**-0.5  # Uniform to match Normal std
    for block in self.transformer.h:
        torch.nn.init.uniform_(block.attn.c_q.weight, -s, s)
        torch.nn.init.uniform_(block.attn.c_k.weight, -s, s)
        torch.nn.init.uniform_(block.attn.c_v.weight, -s, s)
        torch.nn.init.zeros_(block.attn.c_proj.weight)  # output projections start at zero!
        torch.nn.init.uniform_(block.mlp.c_fc.weight, -s, s)
        torch.nn.init.zeros_(block.mlp.c_proj.weight)   # MLP output also zero`} />

      <Callout type="key">
        <strong>Zero-init output projections</strong> — both <code>c_proj</code> in attention and MLP
        start at zero. This means at initialization, each Block is an identity function (it adds nothing
        to the residual stream). The model starts as "do nothing" and learns to add useful information gradually.
      </Callout>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Value Embeddings (ResFormer)</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        nanochat includes a ResFormer-inspired feature: <strong>value embeddings</strong>. On alternating
        layers, the model adds a learnable embedding (based on the input token) directly to the value vectors:
      </p>

      <CodeBlock filename="nanochat/gpt.py" startLine={86}
        code={`# Value residual (ResFormer): mix in value embedding with input-dependent gate
if ve is not None:
    ve = ve.view(B, T, self.n_kv_head, self.head_dim)
    gate = 2 * torch.sigmoid(self.ve_gate(x[..., :self.ve_gate_channels]))
    v = v + gate.unsqueeze(-1) * ve`} />

      <Callout type="info">
        The gate starts at sigmoid(0) = 0.5, scaled by 2 → 1.0 (neutral). This means at initialization,
        the value embedding is added with weight 1.0 — it's on by default and can learn to be
        amplified or suppressed.
      </Callout>

      <Quiz question="Why are the output projection weights (c_proj) initialized to zero?"
        options={["It reduces the number of effective parameters","It makes each Block start as identity, adding nothing to the residual stream","Zero initialization is simpler to implement","It prevents overfitting in early training"]}
        correctIndex={1} explanation="With c_proj at zero, the attention and MLP sublayers output zero vectors. So x + 0 = x — the block is initially an identity function. This means the model starts from a well-defined state (embedding → lm_head directly) and gradually learns to add useful transformations." />

      <Quiz question="What does the logit softcap (15 · tanh(logits/15)) do?"
        options={["Makes all logits positive","Converts logits to probabilities","Smoothly limits logits to [-15, 15] to prevent extreme predictions","Speeds up the softmax computation"]}
        correctIndex={2} explanation="The softcap uses tanh to smoothly squash logits into the range [-15, 15]. Values near 0 are barely affected, but extreme values are compressed. This prevents the model from becoming too confident about any single prediction." />
    </div>
  )
}
