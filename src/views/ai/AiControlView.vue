<template>
  <section class="space-y-8">
    <header class="space-y-2">
      <h1 class="text-2xl font-semibold">AI Control Center</h1>
      <p class="text-sm text-muted-foreground">
        Manage default models, monitor embedding refresh jobs, and test RAG responses for the active tenant.
      </p>
    </header>

    <section class="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Default Model</CardTitle>
          <CardDescription>Select the model used for chat and generation tasks.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div v-if="modelsQuery.isLoading.value" class="text-sm text-muted-foreground">Loading models...</div>
          <div v-else class="space-y-3">
            <label
              v-for="model in models"
              :key="model.name"
              class="flex items-center justify-between rounded-md border border-border px-3 py-2"
            >
              <div>
                <p class="font-medium">{{ model.label }}</p>
                <p class="text-xs text-muted-foreground">{{ model.family }}</p>
              </div>
              <input
                type="radio"
                name="default-model"
                :value="model.name"
                :checked="model.default"
                @change="() => setDefault(model.name)"
              />
            </label>
          </div>
          <p v-if="modelMessage" class="text-xs text-muted-foreground">{{ modelMessage }}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Embedding Jobs</CardTitle>
          <CardDescription>Track status of active and recent embedding refresh jobs.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex gap-2">
            <input
              v-model="resource"
              placeholder="Resource (e.g. columns)"
              class="flex-1 rounded-md border border-border px-3 py-2 text-sm"
            />
            <input
              v-model="identifiers"
              placeholder="IDs (comma separated)"
              class="flex-1 rounded-md border border-border px-3 py-2 text-sm"
            />
            <button
              class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              :disabled="jobsQuery.triggering.value"
              @click="triggerRefresh"
            >
              {{ jobsQuery.triggering.value ? 'Triggering…' : 'Refresh' }}
            </button>
          </div>
          <div v-if="jobsQuery.isLoading.value" class="text-sm text-muted-foreground">Loading jobs...</div>
          <ul v-else class="space-y-2 text-sm">
            <li v-for="job in jobs" :key="job.jobId" class="rounded-md border border-border px-3 py-2">
              <div class="flex items-center justify-between">
                <span class="font-medium">{{ job.resource }}</span>
                <span :class="statusClass(job.status)">{{ job.status }}</span>
              </div>
              <p class="text-xs text-muted-foreground">Submitted {{ formatDate(job.submittedAt) }}</p>
            </li>
            <li v-if="jobs.length === 0" class="rounded-md border border-dashed px-3 py-6 text-center text-muted-foreground">
              No embedding jobs yet.
            </li>
          </ul>
        </CardContent>
      </Card>
    </section>

    <Card>
      <CardHeader>
        <CardTitle>Chat Sandbox</CardTitle>
        <CardDescription>Send a prompt to validate RAG answers.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="max-h-64 overflow-y-auto rounded-md border border-border bg-muted/30 p-4">
          <p v-if="messages.length === 0" class="text-sm text-muted-foreground">No messages yet.</p>
          <div v-else class="space-y-3">
            <div v-for="message in messages" :key="message.id" class="space-y-1">
              <p class="text-xs uppercase text-muted-foreground">{{ message.role }}</p>
              <p class="text-sm text-foreground">{{ message.content }}</p>
            </div>
          </div>
        </div>
        <form class="space-y-2" @submit.prevent="send">
          <textarea v-model="chatInput" rows="3" class="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder="Ask a question about the catalog" />
          <div class="flex justify-end">
            <button
              class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              :disabled="isSending"
            >
              {{ isSending ? 'Sending…' : 'Send' }}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import {Card, CardHeader, CardContent, CardTitle, CardDescription} from '@/components/ui/card';
import { useEmbeddingJobs, useModels } from '@/composables/useAiControls';
import { sendChat } from '@/api/ai';
import { useTenantStore } from '@/stores/tenant';
import { formatIsoDate } from '@/utils/formatters';

const modelsQuery = useModels();

const isPageVisible = ref(true);
const updateVisibility = () => {
  if (typeof document === 'undefined') return;
  isPageVisible.value = document.visibilityState === 'visible';
};

onMounted(() => {
  updateVisibility();
  document.addEventListener('visibilitychange', updateVisibility);
});

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', updateVisibility);
  isPageVisible.value = false;
});

const jobsQuery = useEmbeddingJobs({ enabled: isPageVisible });
const modelMessage = ref('');
const resource = ref('columns');
const identifiers = ref('');

const tenantStore = useTenantStore();
const { activeTenant } = storeToRefs(tenantStore);

const models = computed(() => modelsQuery.data.value ?? []);
const jobs = computed(() => jobsQuery.data.value ?? []);

async function setDefault(model: string) {
  try {
    modelMessage.value = 'Saving…';
    await modelsQuery.setDefaultModel(model);
    modelMessage.value = `Default model updated to ${model}`;
  } catch (error) {
    modelMessage.value = (error as Error).message ?? 'Unable to update model';
  }
}

function formatDate(value: string) {
  return formatIsoDate(value);
}

const statusClass = (status: string) =>
  status === 'completed'
    ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700'
    : status === 'failed'
      ? 'rounded-full bg-destructive/20 px-2 py-0.5 text-xs font-medium text-destructive'
      : 'rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground';

async function triggerRefresh() {
  try {
    const ids = identifiers.value.split(',').map((item) => item.trim()).filter(Boolean);
    await jobsQuery.triggerRefresh({ resource: resource.value, ids });
    identifiers.value = '';
  } catch (error) {
    console.error(error);
  }
}

interface ChatMessageRecord {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const messages = ref<ChatMessageRecord[]>([]);
const chatInput = ref('');
const isSending = ref(false);

async function send() {
  const question = chatInput.value.trim();
  if (!question) return;

  messages.value.push({ id: crypto.randomUUID(), role: 'user', content: question });
  chatInput.value = '';
  isSending.value = true;

  try {
    const response = await sendChat({
      brandRef: activeTenant.value.brandRef,
      structure: activeTenant.value.structure,
      content: question,
      model: modelsQuery.defaultModel.value?.name ?? models.value[0]?.name ?? 'gpt-4.1-mini',
      history: messages.value.map(({ role, content }) => ({ role, content }))
    });

    if (!response || typeof response !== 'object' || typeof (response as any).content !== 'string') {
      const fallbackMessage =
        (response as { message?: string })?.message ?? 'Invalid response from chat service';
      throw new Error(fallbackMessage);
    }

    messages.value.push({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: (response as { content: string }).content
    });
  } catch (error) {
    messages.value.push({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: (error as Error).message ?? 'Failed to get response'
    });
  } finally {
    isSending.value = false;
  }
}
</script>
