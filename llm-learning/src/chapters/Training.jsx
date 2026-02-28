import { useState } from 'react'
import CodeBlock from '../components/CodeBlock'
import Callout from '../components/Callout'
import InteractiveDemo from '../components/InteractiveDemo'
import DiagramBox from '../components/DiagramBox'
import Quiz from '../components/Quiz'
import { useTheme } from '../context/ThemeContext'

function LossDemo() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [step, setStep] = useState(0)
  const maxSteps = 200
  const getLoss = (s) => {
    const base = 4.0 * Math.exp(-s / 40) + 0.75
    const noise = Math.sin(s * 0.3) * 0.05 + Math.sin(s * 0.7) * 0.03
    return base + noise
  }
  const points = Array.from({ length: maxSteps }, (_, i) => ({ step: i, loss: getLoss(i) }))
  const currentLoss = getLoss(step)
  const maxLoss = 5
  const width = 600
  const height = 200
  const lineColor = isDark ? 'rgb(148, 163, 184)' : 'rgb(71, 85, 105)'
  const gridColor = isDark ? 'rgba(75,85,99,0.3)' : 'rgba(148,163,184,0.3)'
  const labelColor = isDark ? 'rgba(156,163,175,0.5)' : 'rgba(100,116,139,0.5)'
  const axisColor = isDark ? 'rgba(156,163,175,0.6)' : 'rgba(100,116,139,0.6)'

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <label htmlFor="loss-step" className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Training step:</label>
        <input id="loss-step" type="range" min={0} max={maxSteps - 1} value={step}
          onChange={(e) => setStep(parseInt(e.target.value))} className="flex-1 accent-slate-500" />
        <span className={`text-sm font-mono ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>{step}</span>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height + 30}`} className="w-full max-w-xl">
          {[1, 2, 3, 4].map(v => (
            <g key={v}>
              <line x1={40} y1={height - (v / maxLoss) * height} x2={width} y2={height - (v / maxLoss) * height} stroke={gridColor} />
              <text x={35} y={height - (v / maxLoss) * height + 4} fill={labelColor} fontSize="10" textAnchor="end">{v}</text>
            </g>
          ))}
          <polyline
            points={points.slice(0, step + 1).map(p => `${40 + (p.step / maxSteps) * (width - 40)},${height - (p.loss / maxLoss) * height}`).join(' ')}
            fill="none" stroke={lineColor} strokeWidth="2"
          />
          <circle cx={40 + (step / maxSteps) * (width - 40)} cy={height - (currentLoss / maxLoss) * height} r="4" fill={lineColor} />
          <text x={width / 2} y={height + 25} fill={axisColor} fontSize="11" textAnchor="middle">Training Step</text>
          <text x={12} y={height / 2} fill={axisColor} fontSize="11" textAnchor="middle" transform={`rotate(-90, 12, ${height / 2})`}>Loss</text>
        </svg>
      </div>
      <div className="flex gap-6 mt-2 text-sm">
        <span className={isDark ? 'text-gray-400' : 'text-slate-500'}>Step: <span className={`font-mono ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{step}</span></span>
        <span className={isDark ? 'text-gray-400' : 'text-slate-500'}>Loss: <span className={`font-mono ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{currentLoss.toFixed(3)}</span></span>
        <span className={isDark ? 'text-gray-400' : 'text-slate-500'}>BPB: <span className={`font-mono ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{(currentLoss / Math.log(2) / 4.2).toFixed(3)}</span></span>
      </div>
      <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
        Loss starts high (model is random) and decreases as it learns patterns. BPB (bits per byte) normalizes for vocabulary size.
      </p>
    </div>
  )
}

function LRScheduleDemo() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [warmup, setWarmup] = useState(0.1)
  const totalSteps = 200
  const warmupSteps = Math.round(warmup * totalSteps)
  const getLR = (step) => {
    if (step < warmupSteps) return step / warmupSteps
    const progress = (step - warmupSteps) / (totalSteps - warmupSteps)
    return 0.5 * (1 + Math.cos(Math.PI * progress))
  }
  const width = 500
  const height = 120
  const lineColor = isDark ? 'rgb(52, 211, 153)' : 'rgb(16, 185, 129)'
  const warmupFill = isDark ? 'rgba(148, 163, 184, 0.05)' : 'rgba(71, 85, 105, 0.05)'

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <label htmlFor="warmup-slider" className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Warmup fraction:</label>
        <input id="warmup-slider" type="range" min={0} max={30} value={warmup * 100}
          onChange={(e) => setWarmup(parseInt(e.target.value) / 100)} className="flex-1 accent-slate-500" />
        <span className={`text-sm font-mono ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>{(warmup * 100).toFixed(0)}%</span>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height + 25}`} className="w-full max-w-md">
          <rect x={30} y={0} width={(warmupSteps / totalSteps) * (width - 30)} height={height} fill={warmupFill} />
          <polyline
            points={Array.from({ length: totalSteps }, (_, i) => `${30 + (i / totalSteps) * (width - 30)},${height - getLR(i) * height}`).join(' ')}
            fill="none" stroke={lineColor} strokeWidth="2"
          />
          <text x={30 + (warmupSteps / totalSteps) * (width - 30) / 2} y={height - 5} fill={isDark ? 'rgba(148,163,184,0.3)' : 'rgba(71,85,105,0.3)'} fontSize="9" textAnchor="middle">warmup</text>
          <text x={width / 2} y={height + 20} fill={isDark ? 'rgba(156,163,175,0.6)' : 'rgba(100,116,139,0.6)'} fontSize="10" textAnchor="middle">Step</text>
          <text x={4} y={8} fill={isDark ? 'rgba(156,163,175,0.4)' : 'rgba(100,116,139,0.4)'} fontSize="9">LR</text>
        </svg>
      </div>
      <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
        Linear warmup ramps the learning rate from 0 → max, then it stays flat and linearly warmdowns to the final LR.
      </p>
    </div>
  )
}

export default function Training() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div>
      <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Training & Optimization</h1>
      <p className={`mb-8 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>How the model learns from data</p>

      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        Training an LLM means showing it billions of tokens and adjusting its weights to get better
        at predicting the next token. This involves a loss function, an optimizer, and a data pipeline.
      </p>

      <h2 className={`text-2xl font-semibold mt-10 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>The Training Objective</h2>

      <Callout type="math">
        <p className="font-mono text-center text-base mb-2">
          {"Loss = -Σ log P(t_i | t_1, ..., t_{i-1})"}
        </p>
        <p>For each position i, the model predicts a probability distribution over all 32,768 tokens.
        We compare this to the actual next token using <strong>cross-entropy loss</strong>.
        Lower loss = better predictions.</p>
      </Callout>

      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        In practice, we feed a batch of sequences and compute loss on all positions simultaneously.
        The dataloader packs multiple documents into each row for efficiency:
      </p>

      <CodeBlock filename="nanochat/dataloader.py" startLine={73}
        code={`def tokenizing_distributed_data_loader_with_state_bos_bestfit(
    tokenizer, B, T, split, ...):
    """
    BOS-aligned dataloader with Best-Fit Cropping.
    
    Algorithm for each row:
    1. From buffered docs, pick the LARGEST doc that fits entirely
    2. Repeat until no doc fits
    3. When nothing fits, crop a doc to fill remaining space exactly
    
    Key properties:
    - Every row starts with BOS
    - 100% utilization (no padding, every token is trained on)
    - ~35% of all tokens are discarded due to cropping
    """`} />

      <Callout type="info">
        <strong>BOS-aligned packing</strong>: Every training row starts with a BOS token, so the model
        always has proper document boundaries. Documents are packed together using a best-fit algorithm
        that minimizes waste.
      </Callout>

      <InteractiveDemo title="Training Loss Curve">
        <LossDemo />
      </InteractiveDemo>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>The Optimizer: Muon + AdamW</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        nanochat uses a <strong>hybrid optimizer</strong> — different parameter groups get different optimizers:
      </p>

      <DiagramBox label="Optimizer Assignment">
        <div className="space-y-2 text-sm">
          {[
            { params: 'Token Embeddings (wte)', opt: 'AdamW', lr: '0.2', reason: 'Embeddings are lookup tables, not matrices' },
            { params: 'Value Embeddings', opt: 'AdamW', lr: '0.2', reason: 'Same as regular embeddings' },
            { params: 'LM Head', opt: 'AdamW', lr: '0.004', reason: 'Output layer, very sensitive — small LR' },
            { params: 'resid_lambdas', opt: 'AdamW', lr: '0.005', reason: 'Scalars — AdamW with small LR' },
            { params: 'x0_lambdas', opt: 'AdamW', lr: '0.5', reason: 'Scalars — larger LR, higher β₁' },
            { params: 'Transformer Matrices (Q,K,V,proj,MLP)', opt: 'Muon', lr: '0.02', reason: '2D matrices — Muon excels here' },
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
              <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                item.opt === 'Muon'
                  ? isDark ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-700'
                  : isDark ? 'bg-sky-900/30 text-sky-300' : 'bg-sky-100 text-sky-700'
              }`}>{item.opt}</span>
              <span className={`flex-1 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>{item.params}</span>
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{item.reason}</span>
            </div>
          ))}
        </div>
      </DiagramBox>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>What is Muon?</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        <strong>Muon</strong> (MomentUm Orthogonalized by Newton-schulz) is a novel optimizer that
        orthogonalizes the gradient updates for 2D weight matrices:
      </p>

      <CodeBlock filename="nanochat/optim.py" startLine={109}
        code={`# Nesterov momentum
momentum_buffer.lerp_(stacked_grads, 1 - momentum)
g = stacked_grads.lerp_(momentum_buffer, momentum)

# Polar Express — orthogonalize the update
X = g.bfloat16()
X = X / (X.norm(dim=(-2, -1), keepdim=True) * 1.02 + 1e-6)
if g.size(-2) > g.size(-1):  # Tall matrix
    for a, b, c in polar_express_coeffs[:ns_steps]:
        A = X.mT @ X
        B = b * A + c * (A @ A)
        X = a * X + X @ B`} />

      <Callout type="key">
        <strong>Why orthogonalize?</strong> When you orthogonalize the gradient, each neuron receives
        an update of similar magnitude. Without this, some neurons get huge updates while others get tiny
        ones — leading to inefficient learning.
      </Callout>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Learning Rate Schedule</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        The learning rate follows a <strong>linear warmup + constant hold + linear warmdown</strong> schedule:
      </p>

      <InteractiveDemo title="Learning Rate Schedule">
        <LRScheduleDemo />
      </InteractiveDemo>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Distributed Training</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        Training on 8 GPUs uses a distributed optimizer with a 3-phase async communication pattern:
      </p>

      <DiagramBox label="Distributed Training Communication">
        <div className="space-y-3 text-sm">
          {[
            { phase: 'Phase 1:', desc: 'Launch all async reduce_scatter ops (average gradients across GPUs)', dark: 'bg-gray-800/30 border-gray-700/40 text-gray-300', light: 'bg-slate-50 border-slate-200 text-slate-700' },
            { phase: 'Phase 2:', desc: 'Wait for reduce → compute update → launch all_gather', dark: 'bg-gray-800/30 border-gray-700/40 text-gray-300', light: 'bg-slate-50 border-slate-200 text-slate-700' },
            { phase: 'Phase 3:', desc: 'Wait for gathers → copy updated params back to all GPUs', dark: 'bg-gray-800/30 border-gray-700/40 text-gray-300', light: 'bg-slate-50 border-slate-200 text-slate-700' },
          ].map(({ phase, desc, dark, light }) => (
            <div key={phase} className={`px-4 py-2 border rounded-lg ${isDark ? dark : light}`}>
              <span className="font-semibold">{phase}</span>
              <span className={`ml-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{desc}</span>
            </div>
          ))}
        </div>
      </DiagramBox>

      <Callout type="info">
        The distributed optimizer uses <strong>ZeRO-2 style sharding</strong> for AdamW params —
        each GPU only stores optimizer state for its shard of parameters.
      </Callout>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>FLOPs Estimation</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        nanochat carefully estimates the compute used per token:
      </p>

      <CodeBlock filename="nanochat/gpt.py" startLine={292}
        code={`def estimate_flops(self):
    """
    Return the estimated FLOPs per token (forward + backward).
    Each matmul parameter: 2 FLOPs forward (multiply + accumulate),
    and 2X that in backward => 2+4=6 FLOPs per parameter per token.
    Plus 12 * h * q * effective_seq_len for attention QK matmul.
    """
    nparams = sum(p.numel() for p in self.parameters())
    nparams_exclude = ...  # embeddings, scalars (not matmuls)
    num_flops_per_token = 6 * (nparams - nparams_exclude) + attn_flops
    return num_flops_per_token`} />

      <Quiz question="Why does nanochat use different optimizers for different parameter types?"
        options={["To make the code more complex and educational","Because different parameter shapes have different optimization landscapes","To reduce the total number of parameters","Because AdamW is deprecated and being replaced by Muon"]}
        correctIndex={1} explanation="2D weight matrices benefit from orthogonalized updates (Muon), which ensures uniform update magnitudes across neurons. But 1D parameters (embeddings, scalars) don't have this geometric structure — AdamW works better for them." />

      <Quiz question="What does 'BPB' (bits per byte) measure?"
        options={["The number of parameters in the model","The speed of training in bytes per second","How well the model compresses text — lower is better","The size of the vocabulary in bits"]}
        correctIndex={2} explanation="BPB measures how many bits the model needs on average to predict each byte of text. Lower BPB = the model is better at predicting (compressing) text." />
    </div>
  )
}
