<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-2xl font-semibold">Agent Chat Playground</h1>
      <p class="text-sm text-muted-foreground">
        Exercise the streaming chat endpoint, inspect tool activity, and iterate on prompts before shipping changes.
      </p>
    </header>

    <div class="grid gap-6 xl:grid-cols-[2fr,1fr]">
      <Card class="flex min-h-[34rem] flex-col">
        <CardHeader class="space-y-1">
          <CardTitle>Conversation</CardTitle>
          <CardDescription>Streamed responses with live updates and agent reasoning hooks.</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-1 flex-col gap-4">
          <div class="flex flex-wrap gap-4 rounded-md border border-border bg-muted/40 p-4 text-sm">
            <div class="flex min-w-[12rem] flex-1 flex-wrap items-center gap-2">
              <label class="text-xs uppercase tracking-wide text-muted-foreground" for="model-select">Model</label>
              <select
                id="model-select"
                v-model="selectedModel"
                class="min-w-[10rem] flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              >
                <option v-for="model in models" :key="model.name" :value="model.name">
                  {{ model.label }}
                </option>
              </select>
            </div>

            <div class="flex min-w-[12rem] flex-1 flex-col gap-2">
              <label class="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground" for="temperature-range">
                <span>Temperature</span>
                <span class="font-medium text-foreground">{{ temperature.toFixed(1) }}</span>
              </label>
              <input
                id="temperature-range"
                v-model.number="temperature"
                type="range"
                min="0"
                max="2"
                step="0.1"
                class="w-full accent-primary"
              />
            </div>

            <label class="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm">
              <input v-model="ragEnabled" type="checkbox" class="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/60" />
              <span class="font-medium text-foreground">Enable RAG context</span>
            </label>
          </div>

          <div class="relative flex-1 overflow-hidden rounded-lg border border-border bg-background">
            <div ref="chatScrollRef" class="h-full space-y-4 overflow-y-auto p-6">
              <p v-if="messages.length === 0" class="text-sm text-muted-foreground">
                Start a conversation to see streamed responses.
              </p>
              <TransitionGroup name="fade" tag="div" class="space-y-4">
                <div
                  v-for="message in messages"
                  :key="message.id"
                  :class="[
                    'flex flex-col gap-2 rounded-lg border px-4 py-3 text-sm shadow-sm',
                    message.role === 'assistant'
                      ? 'border-primary/30 bg-primary/5 text-foreground'
                      : 'border-border bg-background text-foreground'
                  ]"
                >
                  <div class="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <component :is="message.role === 'assistant' ? Bot : User" class="h-4 w-4" />
                    <span>{{ message.role === 'assistant' ? 'Assistant' : 'You' }}</span>
                    <span>·</span>
                    <span>{{ formatTimestamp(message.timestamp) }}</span>
                  </div>
                  <div class="whitespace-pre-wrap leading-relaxed">
                    <template v-if="message.role === 'assistant'">
                      <span v-if="message.content">{{ message.content }}</span>
                      <span v-else class="text-muted-foreground">…</span>
                      <span v-if="message.isStreaming" class="ml-1 inline-block animate-pulse text-muted-foreground">▌</span>
                    </template>
                    <template v-else>
                      {{ message.content }}
                    </template>
                  </div>
                </div>
              </TransitionGroup>
            </div>
          </div>

          <div
            v-if="thinkingTraces.length > 0"
            class="space-y-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 text-sm"
          >
            <div class="flex items-center gap-2 text-xs uppercase tracking-wide text-primary">
              <Sparkles class="h-4 w-4" />
              <span>Reasoning Trace</span>
            </div>
            <ul class="space-y-2">
              <li v-for="item in thinkingTraces" :key="item.id" class="rounded-md bg-primary/10 px-3 py-2 text-foreground">
                {{ item.content }}
              </li>
            </ul>
          </div>

          <div v-if="toolRuns.length > 0" class="space-y-2 rounded-lg border border-border bg-muted/30 p-4 text-sm">
            <div class="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <Wrench class="h-4 w-4" />
              <span>Tool Activity</span>
            </div>
            <ul class="space-y-3">
              <li v-for="tool in toolRuns" :key="tool.id" class="space-y-1 rounded-md border border-border bg-background px-3 py-2">
                <div class="flex items-center justify-between text-xs font-medium text-foreground">
                  <span>{{ tool.name }}</span>
                  <span :class="toolStatusClass(tool.status)">{{ tool.status }}</span>
                </div>
                <p v-if="tool.input" class="text-xs text-muted-foreground">Input: {{ tool.input }}</p>
                <p v-if="tool.output" class="text-xs text-muted-foreground">Output: {{ tool.output }}</p>
              </li>
            </ul>
          </div>

          <form class="space-y-3" @submit.prevent="startChat">
            <label class="flex flex-col gap-2 text-sm">
              <span class="text-xs uppercase tracking-wide text-muted-foreground">Prompt</span>
              <textarea
                v-model="chatInput"
                rows="4"
                class="min-h-[7rem] w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
                placeholder="Ask the agent for help with your data…"
              />
            </label>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2 text-xs text-muted-foreground">
                <span class="font-medium text-foreground">Status:</span>
                <span>{{ streamStatusLabel }}</span>
                <span v-if="tokens.usage" class="rounded-full bg-muted px-2 py-0.5 text-xs">
                  {{ tokens.usage }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
                  :disabled="isStreaming || messages.length === 0"
                  @click="clearConversation"
                >
                  Clear
                </button>
                <button
                  v-if="isStreaming"
                  type="button"
                  class="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90 disabled:opacity-50"
                  :disabled="!isStreaming"
                  @click="stopStream"
                >
                  Stop
                </button>
                <button
                  v-else
                  type="submit"
                  class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  :disabled="!canSend"
                >
                  Send
                </button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card class="flex h-full max-h-[1000px] min-h-[24rem] flex-col">
        <CardHeader class="space-y-1">
          <CardTitle>Event Console</CardTitle>
          <CardDescription>Inspect streaming events, tool calls, metadata, and trace timing.</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-1 flex-col gap-4">
          <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>{{ consoleEntries.length }} events</span>
            <div class="flex items-center gap-2">
              <label class="flex items-center gap-1">
                <input v-model="autoScrollConsole" type="checkbox" class="h-3.5 w-3.5 rounded border-border text-primary focus:ring-1 focus:ring-primary/60" />
                <span>Auto-scroll</span>
              </label>
              <button
                type="button"
                class="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
                @click="clearConsoleEntries"
              >
                Clear Console
              </button>
            </div>
          </div>

          <div ref="consoleScrollRef" class="flex-1 overflow-y-auto rounded-lg border border-border bg-background">
            <div v-if="consoleEntries.length === 0" class="p-6 text-sm text-muted-foreground">
              Awaiting stream events…
            </div>
            <ul v-else class="divide-y divide-border text-sm">
              <li v-for="entry in consoleEntries" :key="entry.id" class="space-y-2 px-4 py-3 hover:bg-muted/40">
                <div class="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                  <div class="flex items-center gap-2">
                    <component :is="eventIcon(entry.type)" class="h-4 w-4 text-foreground" />
                    <span class="font-medium text-foreground">{{ entry.type }}</span>
                  </div>
                  <span>{{ formatTimestamp(entry.timestamp) }}</span>
                </div>
                <p v-if="entry.message" class="font-mono text-xs text-muted-foreground">{{ entry.message }}</p>
                <pre v-if="entry.payload" class="max-h-52 max-w-[400px] overflow-auto rounded-md bg-muted/60 p-3 text-xs leading-relaxed text-foreground">
{{ entry.payload }}
                </pre>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { Bot, Sparkles, User, Wrench, Activity, FileCode, Info, AlertTriangle } from 'lucide-vue-next';

import Card from '@/components/ui/Card.vue';
import CardHeader from '@/components/ui/CardHeader.vue';
import CardContent from '@/components/ui/CardContent.vue';
import CardTitle from '@/components/ui/CardTitle.vue';
import CardDescription from '@/components/ui/CardDescription.vue';
import { useModels } from '@/composables/useAiControls';
import { streamChat } from '@/api/ai';
import { useTenantStore } from '@/stores/tenant';
import type { AgentStreamEventType } from '@/types/api';

const STREAM_APPEND_INTERVAL_MS = 40;

interface ChatMessageRecord {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

interface ConsoleEntry {
  id: string;
  type: AgentStreamEventType | 'info';
  timestamp: string;
  message?: string;
  payload?: string;
}

interface ToolRunRecord {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed';
  input?: string;
  output?: string;
}

interface ThinkingTrace {
  id: string;
  content: string;
}

const modelsQuery = useModels();
const models = computed(() => modelsQuery.data.value ?? []);
const selectedModel = ref<string>();

watch(
  () => models.value,
  (value) => {
    if (!value || value.length === 0) return;
    if (!selectedModel.value) {
      selectedModel.value = modelsQuery.defaultModel.value?.name ?? value[0]?.name;
    }
  },
  { immediate: true }
);

const tenantStore = useTenantStore();

const messages = ref<ChatMessageRecord[]>([]);
const chatInput = ref('');
const temperature = ref(0.2);
const ragEnabled = ref(true);
const isStreaming = ref(false);
const streamStatus = ref<'idle' | 'connecting' | 'running' | 'completed' | 'stopped' | 'failed'>('idle');
const thinkingTraces = ref<ThinkingTrace[]>([]);
const toolRuns = ref<ToolRunRecord[]>([]);
const consoleEntries = ref<ConsoleEntry[]>([]);
const autoScrollConsole = ref(true);
const tokens = reactive<{ usage?: string }>({});

const pendingAssistantBuffer = ref('');
let appendThrottleTimer: ReturnType<typeof setTimeout> | null = null;

const chatScrollRef = ref<HTMLElement | null>(null);
const consoleScrollRef = ref<HTMLElement | null>(null);
const controllerRef = ref<AbortController | null>(null);
const pendingAssistantId = ref<string | null>(null);

const canSend = computed(() => !isStreaming.value && chatInput.value.trim().length > 0 && Boolean(selectedModel.value));

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function toolStatusClass(status: ToolRunRecord['status']) {
  if (status === 'completed') {
    return 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700';
  }
  if (status === 'failed') {
    return 'rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive';
  }
  return 'rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground';
}

function logConsole(entry: Omit<ConsoleEntry, 'id' | 'timestamp'> & { timestamp?: string }) {
  const normalized: ConsoleEntry = {
    id: crypto.randomUUID(),
    timestamp: entry.timestamp ?? new Date().toISOString(),
    type: entry.type,
    message: entry.message,
    payload: entry.payload
  };

  consoleEntries.value = [...consoleEntries.value, normalized].slice(-400);
}

function eventIcon(type: AgentStreamEventType | 'info') {
  switch (type) {
    case 'status':
      return Activity;
    case 'tool_call':
    case 'tool_result':
      return Wrench;
    case 'metadata':
      return FileCode;
    case 'thinking':
      return Sparkles;
    case 'error':
      return AlertTriangle;
    case 'final':
    case 'message':
      return Bot;
    default:
      return Info;
  }
}

watch(
  messages,
  () => {
    nextTick(() => {
      const el = chatScrollRef.value;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    });
  },
  { deep: true }
);

watch(
  consoleEntries,
  () => {
    if (!autoScrollConsole.value) return;
    nextTick(() => {
      const el = consoleScrollRef.value;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    });
  },
  { deep: true }
);

function appendThinkingTrace(payload: unknown) {
  const text = extractText(payload);
  if (!text) return;
  thinkingTraces.value = [
    ...thinkingTraces.value,
    { id: crypto.randomUUID(), content: text }
  ].slice(-20);
}

function upsertToolRun(eventType: 'tool_call' | 'tool_result', payload: Record<string, unknown>) {
  const toolName = typeof payload.toolName === 'string' ? payload.toolName : 'unknown';
  if (eventType === 'tool_call') {
    toolRuns.value = [
      ...toolRuns.value,
      {
        id: crypto.randomUUID(),
        name: toolName,
        status: 'running',
        input: stringifyMaybeJson(payload.input)
      }
    ];
    return;
  }

  const runs = [...toolRuns.value];
  const target = runs.slice().reverse().find((run) => run.name === toolName);
  if (!target) {
    runs.push({
      id: crypto.randomUUID(),
      name: toolName,
      status: 'completed',
      output: stringifyMaybeJson(payload.output)
    });
  } else {
    target.status = 'completed';
    target.output = stringifyMaybeJson(payload.output);
  }
  toolRuns.value = runs;
}

function stringifyMaybeJson(value: unknown) {
  if (!value) return undefined;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object') {
        return JSON.stringify(parsed, null, 2);
      }
    } catch {
      return value;
    }
    return value;
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function updateAssistantMessage(update: { append?: string | null; finalize?: string | null }) {
  if (!pendingAssistantId.value) return;
  const index = messages.value.findIndex((item) => item.id === pendingAssistantId.value);
  if (index === -1) return;
  const draft = { ...messages.value[index] };
  if (update.append) {
    draft.content = `${draft.content}${update.append}`;
  }
  if (typeof update.finalize === 'string') {
    draft.content = update.finalize;
  }
  if (!update.append && typeof update.finalize === 'string') {
    draft.isStreaming = false;
  }
  messages.value.splice(index, 1, draft);
}

function queueAssistantAppend(text: string) {
  if (!text) return;
  pendingAssistantBuffer.value += text;
  if (appendThrottleTimer !== null) return;

  appendThrottleTimer = setTimeout(() => {
    flushAssistantBuffer();
  }, STREAM_APPEND_INTERVAL_MS);
}

function clearAppendTimer() {
  if (appendThrottleTimer !== null) {
    clearTimeout(appendThrottleTimer);
    appendThrottleTimer = null;
  }
}

function flushAssistantBuffer() {
  if (!pendingAssistantBuffer.value) {
    clearAppendTimer();
    return;
  }

  updateAssistantMessage({ append: pendingAssistantBuffer.value });
  pendingAssistantBuffer.value = '';
  clearAppendTimer();
}

function resetAssistantBuffer() {
  pendingAssistantBuffer.value = '';
  clearAppendTimer();
}

function extractText(payload: unknown): string | null {
  if (typeof payload === 'string') {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const maybeText = (payload as Record<string, unknown>).text;
  if (typeof maybeText === 'string') {
    return maybeText;
  }

  if ('message' in (payload as Record<string, unknown>) && typeof (payload as Record<string, unknown>).message === 'string') {
    return (payload as Record<string, string>).message;
  }

  if ('content' in (payload as Record<string, unknown>)) {
    const content = (payload as Record<string, unknown>).content;
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object' && 'text' in item && typeof item.text === 'string') {
            return item.text;
          }
          return '';
        })
        .join('');
    }
    if (content && typeof content === 'object') {
      if ('message' in (content as Record<string, unknown>) && typeof (content as Record<string, unknown>).message === 'string') {
        return (content as Record<string, string>).message;
      }
      if ('text' in (content as Record<string, unknown>) && typeof (content as Record<string, unknown>).text === 'string') {
        return (content as Record<string, string>).text;
      }
    }
  }

  if ('delta' in (payload as Record<string, unknown>)) {
    const delta = (payload as Record<string, unknown>).delta;
    if (typeof delta === 'string') return delta;
    if (delta && typeof delta === 'object') {
      if ('content' in (delta as Record<string, unknown>) && typeof (delta as Record<string, unknown>).content === 'string') {
        return (delta as Record<string, string>).content;
      }
    }
  }

  if ('contentDelta' in (payload as Record<string, unknown>)) {
    const delta = (payload as Record<string, unknown>).contentDelta;
    if (typeof delta === 'string') return delta;
  }

  return null;
}

