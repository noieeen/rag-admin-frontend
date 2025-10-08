<template>
  <div class="grid gap-6 lg:grid-cols-[18rem,1fr] xl:grid-cols-[20rem,1fr]">
    <aside class="hidden h-[calc(100vh-7.5rem)] rounded-3xl bg-muted/60 p-6 lg:flex lg:flex-col">
      <header class="mb-6 space-y-1">
        <h2 class="text-lg font-semibold text-foreground">Your chats</h2>
        <p class="text-xs text-muted-foreground">Mocked conversation history for wireframing the end-user flow.</p>
      </header>
      <ol class="space-y-3 text-sm text-muted-foreground">
        <li
          v-for="session in mockSessions"
          :key="session.id"
          :class="[
            'cursor-pointer rounded-2xl border border-transparent bg-background/80 px-4 py-3 transition hover:border-primary/40 hover:bg-background shadow-sm',
            session.id === activeSessionId ? 'border-primary/50 bg-background text-foreground' : ''
          ]"
        >
          <p class="font-medium text-foreground">{{ session.title }}</p>
          <p class="truncate text-xs text-muted-foreground">{{ session.preview }}</p>
          <p class="mt-1 text-[0.65rem] uppercase tracking-wide text-muted-foreground">{{ session.timestamp }}</p>
        </li>
      </ol>
    </aside>

    <section class="relative flex h-[calc(100vh-7.5rem)] flex-col rounded-3xl border border-border bg-background shadow-sm">
      <header class="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <div>
          <p class="text-xs uppercase tracking-wide text-muted-foreground">Conversation</p>
          <h1 class="text-lg font-semibold text-foreground">{{ activeTitle }}</h1>
        </div>
        <div class="flex flex-wrap items-center gap-3 text-sm">
          <label class="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs uppercase tracking-wide text-muted-foreground">
            <span>Model</span>
            <select v-model="selectedModel" class="rounded-full border border-border bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option v-for="model in models" :key="model.name" :value="model.name">
                {{ model.label }}
              </option>
            </select>
          </label>
          <button
            type="button"
            class="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
            @click="restartConversation"
          >
            Reset
          </button>
        </div>
      </header>

      <main ref="chatScrollRef" class="flex-1 overflow-y-auto px-6 py-8">
        <TransitionGroup name="chat-fade" tag="div" class="flex flex-col gap-6">
          <div v-for="message in messages" :key="message.id" class="flex flex-col gap-2">
          <div
            :class="[
              'relative max-w-3xl rounded-3xl px-5 py-4 text-sm leading-relaxed',
              message.role === 'assistant'
                ? 'self-start rounded-tl-none border border-border bg-muted/40 text-foreground shadow-sm'
                : 'self-end rounded-tr-none bg-primary text-primary-foreground shadow'
            , message.role === 'assistant' && message.status === 'streaming' ? 'animate-message-stream' : ''
            ]"
          >
            <div class="flex items-center gap-2 text-xs">
              <span class="font-medium uppercase tracking-wide">{{ message.role === 'assistant' ? 'Agent' : 'You' }}</span>
            </div>
            <div class="mt-2 leading-relaxed">
              <template v-if="message.role === 'assistant'">
                <MarkdownRenderer
                  v-if="message.format === 'markdown'"
                  :source="message.content || ''"
                />
                <span v-else-if="message.content" class="whitespace-pre-wrap">{{ message.content }}</span>
                <span v-else class="text-muted-foreground">Thinking…</span>
                <Loader2 v-if="message.status === 'streaming'" class="ml-2 inline h-4 w-4 animate-spin text-muted-foreground" />
              </template>
              <template v-else>
                <span class="whitespace-pre-wrap">{{ message.content }}</span>
              </template>
            </div>
          </div>

          <div
            class="flex flex-wrap items-center gap-2 text-[0.65rem] uppercase tracking-wide text-muted-foreground"
            :class="message.role === 'assistant' ? 'self-start pl-1' : 'self-end pr-1'
            "
          >
            <span>Sent {{ formatTimestamp(message.createdAt) }}</span>
            <span v-if="message.durationMs !== undefined">· {{ formatDuration(message.durationMs) }}</span>
            <span v-if="message.endedAt && message.durationMs !== undefined" class="hidden sm:inline">· Finished {{ formatTimestamp(message.endedAt) }}</span>
          </div>

          <div
            v-if="message.role === 'assistant' && message.tools.length > 0"
            class="ml-0 max-w-3xl space-y-2 self-start rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground"
          >
            <p class="text-[0.7rem] uppercase tracking-wide text-primary">Tool activity</p>
            <details
              v-for="tool in message.tools"
              :key="tool.id"
              class="rounded-xl border border-border bg-background/80 p-3"
              :open="tool.status !== 'completed'"
            >
              <summary class="flex cursor-pointer items-center justify-between gap-3 text-sm text-foreground">
                <span class="font-medium">{{ tool.name }}</span>
                <span :class="toolStatusClass(tool.status)">{{ tool.status }}</span>
              </summary>
              <div class="mt-3 space-y-2 font-mono text-[0.75rem] leading-relaxed">
                <div v-if="tool.input">
                  <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Input</p>
                  <pre class="rounded-lg bg-muted/60 p-3">{{ tool.input }}</pre>
                </div>
                <div v-if="tool.output">
                  <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Output</p>
                  <pre class="rounded-lg bg-muted/60 p-3">{{ tool.output }}</pre>
                </div>
              </div>
            </details>
          </div>
        </div>
        </TransitionGroup>

        <div v-if="isStreaming && !messages.some((m) => m.status === 'streaming' && m.role === 'assistant')" class="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground">
          <Loader2 class="h-3.5 w-3.5 animate-spin text-primary" />
          Awaiting response…
        </div>
      </main>

      <footer class="border-t border-border px-6 py-4">
        <form class="flex flex-col gap-3" @submit.prevent="send" @keydown.enter="send">
          <textarea
            v-model="input"
            rows="3"
            placeholder="Ask anything about your data…"
            class="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-relaxed shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div class="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>{{ streamStatusLabel }}</div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-40"
                :disabled="messages.length === 0 || isStreaming"
                @click="restartConversation"
              >
                Clear
              </button>
              <button
                v-if="isStreaming"
                type="button"
                class="rounded-full bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90"
                @click="stopStream"
              >
                Stop
              </button>
              <button
                v-else
                type="submit"
                class="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40"
                :disabled="!canSend"
              >
                Send
              </button>
            </div>
          </div>
        </form>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { Loader2 } from 'lucide-vue-next';

