import { useState } from 'react'
import CodeBlock from '../components/CodeBlock'
import Callout from '../components/Callout'
import InteractiveDemo from '../components/InteractiveDemo'
import DiagramBox from '../components/DiagramBox'
import Quiz from '../components/Quiz'
import { useTheme } from '../context/ThemeContext'

function SamplingDemo() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [temperature, setTemperature] = useState(1.0)
  const [topK, setTopK] = useState(0)

  const rawLogits = [
    { token: 'blue', logit: 3.2 }, { token: 'red', logit: 2.1 }, { token: 'green', logit: 1.5 },
    { token: 'dark', logit: 0.8 }, { token: 'bright', logit: 0.3 }, { token: 'light', logit: -0.2 },
    { token: 'the', logit: -1.0 }, { token: 'and', logit: -1.5 }, { token: 'with', logit: -2.0 },
    { token: 'xyz', logit: -4.0 },
  ]

  const processLogits = () => {
    let logits = rawLogits.map(l => ({ ...l }))
    const temp = temperature === 0 ? 0.01 : temperature
    logits.forEach(l => { l.scaled = l.logit / temp })
    if (topK > 0 && topK < logits.length) {
      const sorted = [...logits].sort((a, b) => b.scaled - a.scaled)
      const threshold = sorted[topK - 1].scaled
      logits.forEach(l => { if (l.scaled < threshold) l.scaled = -Infinity })
    }
    const maxScaled = Math.max(...logits.map(l => l.scaled))
    const exps = logits.map(l => l.scaled === -Infinity ? 0 : Math.exp(l.scaled - maxScaled))
    const sumExp = exps.reduce((a, b) => a + b, 0)
    logits.forEach((l, i) => { l.prob = exps[i] / sumExp })
    return logits
  }

  const processed = processLogits()
  const maxProb = Math.max(...processed.map(l => l.prob))

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="temp-slider" className={`text-sm block mb-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            Temperature: <span className={`font-mono ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{temperature.toFixed(1)}</span>
          </label>
          <input id="temp-slider" type="range" min={0} max={30} value={temperature * 10}
            onChange={(e) => setTemperature(parseInt(e.target.value) / 10)} className="w-full accent-slate-500" />
          <p className={`text-[10px] mt-1 ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>
            {temperature === 0 ? 'Greedy (always pick the best)' : temperature < 0.5 ? 'Very focused' : temperature <= 1 ? 'Balanced' : temperature < 2 ? 'Creative' : 'Very random'}
          </p>
        </div>
        <div>
          <label htmlFor="topk-slider" className={`text-sm block mb-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            Top-K: <span className={`font-mono ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{topK === 0 ? 'Off' : topK}</span>
          </label>
          <input id="topk-slider" type="range" min={0} max={10} value={topK}
            onChange={(e) => setTopK(parseInt(e.target.value))} className="w-full accent-slate-500" />
          <p className={`text-[10px] mt-1 ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>
            {topK === 0 ? 'Consider all tokens' : `Only consider top ${topK} tokens`}
          </p>
        </div>
      </div>
      <div className="space-y-1.5">
        {processed.map((l, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <span className={`w-16 text-right font-mono ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{l.token}</span>
            <div className={`flex-1 h-5 rounded overflow-hidden relative ${isDark ? 'bg-gray-800' : 'bg-slate-200'}`}>
              <div
                className={`h-full rounded transition-all duration-300 ${l.prob < 0.001 ? (isDark ? 'bg-gray-700' : 'bg-slate-300') : (isDark ? 'bg-slate-400' : 'bg-slate-500')}`}
                style={{ width: `${(l.prob / maxProb) * 100}%`, opacity: Math.max(0.2, l.prob / maxProb) }}
              />
            </div>
            <span className={`w-16 text-right font-mono text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              {l.prob < 0.001 ? '~0%' : `${(l.prob * 100).toFixed(1)}%`}
            </span>
          </div>
        ))}
      </div>
      <p className={`text-xs mt-4 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
        Context: "The sky is ___". Adjust temperature and top-k to see how the probability distribution changes.
      </p>
    </div>
  )
}

function AutoregressiveDemo() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [step, setStep] = useState(0)
  const steps = [
    { prompt: ['The', 'sky', 'is'], generated: [], nextPick: 'blue', desc: 'Feed prompt tokens. Get logits for position 3.' },
    { prompt: ['The', 'sky', 'is'], generated: ['blue'], nextPick: 'and', desc: 'Sample "blue". Feed it back. Get logits for position 4.' },
    { prompt: ['The', 'sky', 'is'], generated: ['blue', 'and'], nextPick: 'the', desc: 'Sample "and". Feed it back. Get logits for position 5.' },
    { prompt: ['The', 'sky', 'is'], generated: ['blue', 'and', 'the'], nextPick: 'clouds', desc: 'Sample "the". Feed it back. Get logits for position 6.' },
    { prompt: ['The', 'sky', 'is'], generated: ['blue', 'and', 'the', 'clouds'], nextPick: 'are', desc: 'Sample "clouds". Feed it back. Get logits for position 7.' },
    { prompt: ['The', 'sky', 'is'], generated: ['blue', 'and', 'the', 'clouds', 'are'], nextPick: 'white', desc: 'And so on... each token is generated one at a time.' },
  ]
  const current = steps[step]

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-4 min-h-[3rem] items-center">
        {current.prompt.map((t, i) => (
          <span key={`p-${i}`} className={`px-3 py-1.5 rounded-lg border text-sm font-mono ${
            isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-slate-100 border-slate-300 text-slate-700'
          }`}>{t}</span>
        ))}
        {current.generated.map((t, i) => (
          <span key={`g-${i}`} className={`px-3 py-1.5 rounded-lg border text-sm font-mono ${
            isDark ? 'bg-sky-900/30 border-sky-800/40 text-sky-300' : 'bg-sky-50 border-sky-200 text-sky-800'
          }`}>{t}</span>
        ))}
        <span className={`px-3 py-1.5 rounded-lg border text-sm font-mono animate-pulse ${
          isDark ? 'bg-amber-900/40 border-amber-500/40 text-amber-300' : 'bg-amber-100 border-amber-300 text-amber-700'
        }`}>{current.nextPick}?</span>
      </div>
      <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{current.desc}</p>
      <div className="flex gap-2">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
          className={`px-4 py-2 rounded-lg text-sm disabled:opacity-30 cursor-pointer transition-colors ${
            isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}>← Back</button>
        <button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1}
          className={`px-4 py-2 rounded-lg text-sm disabled:opacity-30 cursor-pointer transition-colors ${
            isDark ? 'bg-gray-700/50 border border-gray-600/50 text-gray-300 hover:bg-gray-700'
                   : 'bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200'
          }`}>Generate Next →</button>
      </div>
      <p className={`text-xs mt-3 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
        <span className={isDark ? 'text-gray-400' : 'text-slate-600'}>Gray</span> = prompt,{' '}
        <span className={isDark ? 'text-sky-400' : 'text-sky-700'}>Blue</span> = generated,{' '}
        <span className={isDark ? 'text-amber-400' : 'text-amber-600'}>Gold</span> = being sampled
      </p>
    </div>
  )
}

export default function Inference() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div>
      <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Inference & Generation</h1>
      <p className={`mb-8 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>How the model generates text token by token</p>

      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        After training, inference is conceptually simple: feed tokens in, get probability distribution out,
        sample a token, feed it back in, repeat. But making this fast requires clever engineering.
      </p>

      <h2 className={`text-2xl font-semibold mt-10 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Autoregressive Generation</h2>
      <InteractiveDemo title="Watch autoregressive generation">
        <AutoregressiveDemo />
      </InteractiveDemo>

      <CodeBlock filename="nanochat/gpt.py" startLine={426}
        code={`@torch.inference_mode()
def generate(self, tokens, max_tokens, temperature=1.0, top_k=None, seed=42):
    """Naive autoregressive streaming inference."""
    ids = torch.tensor([tokens], dtype=torch.long, device=device)
    for _ in range(max_tokens):
        logits = self.forward(ids)       # full forward pass
        logits = logits[:, -1, :]        # take last position only
        if top_k is not None and top_k > 0:
            v, _ = torch.topk(logits, min(top_k, logits.size(-1)))
            logits[logits < v[:, [-1]]] = -float('Inf')
        if temperature > 0:
            logits = logits / temperature
            probs = F.softmax(logits, dim=-1)
            next_ids = torch.multinomial(probs, num_samples=1, generator=rng)
        else:
            next_ids = torch.argmax(logits, dim=-1, keepdim=True)
        ids = torch.cat((ids, next_ids), dim=1)
        yield next_ids.item()`} />

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Sampling Strategies</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        How we pick the next token from the probability distribution dramatically affects the output:
      </p>

      <InteractiveDemo title="Explore Sampling Parameters">
        <SamplingDemo />
      </InteractiveDemo>

      <Callout type="key">
        <strong>Temperature</strong> controls randomness. At T=0, always pick the highest-probability
        token (greedy). At T=1, sample proportionally. At T&gt;1, flatten the distribution (more random).
        <br /><br />
        <strong>Top-K</strong> limits sampling to the K most likely tokens, preventing the model from
        occasionally picking a very unlikely token.
      </Callout>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>KV Cache: Making Inference Fast</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        The naive approach re-computes attention over ALL tokens at every step. With a KV Cache,
        we only compute the new token and reuse cached keys/values:
      </p>

      <DiagramBox label="KV Cache — avoid redundant computation">
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3">
            <span className={`font-semibold w-20 ${isDark ? 'text-red-400' : 'text-red-600'}`}>Without:</span>
            <div className="flex gap-1">
              {['The', 'sky', 'is', 'blue', 'and'].map((t, i) => (
                <span key={i} className={`px-2 py-1 rounded border text-xs ${isDark ? 'bg-red-900/30 border-red-700/30 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>{t}</span>
              ))}
              <span className={`px-2 py-1 rounded border text-xs font-bold ${isDark ? 'bg-red-900/50 border-red-500/50 text-red-200' : 'bg-red-100 border-red-300 text-red-800'}`}>NEW</span>
            </div>
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>→ recompute ALL 6 tokens every step</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`font-semibold w-20 ${isDark ? 'text-green-400' : 'text-green-600'}`}>With KV$:</span>
            <div className="flex gap-1">
              {['The', 'sky', 'is', 'blue', 'and'].map((t, i) => (
                <span key={i} className={`px-2 py-1 rounded border text-xs ${isDark ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-slate-100 border-slate-300 text-slate-400'}`}>{t}</span>
              ))}
              <span className={`px-2 py-1 rounded border text-xs font-bold ${isDark ? 'bg-green-900/50 border-green-500/50 text-green-200' : 'bg-green-100 border-green-300 text-green-800'}`}>NEW</span>
            </div>
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>→ only compute NEW token, reuse cached K,V</span>
          </div>
        </div>
      </DiagramBox>

      <CodeBlock filename="nanochat/engine.py" startLine={83}
        code={`class KVCache:
    """KV Cache for Flash Attention 3's flash_attn_with_kvcache API."""

    def __init__(self, batch_size, num_heads, seq_len, head_dim, num_layers, device, dtype):
        # Pre-allocate cache tensors: (n_layers, B, T, H, D)
        self.k_cache = torch.zeros(num_layers, batch_size, seq_len, num_heads, head_dim, ...)
        self.v_cache = torch.zeros(num_layers, batch_size, seq_len, num_heads, head_dim, ...)
        # Current position per batch element
        self.cache_seqlens = torch.zeros(batch_size, dtype=torch.int32, device=device)`} />

      <Callout type="info">
        The KV cache stores key and value tensors for all previously processed tokens. At each new
        step, we only compute Q, K, V for the <em>new</em> token, append K and V to the cache,
        and compute attention between the new Q and all cached K/V. This turns O(T²) per step into O(T).
      </Callout>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Tool Use During Inference</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        nanochat's engine handles <strong>tool use</strong> — the model can invoke a Python calculator
        by generating special tokens:
      </p>

      <CodeBlock filename="nanochat/engine.py" startLine={252}
        code={`if next_token == python_start:
    state.in_python_block = True
    state.python_expr_tokens = []
elif next_token == python_end and state.in_python_block:
    state.in_python_block = False
    if state.python_expr_tokens:
        expr = self.tokenizer.decode(state.python_expr_tokens)
        result = use_calculator(expr)
        if result is not None:
            # Force inject the result tokens
            state.forced_tokens.append(output_start)
            state.forced_tokens.extend(self.tokenizer.encode(str(result)))
            state.forced_tokens.append(output_end)`} />

      <DiagramBox label="Tool Use Flow">
        <div className="flex flex-col gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className={isDark ? 'text-sky-400' : 'text-sky-700'}>Model generates:</span>
            <span className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'}`}>{'<|python_start|>'}</span>
            <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>2 + 3 * 4</span>
            <span className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'}`}>{'<|python_end|>'}</span>
          </div>
          <div className={`ml-20 ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>↓ Engine intercepts, evaluates</div>
          <div className="flex items-center gap-2">
            <span className={isDark ? 'text-green-400' : 'text-green-600'}>Engine injects:</span>
            <span className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'}`}>{'<|output_start|>'}</span>
            <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>14</span>
            <span className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'}`}>{'<|output_end|>'}</span>
          </div>
          <div className={`ml-20 ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>↓ Model continues generating with the result</div>
        </div>
      </DiagramBox>

      <Quiz question="Why does the KV cache dramatically speed up autoregressive generation?"
        options={["It reduces the model size","It avoids recomputing keys and values for all previous tokens at each step","It allows the model to generate multiple tokens at once","It compresses the model weights"]}
        correctIndex={1} explanation="Without KV cache, generating token N requires computing attention over all N previous tokens from scratch. With KV cache, the K and V for tokens 1...N-1 are stored and reused." />

      <Quiz question="What happens when temperature = 0 during generation?"
        options={["The model generates nothing","The model always selects the token with the highest probability (greedy decoding)","All tokens become equally likely","The model generates random tokens"]}
        correctIndex={1} explanation="At temperature 0, we skip sampling entirely and always pick the most likely token (argmax). This gives deterministic, 'safe' outputs but can be repetitive." />
    </div>
  )
}