async function startChat() {
  const prompt = chatInput.value.trim();
  if (!prompt || !selectedModel.value) return;

  const userMessage: ChatMessageRecord = {
    id: crypto.randomUUID(),
    role: 'user',
    content: prompt,
    timestamp: new Date().toISOString()
  };

  messages.value = [...messages.value, userMessage];
  chatInput.value = '';

  const history = messages.value.map(({ role, content }) => ({ role, content }));

  const assistantMessage: ChatMessageRecord = {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: '',
    timestamp: new Date().toISOString(),
    isStreaming: true
  };
  messages.value = [...messages.value, assistantMessage];
  pendingAssistantId.value = assistantMessage.id;

  thinkingTraces.value = [];
  toolRuns.value = [];
  tokens.usage = undefined;
  streamStatus.value = 'connecting';
  isStreaming.value = true;
  consoleEntries.value = [];
  resetAssistantBuffer();

  const abortController = new AbortController();
  controllerRef.value = abortController;

  try {
    const response = await streamChat(
      {
        brandRef: tenantStore.activeTenant?.brandRef ?? '',
        structure: tenantStore.activeTenant?.structure,
        content: prompt,
        model: selectedModel.value,
        history,
        temperature: temperature.value,
        ragEnabled: ragEnabled.value,
        stream: true
      },
      { signal: abortController.signal }
    );

    streamStatus.value = 'running';
    await consumeStream(response);

    streamStatus.value = 'completed';
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') {
      streamStatus.value = 'stopped';
      logConsole({ type: 'info', message: 'Stream cancelled.' });
    } else {
      streamStatus.value = 'failed';
      const message = (error as Error).message ?? 'Failed to start stream';
      logConsole({ type: 'error', message });
      updateAssistantMessage({ finalize: `⚠️ ${message}` });
    }
  } finally {
    flushAssistantBuffer();
    resetAssistantBuffer();
    isStreaming.value = false;
    pendingAssistantId.value = null;
    controllerRef.value = null;
  }
}