import { useModels } from '@/composables/useAiControls';
import { streamChat } from '@/api/ai';
import { useTenantStore } from '@/stores/tenant';
import MarkdownRenderer from '@/components/MarkdownRenderer.vue';

interface ToolRun {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed';
  input?: string;
  output?: string;
}

interface ChatMessageRecord {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  endedAt?: string;
  durationMs?: number;
  status: 'idle' | 'streaming' | 'completed' | 'failed';
  tools: ToolRun[];
  format?: 'text' | 'markdown';
}

const STREAM_APPEND_INTERVAL_MS = 16;

const mockSessions = [
  {
    id: 'session-1',
    title: 'Exploring product metrics',
    preview: 'What are the top 5 products by revenue this week?',
    timestamp: 'Today · 14:05'
  },
  {
    id: 'session-2',
    title: 'SQL coaching',
    preview: 'Help me list all loyalty members that churned',
    timestamp: 'Yesterday · 18:20'
  },
  {
    id: 'session-3',
    title: 'Adhoc experiment',
    preview: 'Draft a dashboard summary for Q4 insights',
    timestamp: 'Apr 18 · 09:40'
  }
] satisfies Array<{ id: string; title: string; preview: string; timestamp: string }>;

const activeSessionId = mockSessions[0].id;
const activeTitle = mockSessions[0].title;

const tenantStore = useTenantStore();
const modelsQuery = useModels();
const models = computed(() => modelsQuery.data.value ?? []);
const selectedModel = ref<string>();

