import CodeBlock from '../components/CodeBlock'
import Callout from '../components/Callout'
import DiagramBox from '../components/DiagramBox'
import { useTheme } from '../context/ThemeContext'
import { Monitor, Gpu, Server, CheckCircle2, Award } from 'lucide-react'

export default function RunProject() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div>
      <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Run nanochat Yourself</h1>
      <p className={`mb-8 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>From setup to chatting with your own LLM</p>

      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        Ready to train your own LLM? Here's how to get nanochat running on your machine.
        There are options for everything from a CPU laptop to an 8×H100 GPU node.
      </p>

      <h2 className={`text-2xl font-semibold mt-10 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Prerequisites</h2>

      <div className="space-y-3 mb-6">
        {[
          { tool: 'Python 3.10+', cmd: 'python --version' },
          { tool: 'uv (fast Python package manager)', cmd: 'curl -LsSf https://astral.sh/uv/install.sh | sh' },
          { tool: 'Git', cmd: 'git --version' },
        ].map((item) => (
          <div key={item.tool} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${isDark ? 'bg-gray-800/50' : 'bg-slate-50'}`}>
            <CheckCircle2 size={16} className={isDark ? 'text-green-400' : 'text-green-500'} />
            <span className={`text-sm flex-1 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>{item.tool}</span>
            <code className={`text-xs px-2 py-1 rounded ${isDark ? 'text-gray-500 bg-gray-900' : 'text-slate-500 bg-slate-100'}`}>{item.cmd}</code>
          </div>
        ))}
      </div>

      <h2 className={`text-2xl font-semibold mt-10 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Step 1: Clone & Install</h2>

      <CodeBlock language="bash" filename="Terminal"
        code={`# Clone the repo
git clone https://github.com/karpathy/nanochat.git
cd nanochat

# Install with uv (creates a virtual environment automatically)
# For CPU only (Mac, laptop, no GPU):
uv sync --extra cpu

# For GPU (CUDA 12.8):
uv sync --extra gpu

# Activate the virtual environment
source .venv/bin/activate`} />

      <h2 className={`text-2xl font-semibold mt-10 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Step 2: Choose Your Path</h2>

      <DiagramBox label="Training Options">
        <div className="space-y-4">
          {[
            { Icon: Monitor, title: 'CPU / Apple Silicon (Quick test)', time: '~30-40 min', desc: 'Train a tiny model on your laptop. Won\'t produce great results, but lets you see the full pipeline.', cmd: 'bash runs/runcpu.sh', dark: 'bg-gray-800/30 border-gray-700/40', light: 'bg-slate-50 border-slate-200', textD: 'text-gray-200', textL: 'text-slate-800', badgeD: 'bg-gray-800 text-gray-300', badgeL: 'bg-slate-100 text-slate-700' },
            { Icon: Gpu, title: 'Single GPU (Experiments)', time: '~5 min for d12', desc: 'Run quick experiments with a 12-layer model. Great for research iteration.', cmd: 'python -m scripts.base_train -- --depth=12 --run="d12"', dark: 'bg-gray-800/30 border-gray-700/40', light: 'bg-slate-50 border-slate-200', textD: 'text-gray-200', textL: 'text-slate-800', badgeD: 'bg-gray-800 text-gray-300', badgeL: 'bg-slate-100 text-slate-700' },
            { Icon: Server, title: '8×H100 GPUs (Full GPT-2)', time: '~3 hours / ~$72', desc: 'Train a full GPT-2 capability model and talk to it via ChatGPT-like web UI.', cmd: 'bash runs/speedrun.sh', dark: 'bg-gray-800/30 border-gray-700/40', light: 'bg-slate-50 border-slate-200', textD: 'text-gray-200', textL: 'text-slate-800', badgeD: 'bg-gray-800 text-gray-300', badgeL: 'bg-slate-100 text-slate-700' },
          ].map(({ Icon, title, time, desc, cmd, dark, light, textD, textL, badgeD, badgeL }) => (
            <div key={title} className={`border rounded-xl p-4 ${isDark ? dark : light}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={18} className={isDark ? textD : textL} />
                <span className={`font-semibold ${isDark ? textD : textL}`}>{title}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${isDark ? badgeD : badgeL}`}>{time}</span>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{desc}</p>
              <code className={`text-xs mt-2 block ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{cmd}</code>
            </div>
          ))}
        </div>
      </DiagramBox>

      <h2 className={`text-2xl font-semibold mt-10 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Step 3: The Speedrun (Full Pipeline)</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        The speedrun script runs the complete LLM pipeline end-to-end:
      </p>

      <CodeBlock language="bash" filename="runs/speedrun.sh (simplified)"
        code={`#!/bin/bash
# 1. Download and prepare the pretraining data (FineWeb-Edu)
python -m nanochat.dataset

# 2. Train the tokenizer (BPE, 32K vocab)
python -m scripts.tok_train

# 3. Pretrain the base model (8 GPUs, ~3 hours for d26)
OMP_NUM_THREADS=1 torchrun --standalone --nproc_per_node=8 \\
    -m scripts.base_train -- --depth=26 --run="speedrun"

# 4. Evaluate the base model (CORE score, samples)
python -m scripts.base_eval

# 5. Fine-tune for chat (SFT on SmolTalk + SpellingBee + ...)
torchrun --standalone --nproc_per_node=8 \\
    -m scripts.chat_sft -- --run="speedrun_sft"

# 6. (Optional) Reinforcement Learning from tasks
torchrun --standalone --nproc_per_node=8 \\
    -m scripts.chat_rl -- --run="speedrun_rl"

# 7. Launch the chat web UI!
python -m scripts.chat_web`} />

      <h2 className={`text-2xl font-semibold mt-10 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Step 4: Talk to Your Model</h2>

      <CodeBlock language="bash" filename="Terminal"
        code={`# Launch the ChatGPT-like web UI
python -m scripts.chat_web

# Or use the CLI
python -m scripts.chat_cli`} />

      <Callout type="info">
        The web UI serves a ChatGPT-like interface. If running on a remote GPU server,
        access it at <code>http://YOUR_SERVER_IP:8000/</code>. The model streams
        responses token by token, just like ChatGPT!
      </Callout>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Running on CPU / Apple Silicon</h2>
      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        For a quick test without a GPU, the <code>runcpu.sh</code> script trains a very small model:
      </p>

      <CodeBlock language="bash" filename="runs/runcpu.sh (key parts)"
        code={`# Install CPU-only dependencies
uv sync --extra cpu

# Download data
python -m nanochat.dataset

# Train tokenizer
python -m scripts.tok_train

# Train a tiny model (d6 = 6 layers, very small)
python -m scripts.base_train \\
    --depth=6 \\
    --head-dim=64 \\
    --window-pattern=L \\
    --max-seq-len=512 \\
    --device-batch-size=32 \\
    --total-batch-size=16384 \\
    --eval-every=100 \\
    --eval-tokens=524288 \\
    --core-metric-every=-1 \\
    --sample-every=100 \\
    --num-iterations=5000 \\
    --run=$WANDB_RUN

# Fine-tune for chat
python -m scripts.chat_sft \\
    --max-seq-len=512 \\
    --device-batch-size=32 \\
    --total-batch-size=16384 \\
    --eval-every=200 \\
    --eval-tokens=524288 \\
    --num-iterations=1500 \\
    --run=$WANDB_RUN

# Chat!
python -m scripts.chat_web`} />

      <Callout type="key">
        <strong>What to expect on CPU:</strong> A d6 model is very tiny — it'll produce somewhat coherent
        text but won't be "smart". The point is to see the full pipeline work end-to-end. For meaningful
        results, you need at least a single decent GPU (A100, 4090, etc).
      </Callout>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Key Metrics to Watch</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-6">
        {[
          { name: 'val_bpb', desc: 'Validation bits per byte. Lower = better compression = better model. GPT-2 achieves ~0.75.' },
          { name: 'core_metric', desc: 'DCLM CORE score. GPT-2 = 0.2565. Higher = better on diverse benchmarks.' },
          { name: 'train/mfu', desc: 'Model FLOPs Utilization. How efficiently you\'re using the GPU. Higher = faster training.' },
        ].map(({ name, desc }) => (
          <div key={name} className={`border rounded-xl p-4 ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-slate-50 border-slate-200'}`}>
            <p className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{name}</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{desc}</p>
          </div>
        ))}
      </div>

      <h2 className={`text-2xl font-semibold mt-12 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Recap: What You've Learned</h2>

      <div className="space-y-3 my-6">
        {[
          { ch: '1', title: 'Tokenization', summary: 'BPE converts text → integer IDs using learned merge rules' },
          { ch: '2', title: 'Embeddings', summary: 'Token IDs → dense vectors. RoPE encodes position through rotation' },
          { ch: '3', title: 'Self-Attention', summary: 'Q·K scores determine how tokens attend to each other' },
          { ch: '4', title: 'Transformer Block', summary: 'Attention + MLP with residual connections. Pre-norm, ReLU², x0 skip' },
          { ch: '5', title: 'GPT Model', summary: 'Stack of N blocks + embedding + output head. One dial controls everything' },
          { ch: '6', title: 'Training', summary: 'Cross-entropy loss + Muon/AdamW hybrid optimizer. Distributed across GPUs' },
          { ch: '7', title: 'Inference', summary: 'Autoregressive generation with KV cache. Temperature + top-k control randomness' },
        ].map((item) => (
          <div key={item.ch} className={`flex items-start gap-3 rounded-xl px-4 py-3 ${isDark ? 'bg-gray-800/30' : 'bg-slate-50'}`}>
            <span className={`font-bold text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{item.ch}</span>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>{item.title}</p>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{item.summary}</p>
            </div>
          </div>
        ))}
      </div>

      <Callout type="code">
        <strong>Next steps:</strong>
        <br />• Read the actual source code — start with <code>nanochat/gpt.py</code> (450 lines)
        <br />• Run a d12 experiment and watch the loss curve in wandb
        <br />• Try modifying something (e.g., activation function, number of heads) and see what happens
        <br />• Read the <a href="https://github.com/karpathy/nanochat/discussions" className="underline hover:text-slate-800 dark:hover:text-gray-100">Discussions</a> for deep dives
        <br />• Check out the <a href="https://deepwiki.com/karpathy/nanochat" className="underline hover:text-slate-800 dark:hover:text-gray-100">DeepWiki</a> to ask questions about the codebase
      </Callout>

      <div className={`mt-12 p-6 rounded-2xl border text-center ${
        isDark
          ? 'bg-gray-800/40 border-gray-700/50'
          : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex justify-center mb-3">
          <Award size={32} className={isDark ? 'text-gray-400' : 'text-slate-500'} />
        </div>
        <p className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>Congratulations!</p>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
          You now understand how an LLM works from the ground up — from raw text to a chatbot.
          The same fundamental architecture powers ChatGPT, Claude, Gemini, and all modern LLMs.
          The difference is just scale: more layers, more data, more compute.
        </p>
      </div>
    </div>
  )
}
