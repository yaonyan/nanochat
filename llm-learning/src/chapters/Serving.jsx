import { useState } from 'react'
import CodeBlock from '../components/CodeBlock'
import Callout from '../components/Callout'
import InteractiveDemo from '../components/InteractiveDemo'
import DiagramBox from '../components/DiagramBox'
import Quiz from '../components/Quiz'
import { useTheme } from '../context/ThemeContext'
import { ArrowRight, Check, X } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Interactive: API Request Builder                                    */
/* ------------------------------------------------------------------ */
function APIRequestBuilder() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [messages, setMessages] = useState([
    { role: 'user', content: 'What is the capital of France?' }
  ])
  const [temperature, setTemperature] = useState(0.8)
  const [maxTokens, setMaxTokens] = useState(512)
  const [topK, setTopK] = useState(50)

  const addMessage = () => {
    const nextRole = messages.length > 0 && messages[messages.length - 1].role === 'user' ? 'assistant' : 'user'
    setMessages([...messages, { role: nextRole, content: '' }])
  }

  const removeMessage = (index) => {
    setMessages(messages.filter((_, i) => i !== index))
  }

  const updateMessage = (index, field, value) => {
    const updated = [...messages]
    updated[index] = { ...updated[index], [field]: value }
    setMessages(updated)
  }

  const curlCommand = `curl -X POST http://localhost:8000/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({
    messages: messages.filter(m => m.content),
    temperature,
    max_tokens: maxTokens,
    top_k: topK
  }, null, 2).replace(/'/g, "'\\''")}'`

  const pythonCode = `import requests
import json

response = requests.post(
    "http://localhost:8000/chat/completions",
    json={
        "messages": ${JSON.stringify(messages.filter(m => m.content), null, 8).replace(/^/gm, '        ').trim()},
        "temperature": ${temperature},
        "max_tokens": ${maxTokens},
        "top_k": ${topK}
    },
    stream=True
)

for line in response.iter_lines():
    if line:
        data = json.loads(line.decode().removeprefix("data: "))
        if "token" in data:
            print(data["token"], end="", flush=True)
        elif data.get("done"):
            print()  # newline at end`

  return (
    <div className="space-y-4">
      {/* Messages */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
          Messages
        </label>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 mb-2 items-start`}>
            <select
              value={msg.role}
              onChange={(e) => updateMessage(i, 'role', e.target.value)}
              className={`px-2 py-1.5 rounded-lg text-sm font-mono ${
                isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              } border`}
            >
              <option value="user">user</option>
              <option value="assistant">assistant</option>
            </select>
            <input
              type="text"
              value={msg.content}
              onChange={(e) => updateMessage(i, 'content', e.target.value)}
              placeholder="Message content..."
              className={`flex-1 px-3 py-1.5 rounded-lg text-sm ${
                isDark ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
              } border`}
            />
            {messages.length > 1 && (
              <button
                onClick={() => removeMessage(i)}
                className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-slate-100 text-slate-400'}`}
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addMessage}
          className={`text-sm px-3 py-1 rounded-lg ${
            isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
          }`}
        >
          + Add message
        </button>
      </div>

      {/* Parameters */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            temperature: {temperature}
          </label>
          <input
            type="range" min="0" max="2" step="0.1" value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-slate-500"
          />
        </div>
        <div>
          <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            max_tokens: {maxTokens}
          </label>
          <input
            type="range" min="1" max="4096" step="1" value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            className="w-full accent-slate-500"
          />
        </div>
        <div>
          <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            top_k: {topK}
          </label>
          <input
            type="range" min="0" max="200" step="1" value={topK}
            onChange={(e) => setTopK(parseInt(e.target.value))}
            className="w-full accent-slate-500"
          />
        </div>
      </div>

      {/* Generated curl */}
      <div>
        <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
          Generated curl command:
        </div>
        <CodeBlock code={curlCommand} filename="terminal" />
      </div>

      {/* Python example */}
      <div>
        <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
          Python client with streaming:
        </div>
        <CodeBlock code={pythonCode} filename="client.py" />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Interactive: OpenAI vs NanoChat API Comparison                     */
/* ------------------------------------------------------------------ */
function APIComparisonTable() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const rows = [
    { field: 'Endpoint', openai: 'POST /v1/chat/completions', nanochat: 'POST /chat/completions' },
    { field: 'Auth', openai: 'Bearer token (API key)', nanochat: 'None (local server)' },
    { field: 'model', openai: 'Required (e.g. "gpt-4o")', nanochat: 'Not needed (single model)' },
    { field: 'messages', openai: 'system / user / assistant / tool', nanochat: 'user / assistant' },
    { field: 'temperature', openai: '0.0–2.0 (default 1.0)', nanochat: '0.0–2.0 (default 0.8)' },
    { field: 'token limit', openai: 'chat: max_completion_tokens | legacy completions: max_tokens', nanochat: 'max_tokens (1–4096)' },
    { field: 'top_k', openai: 'Not supported (uses top_p)', nanochat: '0–200 (0 = disabled)' },
    { field: 'top_p', openai: '0.0–1.0 (nucleus sampling)', nanochat: 'Not supported' },
    { field: 'stream', openai: 'true/false (SSE chunks)', nanochat: 'Always streaming (SSE)' },
    { field: 'Stream format', openai: 'data: {"choices":[{"delta":{"content":"..."}}]}', nanochat: 'data: {"token":"...","gpu":0}' },
    { field: 'Stop signal', openai: 'data: [DONE]', nanochat: 'data: {"done":true}' },
    { field: 'Response ID', openai: 'chatcmpl-xxx (unique per request)', nanochat: 'Not included' },
    { field: 'Usage stats', openai: 'prompt_tokens + completion_tokens', nanochat: 'Not included' },
    { field: 'n (num choices)', openai: 'Multiple choices per request', nanochat: 'Single completion only' },
    { field: 'Rate limiting', openai: 'Per-key RPM/TPM limits', nanochat: 'Input validation only' },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className={isDark ? 'border-b border-gray-700' : 'border-b border-slate-200'}>
            <th className={`text-left py-2 px-3 font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Field</th>
            <th className={`text-left py-2 px-3 font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>OpenAI</th>
            <th className={`text-left py-2 px-3 font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>nanochat</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={`${isDark ? 'border-b border-gray-800' : 'border-b border-slate-100'} ${
              i % 2 === 0 ? (isDark ? 'bg-gray-900/30' : 'bg-slate-50/50') : ''
            }`}>
              <td className={`py-2 px-3 font-mono text-xs ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>{row.field}</td>
              <td className={`py-2 px-3 font-mono text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{row.openai}</td>
              <td className={`py-2 px-3 font-mono text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{row.nanochat}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Interactive: Request Flow Visualizer                               */
/* ------------------------------------------------------------------ */
function RequestFlowDiagram() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [activeStep, setActiveStep] = useState(null)

  const steps = [
    { id: 'client', label: 'Client', desc: 'Browser / curl / Python sends POST request with messages + params' },
    { id: 'validate', label: 'Validate', desc: 'FastAPI validates message count, lengths, temperature range, top_k bounds' },
    { id: 'tokenize', label: 'Tokenize', desc: 'Convert messages to token IDs with special tokens: <|user_start|>, <|user_end|>, <|assistant_start|>' },
    { id: 'acquire', label: 'Acquire GPU', desc: 'WorkerPool assigns an available GPU worker (async queue, blocks if all busy)' },
    { id: 'generate', label: 'Generate', desc: 'Engine runs prefill → decode loop with KV cache, sampling with temperature + top_k' },
    { id: 'stream', label: 'Stream SSE', desc: 'Each token is sent as SSE event: data: {"token": "...", "gpu": 0}' },
    { id: 'done', label: 'Done', desc: 'Final event: data: {"done": true}. GPU worker is released back to pool.' },
  ]

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1 justify-center">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeStep === step.id
                  ? (isDark ? 'bg-sky-900/40 text-sky-300 border border-sky-700/50' : 'bg-sky-50 text-sky-700 border border-sky-200')
                  : (isDark ? 'bg-gray-800/60 text-gray-400 border border-gray-700/50 hover:bg-gray-800' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100')
              }`}
            >
              {step.label}
            </button>
            {i < steps.length - 1 && (
              <ArrowRight size={12} className={`mx-1 ${isDark ? 'text-gray-600' : 'text-slate-300'}`} />
            )}
          </div>
        ))}
      </div>
      {activeStep && (
        <div className={`text-sm p-3 rounded-lg ${isDark ? 'bg-gray-800/60 text-gray-300' : 'bg-slate-50 text-slate-600'}`}>
          {steps.find(s => s.id === activeStep)?.desc}
        </div>
      )}
      <p className={`text-xs text-center ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
        Click each step to see details
      </p>
    </div>
  )
}

/* ================================================================== */
/*  Chapter 10: Serving & API Design                                  */
/* ================================================================== */
export default function Serving() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div>
      <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>
        Serving & API Design
      </h1>
      <p className={`mb-8 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
        From trained model to production API — deployment, multi-GPU serving, and real-world API design
      </p>

      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        You have trained a model, evaluated it, and run inference locally. But a model sitting on disk
        is useless until users can reach it. This chapter covers how nanochat wraps the trained GPT model
        into a web API, how the API is designed, and how it compares to the industry-standard OpenAI Chat
        Completions API.
      </p>

      {/* ------------------------------------------------------------ */}
      {/*  Section 1: The Serving Stack                                 */}
      {/* ------------------------------------------------------------ */}
      <h2 className={`text-2xl font-semibold mt-10 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>
        1. The Serving Stack
      </h2>

      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        Serving an LLM requires a different architecture than training. During training, you maximize GPU
        utilization by processing large batches. During serving, you handle concurrent user requests with
        low latency. Here is nanochat's serving stack:
      </p>

      <DiagramBox label="nanochat Serving Architecture">
        <div className="flex flex-col gap-3 text-xs font-mono">
          {[
            { layer: 'Web Framework', detail: 'FastAPI + uvicorn (ASGI, async I/O)', color: isDark ? 'border-sky-800/50 bg-sky-900/20 text-sky-300' : 'border-sky-200 bg-sky-50 text-sky-700' },
            { layer: 'API Layer', detail: 'Pydantic validation, CORS middleware, SSE streaming', color: isDark ? 'border-slate-700/50 bg-slate-800/30 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600' },
            { layer: 'Worker Pool', detail: 'asyncio.Queue — one worker per GPU, request-level parallelism', color: isDark ? 'border-emerald-800/50 bg-emerald-900/20 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700' },
            { layer: 'Engine', detail: 'KV cache, prefill/decode loop, tool-use (calculator)', color: isDark ? 'border-amber-800/50 bg-amber-900/20 text-amber-300' : 'border-amber-200 bg-amber-50 text-amber-700' },
            { layer: 'Model', detail: 'GPT weights on GPU(s), autocast to bfloat16', color: isDark ? 'border-gray-700/50 bg-gray-800/30 text-gray-400' : 'border-slate-200 bg-slate-100 text-slate-600' },
          ].map(({ layer, detail, color }) => (
            <div key={layer} className={`border rounded-lg px-4 py-2.5 ${color}`}>
              <span className="font-semibold">{layer}</span>
              <span className={`ml-2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>— {detail}</span>
            </div>
          ))}
        </div>
      </DiagramBox>

      <Callout type="key">
        nanochat uses <strong>data parallelism for serving</strong>: each GPU loads a full copy of the model.
        Incoming requests are distributed to available workers via an async queue. This is the simplest
        multi-GPU serving strategy — no tensor parallelism, no pipeline parallelism, just N independent replicas.
      </Callout>

      <CodeBlock
        filename="scripts/chat_web.py"
        startLine={98}
        code={`class WorkerPool:
    """Pool of workers, each with a model replica on a different GPU."""

    def __init__(self, num_gpus: Optional[int] = None):
        if num_gpus is None:
            if device_type == "cuda":
                num_gpus = torch.cuda.device_count()
            else:
                num_gpus = 1  # e.g. cpu|mps
        self.num_gpus = num_gpus
        self.workers: List[Worker] = []
        self.available_workers: asyncio.Queue = asyncio.Queue()

    async def acquire_worker(self) -> Worker:
        """Get an available worker from the pool."""
        return await self.available_workers.get()

    async def release_worker(self, worker: Worker):
        """Return a worker to the pool."""
        await self.available_workers.put(worker)`}
      />

      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        The pattern is straightforward: <code className={`px-1.5 py-0.5 rounded text-sm ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'}`}>asyncio.Queue</code> acts
        as a semaphore — if all GPUs are busy, the next request simply awaits until a worker is freed.
        No complex scheduling, no request batching. For a small-scale deployment, this is exactly right.
      </p>

      {/* ------------------------------------------------------------ */}
      {/*  Section 2: Request Lifecycle                                 */}
      {/* ------------------------------------------------------------ */}
      <h2 className={`text-2xl font-semibold mt-10 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>
        2. Request Lifecycle
      </h2>

      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        Every chat request flows through a well-defined pipeline. Click each step below to see what happens:
      </p>

      <InteractiveDemo title="Request Flow: Client → Response">
        <RequestFlowDiagram />
      </InteractiveDemo>

      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        The key design decision is <strong>streaming by default</strong>. Unlike a traditional REST API that
        waits for the entire response, nanochat uses Server-Sent Events (SSE) to push each token as it is
        generated. This means the user sees output immediately, even if the full response takes seconds.
      </p>

      <CodeBlock
        filename="scripts/chat_web.py"
        startLine={262}
        code={`async def generate_stream(
    worker: Worker,
    tokens,
    temperature=None,
    max_new_tokens=None,
    top_k=None
) -> AsyncGenerator[str, None]:
    """Generate assistant response with streaming."""
    # ...
    with worker.autocast_ctx:
        for token_column, token_masks in worker.engine.generate(
            tokens, num_samples=1, max_tokens=max_new_tokens,
            temperature=temperature, top_k=top_k,
            seed=random.randint(0, 2**31 - 1)
        ):
            token = token_column[0]
            if token == assistant_end or token == bos:
                break

            accumulated_tokens.append(token)
            current_text = worker.tokenizer.decode(accumulated_tokens)

            # Only emit when we have complete UTF-8 characters
            if not current_text.endswith('\\ufffd'):
                new_text = current_text[len(last_clean_text):]
                if new_text:
                    yield f"data: {json.dumps({'token': new_text, 'gpu': worker.gpu_id})}\\n\\n"
                    last_clean_text = current_text

    yield f"data: {json.dumps({'done': True})}\\n\\n"`}
      />

      <Callout type="info">
        Notice the UTF-8 handling: some tokens are fragments of multi-byte characters (e.g., emoji).
        The server accumulates tokens and only emits text when the decoded string does not end with
        the Unicode replacement character <code className={`px-1.5 py-0.5 rounded text-sm ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'}`}>U+FFFD</code>.
        This prevents garbled output on the client side.
      </Callout>

      {/* ------------------------------------------------------------ */}
      {/*  Section 3: Chat Template — Turning Messages into Tokens      */}
      {/* ------------------------------------------------------------ */}
      <h2 className={`text-2xl font-semibold mt-10 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>
        3. Chat Template — Turning Messages into Tokens
      </h2>

      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        A chat API accepts structured messages (<code className={`px-1.5 py-0.5 rounded text-sm ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'}`}>role</code> + <code className={`px-1.5 py-0.5 rounded text-sm ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'}`}>content</code>),
        but the model only understands token IDs. The chat template bridges this gap using special tokens
        that the model learned during SFT (supervised fine-tuning):
      </p>

      <DiagramBox label="Chat Template Encoding">
        <div className={`font-mono text-xs leading-loose ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
          <div className="flex flex-wrap gap-1 items-center">
            <span className={`px-2 py-0.5 rounded ${isDark ? 'bg-amber-900/30 text-amber-300 border border-amber-800/40' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>BOS</span>
            <span className={`px-2 py-0.5 rounded ${isDark ? 'bg-sky-900/30 text-sky-300 border border-sky-800/40' : 'bg-sky-50 text-sky-700 border border-sky-200'}`}>&lt;|user_start|&gt;</span>
            <span className={isDark ? 'text-gray-400' : 'text-slate-500'}>What is 2+2?</span>
            <span className={`px-2 py-0.5 rounded ${isDark ? 'bg-sky-900/30 text-sky-300 border border-sky-800/40' : 'bg-sky-50 text-sky-700 border border-sky-200'}`}>&lt;|user_end|&gt;</span>
            <span className={`px-2 py-0.5 rounded ${isDark ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-800/40' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>&lt;|assistant_start|&gt;</span>
            <span className={isDark ? 'text-gray-500' : 'text-slate-400'}>← model generates from here</span>
          </div>
        </div>
      </DiagramBox>

      <CodeBlock
        filename="scripts/chat_web.py"
        startLine={330}
        code={`# Build conversation tokens
bos = worker.tokenizer.get_bos_token_id()
user_start = worker.tokenizer.encode_special("<|user_start|>")
user_end = worker.tokenizer.encode_special("<|user_end|>")
assistant_start = worker.tokenizer.encode_special("<|assistant_start|>")
assistant_end = worker.tokenizer.encode_special("<|assistant_end|>")

conversation_tokens = [bos]
for message in request.messages:
    if message.role == "user":
        conversation_tokens.append(user_start)
        conversation_tokens.extend(worker.tokenizer.encode(message.content))
        conversation_tokens.append(user_end)
    elif message.role == "assistant":
        conversation_tokens.append(assistant_start)
        conversation_tokens.extend(worker.tokenizer.encode(message.content))
        conversation_tokens.append(assistant_end)

conversation_tokens.append(assistant_start)  # prompt the model to respond`}
      />

      <Callout type="key">
        The final <code className={`px-1.5 py-0.5 rounded text-sm ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'}`}>&lt;|assistant_start|&gt;</code> at the end is critical —
        it tells the model "now it's your turn to speak." Generation stops when the model
        produces <code className={`px-1.5 py-0.5 rounded text-sm ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'}`}>&lt;|assistant_end|&gt;</code> or the BOS token.
      </Callout>

      {/* ------------------------------------------------------------ */}
      {/*  Section 4: API Design — nanochat vs OpenAI                   */}
      {/* ------------------------------------------------------------ */}
      <h2 className={`text-2xl font-semibold mt-10 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>
        4. API Design — nanochat vs OpenAI
      </h2>

      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        OpenAI exposes both <code className={`px-1.5 py-0.5 rounded text-sm ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'}`}>POST /v1/completions</code>
        (legacy prompt-based API) and <code className={`px-1.5 py-0.5 rounded text-sm ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'}`}>POST /v1/chat/completions</code>
        (message-based API). nanochat is closer to Chat Completions in structure, but with a smaller parameter surface.
        Here is a side-by-side comparison:
      </p>

      <InteractiveDemo title="API Comparison: OpenAI vs nanochat">
        <APIComparisonTable />
      </InteractiveDemo>

      <h3 className={`text-xl font-semibold mt-8 mb-3 ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>
        OpenAI Legacy Completions (linked reference)
      </h3>

      <CodeBlock
        filename="openai_completions_example.py"
        code={`import openai

client = openai.OpenAI()

resp = client.completions.create(
    model="gpt-3.5-turbo-instruct",
    prompt="Write one sentence about KV cache.",
    temperature=0.7,
    max_tokens=64
)

print(resp.choices[0].text)`}
      />

      <h3 className={`text-xl font-semibold mt-8 mb-3 ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>
        OpenAI Chat Completions Request Format
      </h3>

      <CodeBlock
        filename="openai_example.py"
        code={`import openai

client = openai.OpenAI()

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is the capital of France?"}
    ],
    temperature=0.8,
    max_completion_tokens=512,
    stream=True
)

for chunk in response:
    delta = chunk.choices[0].delta
    if delta.content:
        print(delta.content, end="", flush=True)`}
      />

      <h3 className={`text-xl font-semibold mt-8 mb-3 ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>
        OpenAI Streaming Chunk Format
      </h3>

      <CodeBlock
        filename="openai_stream_chunk.json"
        code={`{
  "id": "chatcmpl-abc123",
  "object": "chat.completion.chunk",
  "created": 1709123456,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "delta": {
        "content": "Paris"
      },
      "finish_reason": null
    }
  ]
}

// Final chunk:
// data: [DONE]`}
      />

      <h3 className={`text-xl font-semibold mt-8 mb-3 ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>
        nanochat Streaming Format
      </h3>

      <CodeBlock
        filename="nanochat_stream.jsonl"
        code={`data: {"token": "Paris", "gpu": 0}
data: {"token": " is", "gpu": 0}
data: {"token": " the", "gpu": 0}
data: {"token": " capital", "gpu": 0}
data: {"done": true}`}
      />

      <Callout type="info">
        nanochat's streaming format is intentionally simpler: flat JSON with just the token text and GPU
        ID (useful for debugging multi-GPU setups). OpenAI's format wraps everything in a <code className={`px-1.5 py-0.5 rounded text-sm ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'}`}>choices</code> array
        to support multiple completions per request (<code className={`px-1.5 py-0.5 rounded text-sm ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'}`}>n &gt; 1</code>)
        and includes metadata like model name, usage stats, and finish reasons.
      </Callout>

      {/* ------------------------------------------------------------ */}
      {/*  Section 5: Input Validation & Abuse Prevention               */}
      {/* ------------------------------------------------------------ */}
      <h2 className={`text-2xl font-semibold mt-10 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>
        5. Input Validation & Abuse Prevention
      </h2>

      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        Any public-facing API must validate inputs. LLM APIs have unique concerns: a malicious user can
        exhaust GPU time by sending extremely long conversations or requesting thousands of output tokens.
        nanochat enforces hard limits:
      </p>

      <div className={`grid grid-cols-2 gap-3 mb-6`}>
        {[
          { param: 'Max messages', value: '500 per request' },
          { param: 'Max message length', value: '8,000 chars each' },
          { param: 'Max conversation', value: '32,000 chars total' },
          { param: 'Temperature', value: '0.0 – 2.0' },
          { param: 'Top-k', value: '0 – 200' },
          { param: 'Max tokens', value: '1 – 4,096' },
        ].map(({ param, value }) => (
          <div key={param} className={`px-4 py-3 rounded-lg border text-sm ${
            isDark ? 'border-gray-700/50 bg-gray-800/30' : 'border-slate-200 bg-slate-50'
          }`}>
            <div className={`font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>{param}</div>
            <div className={`font-mono text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{value}</div>
          </div>
        ))}
      </div>

      <CodeBlock
        filename="scripts/chat_web.py"
        startLine={160}
        code={`def validate_chat_request(request: ChatRequest):
    """Validate chat request to prevent abuse."""
    if len(request.messages) == 0:
        raise HTTPException(status_code=400, detail="At least one message is required")
    if len(request.messages) > MAX_MESSAGES_PER_REQUEST:
        raise HTTPException(status_code=400,
            detail=f"Too many messages. Maximum {MAX_MESSAGES_PER_REQUEST} allowed")

    total_length = 0
    for i, message in enumerate(request.messages):
        msg_length = len(message.content)
        if msg_length > MAX_MESSAGE_LENGTH:
            raise HTTPException(status_code=400,
                detail=f"Message {i} too long. Max {MAX_MESSAGE_LENGTH} chars")
        total_length += msg_length

    if total_length > MAX_TOTAL_CONVERSATION_LENGTH:
        raise HTTPException(status_code=400,
            detail=f"Conversation too long. Max {MAX_TOTAL_CONVERSATION_LENGTH} chars")`}
      />

      <Callout type="key">
        <strong>OpenAI's approach is more sophisticated:</strong> they use per-API-key rate limits (requests per
        minute and tokens per minute), usage tiers, and spending caps. nanochat skips authentication entirely
        since it is designed for local or trusted-network use. If you were deploying nanochat publicly, you
        would add authentication and rate limiting.
      </Callout>

      {/* ------------------------------------------------------------ */}
      {/*  Section 6: CORS, Health Checks & Operational Endpoints       */}
      {/* ------------------------------------------------------------ */}
      <h2 className={`text-2xl font-semibold mt-10 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>
        6. CORS, Health Checks & Operational Endpoints
      </h2>

      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        Beyond the chat endpoint, a production API needs operational endpoints for monitoring and
        cross-origin access:
      </p>

      <div className={`space-y-3 mb-6`}>
        {[
          { method: 'GET', path: '/', desc: 'Serves the built-in chat UI (ui.html) — no separate frontend deploy needed' },
          { method: 'POST', path: '/chat/completions', desc: 'The main chat API — streaming SSE response' },
          { method: 'GET', path: '/health', desc: 'Returns worker pool status: ready state, GPU count, available workers' },
          { method: 'GET', path: '/stats', desc: 'Detailed worker stats: total/available/busy workers, per-GPU device info' },
          { method: 'GET', path: '/logo.svg', desc: 'Serves the NanoChat logo for favicon and header' },
        ].map(({ method, path, desc }) => (
          <div key={path} className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${
            isDark ? 'border-gray-700/50 bg-gray-800/30' : 'border-slate-200 bg-slate-50'
          }`}>
            <span className={`font-mono text-xs px-2 py-0.5 rounded font-semibold shrink-0 ${
              method === 'POST'
                ? (isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
                : (isDark ? 'bg-sky-900/30 text-sky-400' : 'bg-sky-50 text-sky-600')
            }`}>
              {method}
            </span>
            <div>
              <code className={`text-sm font-mono ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>{path}</code>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <CodeBlock
        filename="scripts/chat_web.py"
        startLine={384}
        code={`@app.get("/health")
async def health():
    """Health check endpoint."""
    worker_pool = getattr(app.state, 'worker_pool', None)
    return {
        "status": "ok",
        "ready": worker_pool is not None and len(worker_pool.workers) > 0,
        "num_gpus": worker_pool.num_gpus if worker_pool else 0,
        "available_workers": worker_pool.available_workers.qsize() if worker_pool else 0
    }`}
      />

      <Callout type="info">
        <strong>CORS is wide open</strong> (<code className={`px-1.5 py-0.5 rounded text-sm ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'}`}>allow_origins=["*"]</code>)
        because nanochat is designed for local development. A production API would restrict origins
        to known domains and require authentication headers.
      </Callout>

      {/* ------------------------------------------------------------ */}
      {/*  Section 7: Launching the Server                              */}
      {/* ------------------------------------------------------------ */}
      <h2 className={`text-2xl font-semibold mt-10 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>
        7. Launching the Server
      </h2>

      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        nanochat's server is launched as a Python module. The <code className={`px-1.5 py-0.5 rounded text-sm ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'}`}>lifespan</code> context
        manager loads models on startup and keeps them in GPU memory for the server's lifetime:
      </p>

      <CodeBlock
        filename="terminal"
        code={`# Single GPU (default)
python -m scripts.chat_web

# 4 GPUs with custom settings
python -m scripts.chat_web --num-gpus 4 --temperature 0.7 --top-k 40 --max-tokens 1024

# CPU/MPS (no CUDA required)
python -m scripts.chat_web --device-type cpu
python -m scripts.chat_web --device-type mps  # Apple Silicon

# Custom model and port
python -m scripts.chat_web --model-tag my_experiment --step 5000 --port 3000`}
      />

      <CodeBlock
        filename="scripts/chat_web.py"
        startLine={223}
        code={`@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on all GPUs on startup."""
    print("Loading nanochat models across GPUs...")
    app.state.worker_pool = WorkerPool(num_gpus=args.num_gpus)
    await app.state.worker_pool.initialize(
        args.source, model_tag=args.model_tag, step=args.step
    )
    print(f"Server ready at http://localhost:{args.port}")
    yield  # server runs here

app = FastAPI(lifespan=lifespan)`}
      />

      <Callout type="key">
        The <code className={`px-1.5 py-0.5 rounded text-sm ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'}`}>lifespan</code> pattern
        in FastAPI replaces the older <code className={`px-1.5 py-0.5 rounded text-sm ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'}`}>@app.on_event("startup")</code>.
        Everything before <code className={`px-1.5 py-0.5 rounded text-sm ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'}`}>yield</code> runs
        on startup, everything after runs on shutdown. This ensures models are loaded before the server
        accepts any requests.
      </Callout>

      {/* ------------------------------------------------------------ */}
      {/*  Section 8: Try It — Build Your Own Request                   */}
      {/* ------------------------------------------------------------ */}
      <h2 className={`text-2xl font-semibold mt-10 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>
        8. Try It — Build Your Own Request
      </h2>

      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        Use the interactive builder below to construct a request. Adjust the messages and parameters,
        then copy the generated curl command or Python code to test against a running nanochat server:
      </p>

      <InteractiveDemo title="API Request Builder">
        <APIRequestBuilder />
      </InteractiveDemo>

      {/* ------------------------------------------------------------ */}
      {/*  Section 9: What a Production API Adds                        */}
      {/* ------------------------------------------------------------ */}
      <h2 className={`text-2xl font-semibold mt-10 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>
        9. What a Production API Adds
      </h2>

      <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        nanochat's API is intentionally minimal. A production LLM API (like OpenAI's) adds many
        additional layers. Here is what nanochat does <em>not</em> implement and why production systems need them:
      </p>

      <div className={`space-y-3 mb-6`}>
        {[
          { feature: 'Authentication & API Keys', reason: 'Track usage per customer, enforce billing and access control. OpenAI uses Bearer tokens; most APIs use similar patterns.', has: false },
          { feature: 'Rate Limiting', reason: 'Prevent a single user from monopolizing GPU time. OpenAI enforces per-key RPM (requests per minute) and TPM (tokens per minute) limits.', has: false },
          { feature: 'Usage Tracking', reason: 'Count prompt and completion tokens for billing. OpenAI returns usage stats in every response.', has: false },
          { feature: 'Model Selection', reason: 'Route requests to different models (GPT-4o, GPT-4o-mini, etc.). nanochat serves a single model.', has: false },
          { feature: 'Function/Tool Calling', reason: 'Let the model invoke external tools via structured JSON. OpenAI supports this in the API protocol itself.', has: false },
          { feature: 'Content Filtering', reason: 'Detect and block harmful content in both inputs and outputs. Production APIs add safety classifiers in the pipeline.', has: false },
          { feature: 'Multiple Choices (n)', reason: 'Generate N completions per request for the user to pick from. Requires the choices[] array wrapper in streaming.', has: false },
          { feature: 'Request Batching', reason: 'Combine multiple requests into a single GPU forward pass for throughput. Frameworks like vLLM and TGI implement continuous batching.', has: false },
        ].map(({ feature, reason, has }) => (
          <div key={feature} className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${
            isDark ? 'border-gray-700/50 bg-gray-800/30' : 'border-slate-200 bg-slate-50'
          }`}>
            <div className={`mt-0.5 shrink-0 ${has ? (isDark ? 'text-emerald-400' : 'text-emerald-500') : (isDark ? 'text-gray-600' : 'text-slate-300')}`}>
              {has ? <Check size={16} /> : <X size={16} />}
            </div>
            <div>
              <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>{feature}</div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{reason}</p>
            </div>
          </div>
        ))}
      </div>

      <Callout type="math">
        <strong>Decode-time cost (with KV cache):</strong> each new token reuses past K/V, so per-layer compute is
        dominated by projections/MLP (roughly O(B×d²)) plus attention against cached context (roughly O(B×C×d)).
        Memory for the cache grows as O(B×C×d), which often becomes the serving bottleneck before raw FLOPs.
      </Callout>

      {/* ------------------------------------------------------------ */}
      {/*  Quiz                                                         */}
      {/* ------------------------------------------------------------ */}
      <h2 className={`text-2xl font-semibold mt-10 mb-4 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>
        Knowledge Check
      </h2>

      <Quiz
        question="Why does nanochat use asyncio.Queue for its worker pool instead of a thread pool?"
        options={[
          "Because Python threads cannot use GPUs",
          "Because asyncio.Queue integrates naturally with FastAPI's async request handling — a request simply awaits a worker without blocking the event loop",
          "Because asyncio.Queue is faster than threading.Queue",
          "Because CUDA requires async operations"
        ]}
        correctIndex={1}
        explanation="FastAPI is built on ASGI and runs on an async event loop. asyncio.Queue lets the server handle many concurrent connections while waiting for GPU workers, without blocking threads. The GPU computation itself runs synchronously within the acquired worker."
      />

      <Quiz
        question="What is the key difference between nanochat's streaming format and OpenAI's?"
        options={[
          "nanochat uses WebSocket while OpenAI uses SSE",
          "nanochat sends raw text while OpenAI sends JSON",
          "nanochat sends flat {token, gpu} objects and ends with {done: true}, while OpenAI wraps tokens in choices[].delta.content and ends with [DONE]",
          "There is no difference — they use the same format"
        ]}
        correctIndex={2}
        explanation="nanochat's format is simpler: each SSE event contains {token: '...', gpu: N} directly. OpenAI's format nests the content inside choices[0].delta.content to support multiple simultaneous completions (n > 1), includes metadata like model name and finish_reason, and uses the literal string [DONE] as the stream terminator."
      />

      <Quiz
        question="Why does the server check for the Unicode replacement character (U+FFFD) before emitting tokens?"
        options={[
          "To filter out invalid tokens from the model",
          "To ensure multi-byte characters (like emoji) are fully decoded before sending to the client",
          "To compress the output stream",
          "To detect when the model is hallucinating"
        ]}
        correctIndex={1}
        explanation="BPE tokenizers can split multi-byte UTF-8 characters across multiple tokens. If you decode a partial sequence, Python's bytes.decode() produces the replacement character U+FFFD. By waiting until the decoded text is clean, the server ensures clients receive valid UTF-8 text."
      />
    </div>
  )
}