watch(
  () => models.value,
  (value) => {
    if (!value?.length) return;
    if (!selectedModel.value) {
      selectedModel.value = modelsQuery.defaultModel.value?.name ?? value[0]?.name;
    }
  },
  { immediate: true }
);

const messages = ref<ChatMessageRecord[]>([]);
const input = ref('');
const isStreaming = ref(false);
const streamStatus = ref<'idle' | 'connecting' | 'streaming' | 'completed' | 'failed' | 'stopped'>('idle');
const chatScrollRef = ref<HTMLElement | null>(null);
const controllerRef = ref<AbortController | null>(null);
const pendingAssistantId = ref<string | null>(null);
const pendingBuffer = ref('');
const pendingFormat = ref<'text' | 'markdown' | null>(null);
let appendTimer: ReturnType<typeof setTimeout> | null = null;

const tokens = reactive<{ prompt?: number | string; completion?: number | string }>({});

const canSend = computed(() => !isStreaming.value && Boolean(input.value.trim()) && Boolean(selectedModel.value));

watch(
  messages,
  () => {
    nextTick(() => {
      const container = chatScrollRef.value;
      if (!container) return;
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    });
  },
  { deep: true }
);

function toolStatusClass(status: ToolRun['status']) {
  if (status === 'completed') {
    return 'rounded-full bg-emerald-100 px-2 py-0.5 text-[0.65rem] font-semibold uppercase text-emerald-700';
  }
  if (status === 'failed') {
    return 'rounded-full bg-destructive/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase text-destructive';
  }
  return 'rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-semibold uppercase text-muted-foreground';
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(ms?: number) {
  if (ms === undefined || !Number.isFinite(ms)) return '';
  if (ms < 1000) {
    return `${Math.round(ms)} ms`;
  }
  const seconds = ms / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(seconds < 10 ? 1 : 0)} s`;
  }
  const minutes = seconds / 60;
  return `${minutes.toFixed(minutes < 10 ? 1 : 0)} min`;
}

function resetBuffer() {
  pendingBuffer.value = '';
  pendingFormat.value = null;
  if (appendTimer) {
    clearTimeout(appendTimer);
    appendTimer = null;
  }
}

function appendWithThrottle(text: string, format?: 'text' | 'markdown') {
  if (!pendingAssistantId.value || !text) return;
  pendingBuffer.value += text;
  if (format) {
    if (format === 'markdown') {
      pendingFormat.value = 'markdown';
    } else if (!pendingFormat.value) {
      pendingFormat.value = format;
    }
  }
  if (appendTimer) return;
  appendTimer = setTimeout(() => {
    flushBuffer();
  }, STREAM_APPEND_INTERVAL_MS);
}

function flushBuffer() {
  if (!pendingAssistantId.value || !pendingBuffer.value) {
    resetBuffer();
    return;
  }
  const idx = messages.value.findIndex((msg) => msg.id === pendingAssistantId.value);
  if (idx === -1) {
    resetBuffer();
    return;
  }
  const next = { ...messages.value[idx] };
  next.content += pendingBuffer.value;
  if (pendingFormat.value) {
    next.format = pendingFormat.value;
  }
  messages.value.splice(idx, 1, next);
  resetBuffer();
}

function ensureAssistantMessage() {
  if (!pendingAssistantId.value) return null;
  const idx = messages.value.findIndex((msg) => msg.id === pendingAssistantId.value);
  if (idx === -1) return null;
  return { idx, record: messages.value[idx] };
}

function attachToolEvent(eventType: 'tool_call' | 'tool_result', payload: Record<string, unknown>) {
  const context = ensureAssistantMessage();
  if (!context) return;
  const { idx, record } = context;
  const toolName = typeof payload.toolName === 'string' ? payload.toolName : 'unknown tool';

  const nextTools = [...record.tools];

  if (eventType === 'tool_call') {
    nextTools.push({
      id: crypto.randomUUID(),
      name: toolName,
      status: 'running',
      input: stringifyMaybeJson(payload.input)
    });
  } else {
    const target = [...nextTools].reverse().find((tool) => tool.name === toolName && tool.status === 'running');
    if (target) {
      target.status = 'completed';
      target.output = stringifyMaybeJson(payload.output);
    } else {
      nextTools.push({
        id: crypto.randomUUID(),
        name: toolName,
        status: 'completed',
        output: stringifyMaybeJson(payload.output)
      });
    }
  }

  messages.value.splice(idx, 1, { ...record, tools: nextTools });
}

function stringifyMaybeJson(value: unknown) {
  if (typeof value === 'string') {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
  if (typeof value === 'object' && value !== null) {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return value === undefined || value === null ? undefined : String(value);
}

function updateAssistantStatus(
  status: ChatMessageRecord['status'],
  updates: Partial<ChatMessageRecord> = {}
) {
  const context = ensureAssistantMessage();
  if (!context) return;
  const { idx, record } = context;
  messages.value.splice(idx, 1, { ...record, status, ...updates });
}

async function send() {
  const prompt = input.value.trim();
  if (!prompt || !selectedModel.value) return;

  const userMessage: ChatMessageRecord = {
    id: crypto.randomUUID(),
    role: 'user',
    content: prompt,
    createdAt: new Date().toISOString(),
    status: 'completed',
    tools: []
  };

  messages.value = [...messages.value, userMessage];
  input.value = '';

  const assistantMessage: ChatMessageRecord = {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: '',
    createdAt: new Date().toISOString(),
    status: 'streaming',
    tools: []
  };

  messages.value = [...messages.value, assistantMessage];
  pendingAssistantId.value = assistantMessage.id;
  streamStatus.value = 'connecting';
  isStreaming.value = true;
  resetBuffer();

  const controller = new AbortController();
  controllerRef.value = controller;

  try {
    const response = await streamChat(
      {
        brandRef: tenantStore.activeTenant?.brandRef ?? '',
        structure: tenantStore.activeTenant?.structure,
        model: selectedModel.value,
        content: prompt,
        history: messages.value.map(({ role, content }) => ({ role, content })),
        temperature: 0.2,
        ragEnabled: true,
        stream: true
      },
      { signal: controller.signal }
    );

    streamStatus.value = 'streaming';
    await consumeStream(response);
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      streamStatus.value = 'stopped';
    } else {
    streamStatus.value = 'failed';
    const context = ensureAssistantMessage();
    const finishedAt = new Date().toISOString();
    const durationMs = context ? Math.max(0, Date.now() - new Date(context.record.createdAt).getTime()) : undefined;
    updateAssistantStatus('failed', { endedAt: finishedAt, durationMs });
    if (context) {
      const { idx, record } = context;
      messages.value.splice(idx, 1, {
        ...record,
        content: `⚠️ ${(error as Error).message ?? 'Something went wrong'}`,
        status: 'failed',
        endedAt: finishedAt,
        durationMs
      });
    }
  }
} finally {
    flushBuffer();
    resetBuffer();
    controllerRef.value = null;
    pendingAssistantId.value = null;
    isStreaming.value = false;
  }
}

async function consumeStream(response: Response) {
  if (!response.body) throw new Error('Empty stream body');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = '';
  let eventName: string | null = null;
  let dataBuffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? '';

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      if (!line) {
        if (eventName || dataBuffer) {
          processEvent(eventName ?? 'message', dataBuffer);
        }
        eventName = null;
        dataBuffer = '';
        continue;
      }

      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim();
        continue;
      }

      if (line.startsWith('data:')) {
        dataBuffer += line.slice(5).trim();
        continue;
      }

      const braceIndex = line.indexOf('{');
      if (braceIndex !== -1) {
        const explicitEvent = line.slice(0, braceIndex).trim();
        const payload = line.slice(braceIndex);
        processEvent(explicitEvent || 'message', payload);
      } else {
        processEvent('message', line);
      }
    }
  }

  if (buffer.trim()) {
    processEvent('message', buffer.trim());
  }
  if (eventName || dataBuffer) {
    processEvent(eventName ?? 'message', dataBuffer);
  }
}

function processEvent(eventType: string, payloadText: string) {
  let payload: unknown = payloadText;
  if (payloadText) {
    try {
      payload = JSON.parse(payloadText);
    } catch {
      // leave raw
    }
  }

  switch (eventType) {
    case 'status':
      if (payload && typeof payload === 'object' && 'state' in payload) {
        const state = String((payload as Record<string, unknown>).state ?? '');
        if (state === 'started') {
          streamStatus.value = 'streaming';
          updateAssistantStatus('streaming');
        } else if (state === 'completed') {
          streamStatus.value = 'completed';
          updateAssistantStatus('completed');
        }
      }
      break;
    case 'tool_call':
    case 'tool_result':
      if (payload && typeof payload === 'object') {
        attachToolEvent(eventType as 'tool_call' | 'tool_result', payload as Record<string, unknown>);
      }
      break;
    case 'message': {
      const { text, format } = extractContent(payload);
      if (text) appendWithThrottle(text, format);
      break;
    }
    case 'final': {
      const { text, format } = extractContent(payload);
      flushBuffer();
      const context = ensureAssistantMessage();
      const finishedAt = new Date().toISOString();
      let durationMs: number | undefined = context
        ? Math.max(0, Date.now() - new Date(context.record.createdAt).getTime())
        : undefined;
      if (
        payload &&
        typeof payload === 'object' &&
        'metadata' in payload &&
        payload.metadata &&
        typeof payload.metadata === 'object'
      ) {
        const meta = payload.metadata as Record<string, unknown>;
        const execution = meta.executionTime ?? meta.durationMs ?? meta.latencyMs;
        if (typeof execution === 'number') {
          durationMs = execution;
        } else if (typeof execution === 'string') {
          const parsed = Number(execution);
          if (!Number.isNaN(parsed)) durationMs = parsed;
        }
      }
      if (context && text) {
        const { idx, record } = context;
        messages.value.splice(idx, 1, {
          ...record,
          content: text,
          status: 'completed',
          format: format ?? record.format,
          endedAt: finishedAt,
          durationMs: durationMs ?? record.durationMs
        });
      } else if (context) {
        const { idx, record } = context;
        messages.value.splice(idx, 1, {
          ...record,
          status: 'completed',
          format: format ?? record.format,
          endedAt: finishedAt,
          durationMs: durationMs ?? record.durationMs
        });
      }
      if (
        payload &&
        typeof payload === 'object' &&
        'tokenBreakdown' in payload &&
        payload.tokenBreakdown &&
        typeof payload.tokenBreakdown === 'object'
      ) {
        const breakdown = payload.tokenBreakdown as Record<string, unknown>;
        const promptValue = (breakdown.promptTokens ?? breakdown.prompt) as number | string | undefined;
        const completionValue = (breakdown.completionTokens ?? breakdown.completion) as number | string | undefined;
        tokens.prompt = promptValue;
        tokens.completion = completionValue;
      }
      streamStatus.value = 'completed';
      break;
    }
    case 'error': {
      flushBuffer();
      const { text } = extractContent(payload);
      const message = text ?? 'Unknown error';
      const context = ensureAssistantMessage();
      const finishedAt = new Date().toISOString();
      const durationMs = context
        ? Math.max(0, Date.now() - new Date(context.record.createdAt).getTime())
        : undefined;
      if (context) {
        const { idx, record } = context;
        messages.value.splice(idx, 1, {
          ...record,
          content: `⚠️ ${message}`,
          status: 'failed',
          format: 'text',
          endedAt: finishedAt,
          durationMs
        });
      }
      else {
        updateAssistantStatus('failed', { endedAt: finishedAt, durationMs });
      }
      streamStatus.value = 'failed';
      break;
    }
    default: {
      const { text, format } = extractContent(payload);
      if (text) appendWithThrottle(text, format);
    }
  }
}

function detectFormat(value: unknown): 'text' | 'markdown' | undefined {
  if (value === 'markdown') return 'markdown';
  if (value === 'text') return 'text';
  return undefined;
}

function normalizeContent(
  value: unknown,
  inheritedFormat?: 'text' | 'markdown'
): { text: string | null; format?: 'text' | 'markdown' } {
  if (value === null || value === undefined) {
    return { text: null, format: inheritedFormat };
  }

  if (typeof value === 'string') {
    return { text: value, format: inheritedFormat };
  }

  if (Array.isArray(value)) {
    let aggregated = '';
    let format = inheritedFormat;
    value.forEach((item) => {
      const result = normalizeContent(item, format);
      if (result.text) {
        aggregated += result.text;
      }
      if (result.format === 'markdown') {
        format = 'markdown';
      }
    });
    return { text: aggregated || null, format };
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const format = detectFormat(obj.format) ?? inheritedFormat;

    if (typeof obj.text === 'string') {
      return { text: obj.text, format };
    }

    if (typeof obj.message === 'string') {
      return { text: obj.message, format };
    }

    if ('content' in obj) {
      return normalizeContent(obj.content, format);
    }

    if ('delta' in obj) {
      return normalizeContent(obj.delta, format);
    }
  }

  return { text: null, format: inheritedFormat };
}

function extractContent(payload: unknown): { text: string | null; format?: 'text' | 'markdown' } {
  if (payload === null || payload === undefined) {
    return { text: null };
  }

  if (typeof payload === 'string') {
    return { text: payload };
  }

  if (typeof payload !== 'object') {
    return { text: null };
  }

  const record = payload as Record<string, unknown>;
  const topFormat = detectFormat(record.format);

  if (typeof record.text === 'string') {
    return { text: record.text, format: topFormat };
  }

  if (typeof record.message === 'string') {
    return { text: record.message, format: topFormat };
  }

  if ('delta' in record) {
    const result = normalizeContent(record.delta, topFormat);
    if (result.text !== null) return result;
  }

  if ('contentDelta' in record) {
    const result = normalizeContent(record.contentDelta, topFormat);
    if (result.text !== null) return result;
  }

  if ('content' in record) {
    const result = normalizeContent(record.content, topFormat);
    if (result.text !== null) return result;
  }

  if ('delta' in record && typeof record.delta === 'string') {
    return { text: String(record.delta), format: topFormat };
  }

  return { text: null, format: topFormat };
}

function stopStream() {
  controllerRef.value?.abort();
  controllerRef.value = null;
  flushBuffer();
  resetBuffer();
  streamStatus.value = 'stopped';
  const context = ensureAssistantMessage();
  const finishedAt = new Date().toISOString();
  const durationMs = context
    ? Math.max(0, Date.now() - new Date(context.record.createdAt).getTime())
    : undefined;
  updateAssistantStatus('failed', { endedAt: finishedAt, durationMs });
}

function restartConversation() {
  if (isStreaming.value) stopStream();
  messages.value = [];
  input.value = '';
  tokens.prompt = undefined;
  tokens.completion = undefined;
  streamStatus.value = 'idle';
  pendingAssistantId.value = null;
  resetBuffer();
}

const streamStatusLabel = computed(() => {
  switch (streamStatus.value) {
    case 'connecting':
      return 'Connecting…';
    case 'streaming':
      return 'Responding…';
    case 'completed':
      return tokens.prompt || tokens.completion
        ? `Prompt: ${tokens.prompt ?? '?'} · Completion: ${tokens.completion ?? '?'}`
        : 'Completed';
    case 'failed':
      return 'Something went wrong.';
    case 'stopped':
      return 'Stopped.';
    default:
      return 'Ready.';
  }
});

onBeforeUnmount(() => {
  stopStream();
});
</script>

<style scoped>
.chat-fade-enter-active,
.chat-fade-leave-active {
  transition: all 0.2s ease;
}

.chat-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.chat-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.animate-message-stream {
  position: relative;
  overflow: hidden;
}

.animate-message-stream::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.25) 40%, transparent 80%);
  opacity: 0.7;
  animation: shimmer 1.4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