async function consumeStream(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Unable to read response stream');

  const decoder = new TextDecoder();
  let buffer = '';
  let sseEventName: string | null = null;
  let sseDataBuffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? '';

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      if (!line) {
        if (sseEventName || sseDataBuffer) {
          processEvent(sseEventName ?? 'message', sseDataBuffer);
        }
        sseEventName = null;
        sseDataBuffer = '';
        continue;
      }

      if (line.startsWith('event:')) {
        sseEventName = line.slice(6).trim();
        continue;
      }

      if (line.startsWith('data:')) {
        sseDataBuffer += line.slice(5).trim();
        continue;
      }

      const firstBrace = line.indexOf('{');
      if (firstBrace > 0) {
        const eventName = line.slice(0, firstBrace).trim();
        const payload = line.slice(firstBrace);
        processEvent(eventName || 'message', payload);
      } else if (firstBrace === 0) {
        processEvent('message', line);
      } else if (/^\d{1,2}:\d{2}:\d{2}/.test(line)) {
        logConsole({ type: 'info', message: line });
      } else {
        processEvent('message', `"${line}"`);
      }
    }
  }

  if (buffer.trim()) {
    processEvent('message', buffer.trim());
  }
  if (sseEventName || sseDataBuffer) {
    processEvent(sseEventName ?? 'message', sseDataBuffer);
  }
}

function processEvent(eventName: string, payloadString: string) {
  let parsedPayload: unknown = payloadString;
  if (payloadString) {
    try {
      parsedPayload = JSON.parse(payloadString);
    } catch {
      // leave as raw string
    }
  }

  const timestamp = new Date().toISOString();
  const entryPayload = typeof parsedPayload === 'string' ? undefined : JSON.stringify(parsedPayload, null, 2);

  logConsole({
    type: (eventName as AgentStreamEventType) ?? 'info',
    timestamp,
    message: typeof parsedPayload === 'string' ? parsedPayload : undefined,
    payload: entryPayload
  });

  switch (eventName) {
    case 'status':
      if (parsedPayload && typeof parsedPayload === 'object' && 'state' in parsedPayload) {
        const state = String((parsedPayload as Record<string, unknown>).state ?? '');
        if (state === 'started') {
          streamStatus.value = 'running';
        } else if (state === 'completed') {
          streamStatus.value = 'completed';
        }
      }
      break;
    case 'tool_call':
      if (parsedPayload && typeof parsedPayload === 'object') {
        upsertToolRun('tool_call', parsedPayload as Record<string, unknown>);
      }
      break;
    case 'tool_result':
      if (parsedPayload && typeof parsedPayload === 'object') {
        upsertToolRun('tool_result', parsedPayload as Record<string, unknown>);
      }
      break;
    case 'message': {
      const text = extractText(parsedPayload);
      if (text) {
        queueAssistantAppend(text);
      }
      break;
    }
    case 'final':
      {
        flushAssistantBuffer();
        const text = extractText(parsedPayload);
        if (text) {
          updateAssistantMessage({ finalize: text });
        }
        if (
          parsedPayload &&
          typeof parsedPayload === 'object' &&
          'tokenBreakdown' in parsedPayload &&
          parsedPayload.tokenBreakdown &&
          typeof parsedPayload.tokenBreakdown === 'object'
        ) {
          const breakdown = parsedPayload.tokenBreakdown as Record<string, unknown>;
          const promptRaw = breakdown.promptTokens ?? breakdown.prompt;
          const completionRaw = breakdown.completionTokens ?? breakdown.completion;
          if (promptRaw !== undefined || completionRaw !== undefined) {
            const prompt = typeof promptRaw === 'number' ? promptRaw : promptRaw ?? '?';
            const completion = typeof completionRaw === 'number' ? completionRaw : completionRaw ?? '?';
            tokens.usage = `Prompt: ${prompt} · Completion: ${completion}`;
          }
        }
        streamStatus.value = 'completed';
      }
      break;
    case 'thinking':
      appendThinkingTrace(parsedPayload);
      break;
    case 'metadata':
      if (
        parsedPayload &&
        typeof parsedPayload === 'object' &&
        'tokensUsed' in parsedPayload &&
        typeof (parsedPayload as Record<string, unknown>).tokensUsed === 'number'
      ) {
        tokens.usage = `Total Tokens: ${(parsedPayload as Record<string, number>).tokensUsed}`;
      }
      break;
    case 'error':
      {
        flushAssistantBuffer();
        const errorText = extractText(parsedPayload) ?? 'Unknown error';
        updateAssistantMessage({ finalize: `⚠️ ${errorText}` });
        streamStatus.value = 'failed';
      }
      break;
    default:
      {
        const text = extractText(parsedPayload);
        if (text) {
          queueAssistantAppend(text);
        }
      }
      break;
  }
}

function stopStream() {
  controllerRef.value?.abort();
  flushAssistantBuffer();
  resetAssistantBuffer();
  if (pendingAssistantId.value) {
    const index = messages.value.findIndex((item) => item.id === pendingAssistantId.value);
    if (index !== -1) {
      const draft = { ...messages.value[index], isStreaming: false };
      messages.value.splice(index, 1, draft);
    }
  }
}

function clearConsoleEntries() {
  consoleEntries.value = [];
}

function clearConversation() {
  if (isStreaming.value) return;
  messages.value = [];
  clearConsoleEntries();
  toolRuns.value = [];
  thinkingTraces.value = [];
  tokens.usage = undefined;
  streamStatus.value = 'idle';
  resetAssistantBuffer();
}

const streamStatusLabel = computed(() => {
  switch (streamStatus.value) {
    case 'connecting':
      return 'Connecting…';
    case 'running':
      return 'Streaming';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    case 'stopped':
      return 'Stopped';
    default:
      return 'Idle';
  }
});

onBeforeUnmount(() => {
  stopStream();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.18s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
