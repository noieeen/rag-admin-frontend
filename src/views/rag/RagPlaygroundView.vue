<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-2xl font-semibold">RAG Playground</h1>
      <p class="text-sm text-muted-foreground">
        Test metadata-driven retrieval, refine filters, then send curated context to the AI model.
      </p>
    </header>

    <div class="grid gap-6 lg:grid-cols-[320px,1fr]">
      <aside class="space-y-4">
        <Card>
          <CardHeader class="pb-2">
            <CardTitle>Query</CardTitle>
            <CardDescription>Compose the natural language prompt and retrieval parameters.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center gap-2">
              <button
                class="flex-1 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors"
                :class="mode === 'preview' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground'"
                @click="mode = 'preview'"
              >
                Preview
              </button>
              <button
                class="flex-1 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors"
                :class="mode === 'ask-ai' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground'"
                @click="mode = 'ask-ai'"
              >
                Ask AI
              </button>
            </div>

            <textarea
              v-model="queryText"
              rows="5"
              class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="Ask a question about your data..."
            />

            <div class="grid gap-3 text-sm">
              <label class="flex flex-col gap-1">
                <span class="font-medium text-foreground">Model</span>
                <select v-model="selectedModel" class="rounded-md border border-border bg-background px-3 py-2">
                  <option v-if="models.length === 0" disabled value="">Loading models...</option>
                  <option
                    v-for="model in models"
                    :key="model.name"
                    :value="model.name"
                  >
                    {{ model.label }}
                  </option>
                </select>
              </label>

              <label class="flex flex-col gap-1">
                <span class="font-medium text-foreground">Score Threshold ({{ scoreThreshold.toFixed(2) }})</span>
                <input type="range" min="0" max="1" step="0.01" v-model.number="scoreThreshold" />
              </label>

              <label class="flex flex-col gap-1">
                <span class="font-medium text-foreground">Top K Results</span>
                <input
                  type="number"
                  min="1"
                  max="20"
                  v-model.number="topK"
                  class="rounded-md border border-border bg-background px-3 py-2"
                />
              </label>

              <label class="flex flex-col gap-1">
                <span class="font-medium text-foreground">Tags (comma separated)</span>
                <input v-model="tagsInput" class="rounded-md border border-border bg-background px-3 py-2" />
              </label>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                @click="runPreview"
                :disabled="isPreviewing"
              >
                {{ isPreviewing ? 'Previewing…' : 'Run Preview' }}
              </button>
              <button
                class="rounded-md border border-border px-4 py-2 text-sm"
                @click="resetFilters"
              >
                Reset
              </button>
              <button
                class="rounded-md border border-border px-4 py-2 text-sm"
                @click="clearAll"
              >
                Clear
              </button>
            </div>

            <p v-if="previewError" class="text-sm text-destructive">{{ previewError }}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle>Metadata Filters</CardTitle>
            <CardDescription>Select context to include before asking the AI.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4 text-sm">
            <label class="flex items-center justify-between gap-3">
              <span class="font-medium">Select All Metadata</span>
              <input type="checkbox" :checked="allSelected" @change="onToggleAll($event)" />
            </label>

            <div
              v-for="category in categories"
              :key="category.key"
              class="space-y-2 rounded-lg border border-border p-3"
            >
              <label class="flex items-center justify-between gap-2">
                <span class="font-medium text-foreground">{{ category.label }}</span>
                <input
                  type="checkbox"
                  :checked="categoryState[category.key].enabled"
                  @change="onToggleCategory(category.key, $event)"
                />
              </label>

              <select
                v-if="category.options.length > 0"
                multiple
                class="h-24 w-full rounded-md border border-border bg-background px-3 py-2"
                :disabled="!categoryState[category.key].enabled"
                @change="onSelectIds(category.key, $event)"
              >
                <option
                  v-for="option in category.options"
                  :key="option.id"
                  :value="option.id"
                  :selected="categoryState[category.key].ids.includes(option.id)"
                >
                  {{ option.label }}
                </option>
              </select>

              <p v-else class="text-xs text-muted-foreground">Loading options…</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle>Recent Runs</CardTitle>
            <CardDescription>Replay previews with saved filters.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-3 text-sm">
            <p v-if="history.length === 0" class="text-muted-foreground">No runs yet.</p>
            <button
              v-for="item in history"
              :key="item.id"
              class="w-full rounded-md border border-border px-3 py-2 text-left transition-colors hover:bg-muted"
              @click="loadHistory(item)"
            >
              <span class="font-medium">{{ item.query }}</span>
              <span class="block text-xs text-muted-foreground">{{ formatRelative(item.timestamp) }}</span>
            </button>
          </CardContent>
        </Card>
      </aside>

      <div class="space-y-4">
        <Card>
          <CardHeader class="pb-2">
            <CardTitle>Preview Results</CardTitle>
            <CardDescription>
              {{ previewResults.length }} items • threshold {{ scoreThreshold.toFixed(2) }} • top {{ topK }}
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div v-if="isPreviewing" class="text-sm text-muted-foreground">Running preview…</div>
            <div v-else-if="previewResults.length === 0" class="text-sm text-muted-foreground">
              Run a preview to inspect relevant metadata before asking the AI.
            </div>
            <div v-else class="space-y-4">
              <div v-for="group in groupedPreview" :key="group.key" class="space-y-2">
                <h3 class="text-sm font-semibold uppercase text-muted-foreground">{{ group.label }}</h3>
                <ul class="space-y-2">
                  <li v-for="item in group.items" :key="item.entityId" class="rounded-md border border-border p-3">
                    <div class="flex items-center justify-between gap-3">
                      <p class="font-medium">{{ item.title }}</p>
                      <span class="text-xs text-muted-foreground">Score: {{ item.score.toFixed(2) }}</span>
                    </div>
                    <p v-if="item.snippet" class="text-sm text-muted-foreground">{{ item.snippet }}</p>
                    <p class="text-xs text-muted-foreground">ID: {{ item.entityId }}</p>
                  </li>
                </ul>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                :disabled="previewResults.length === 0 || isAsking"
                @click="sendToAi"
              >
                {{ isAsking ? 'Sending…' : 'Send Preview to AI' }}
              </button>
            </div>
            <p v-if="aiError" class="text-sm text-destructive">{{ aiError }}</p>
          </CardContent>
        </Card>

        <Card v-if="aiResponseText">
          <CardHeader>
            <CardTitle>AI Response</CardTitle>
            <CardDescription>Generated answer based on the preview context.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <p class="text-sm text-foreground">{{ aiResponseText }}</p>
            <div v-if="aiUsage" class="text-xs text-muted-foreground">
              Tokens • Prompt: {{ aiUsage.promptTokens ?? '—' }}, Completion: {{ aiUsage.completionTokens ?? '—' }}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { storeToRefs } from 'pinia';

import Card from '@/components/ui/Card.vue';
import CardHeader from '@/components/ui/CardHeader.vue';
import CardContent from '@/components/ui/CardContent.vue';
import CardTitle from '@/components/ui/CardTitle.vue';
import CardDescription from '@/components/ui/CardDescription.vue';
import { useDatabases, useTables, useColumns, useMetrics, useTemplates } from '@/composables/useMetadataQueries';
import { useTenantStore } from '@/stores/tenant';
import { previewMetadata } from '@/api/rag';
import { sendChat } from '@/api/ai';
import { listSynonyms } from '@/api/metadata';
import { useModels } from '@/composables/useAiControls';
import type { MetadataCategory, PreviewMetadataItem, PreviewInclude } from '@/types/rag';

const tenantStore = useTenantStore();
const { activeTenant } = storeToRefs(tenantStore);

const mode = ref<'preview' | 'ask-ai'>('preview');
const queryText = ref('');
const scoreThreshold = ref(0.72);
const topK = ref(6);
const tagsInput = ref('');

const defaultCategoryConfig: Record<MetadataCategory, { enabled: boolean }> = {
  databases: { enabled: true },
  tables: { enabled: true },
  columns: { enabled: false },
  businessMetrics: { enabled: true },
  queryTemplates: { enabled: false },
  synonymMappings: { enabled: false }
};

const categoryState = reactive(
  Object.fromEntries(
    (Object.keys(defaultCategoryConfig) as MetadataCategory[]).map((key) => [
      key,
      { enabled: defaultCategoryConfig[key].enabled, ids: [] as string[] }
    ])
  ) as Record<MetadataCategory, { enabled: boolean; ids: string[] }>
);

const categories = computed(() => [
  {
    key: 'databases' as const,
    label: 'Databases',
    options: databaseOptions.value
  },
  {
    key: 'tables' as const,
    label: 'Tables',
    options: tableOptions.value
  },
  {
    key: 'columns' as const,
    label: 'Columns',
    options: columnOptions.value
  },
  {
    key: 'businessMetrics' as const,
    label: 'Business Metrics',
    options: metricOptions.value
  },
  {
    key: 'queryTemplates' as const,
    label: 'Query Templates',
    options: templateOptions.value
  },
  {
    key: 'synonymMappings' as const,
    label: 'Synonym Mappings',
    options: synonymOptions.value
  }
]);

const allSelected = computed(() => Object.values(categoryState).every((category) => category.enabled));

const previewResults = ref<PreviewMetadataItem[]>([]);
const isPreviewing = ref(false);
const previewError = ref('');

const isAsking = ref(false);
const aiResponseText = ref('');
const aiUsage = ref<{ promptTokens?: number; completionTokens?: number } | null>(null);
const aiError = ref('');

interface HistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  include: PreviewInclude;
  tags: string[];
  previewItems: PreviewMetadataItem[];
}

const history = ref<HistoryItem[]>([]);

const modelsQuery = useModels();
const models = computed(() => modelsQuery.data.value ?? []);
const selectedModel = ref<string>('');

const databaseQuery = useDatabases(false);
const tableQuery = useTables(false);
const columnQuery = useColumns(false);
const metricsQuery = useMetrics();
const templatesQuery = useTemplates();
const synonymsQuery = useQuery({ queryKey: ['metadata', 'synonyms'], queryFn: listSynonyms });

const databaseOptions = computed(() =>
  (databaseQuery.data.value ?? []).map((db) => ({
    id: db.database_id,
    label: db.display_name?.en ?? db.database_name
  }))
);

const tableOptions = computed(() =>
  (tableQuery.data.value ?? []).map((table) => ({
    id: table.table_id,
    label: table.display_name?.en ?? table.table_name
  }))
);

const columnOptions = computed(() =>
  (columnQuery.data.value ?? []).map((column) => ({
    id: column.column_id,
    label: `${column.table_name}.${column.column_name}`
  }))
);

const metricOptions = computed(() =>
  (metricsQuery.data.value ?? []).map((metric) => ({
    id: metric.metric_id,
    label: metric.metric_name.en
  }))
);

const templateOptions = computed(() =>
  (templatesQuery.data.value ?? []).map((template) => ({
    id: template.query_template_id,
    label: template.natural_language_question.en
  }))
);

const synonymOptions = computed(() =>
  (synonymsQuery.data.value ?? []).map((mapping) => ({
    id: mapping.canonical_term,
    label: `${mapping.canonical_term} (${mapping.aliases.join(', ')})`
  }))
);

watch(
  () => modelsQuery.defaultModel.value,
  (value) => {
    if (!selectedModel.value && value?.name) {
      selectedModel.value = value.name;
    }
  },
  { immediate: true }
);

watch(
  models,
  (value) => {
    if (!selectedModel.value && value.length) {
      selectedModel.value = value[0].name;
    }
  },
  { immediate: true }
);

const groupedPreview = computed(() => {
  const groups: Record<string, { label: string; items: PreviewMetadataItem[] }> = {};
  for (const item of previewResults.value) {
    const key = item.entityType;
    if (!groups[key]) {
      groups[key] = {
        label: formatEntityType(key),
        items: []
      };
    }
    groups[key].items.push(item);
  }
  return Object.entries(groups).map(([key, value]) => ({ key, ...value }));
});

function formatEntityType(type: string) {
  switch (type) {
    case 'database':
      return 'Databases';
    case 'table':
      return 'Tables';
    case 'column':
      return 'Columns';
    case 'business_metric':
      return 'Business Metrics';
    case 'query_template':
      return 'Query Templates';
    case 'synonym_mapping':
      return 'Synonym Mappings';
    default:
      return type;
  }
}

function onToggleAll(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  setAllCategories(checked);
}

function onToggleCategory(key: MetadataCategory, event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  categoryState[key].enabled = checked;
}

function onSelectIds(key: MetadataCategory, event: Event) {
  const select = event.target as HTMLSelectElement;
  const values = Array.from(select.selectedOptions).map((option) => option.value);
  categoryState[key].ids = values;
}

function resetFilters() {
  scoreThreshold.value = 0.72;
  topK.value = 6;
  tagsInput.value = '';
  restoreCategoryDefaults();
}

function clearAll() {
  queryText.value = '';
  previewResults.value = [];
  aiResponseText.value = '';
  aiUsage.value = null;
  history.value = [];
  previewError.value = '';
  aiError.value = '';
  scoreThreshold.value = 0.72;
  topK.value = 6;
  tagsInput.value = '';
  restoreCategoryDefaults();
}

async function runPreview() {
  if (!queryText.value.trim()) {
    previewError.value = 'Enter a question to run preview.';
    return;
  }

  previewError.value = '';
  isPreviewing.value = true;

  try {
    const include = buildIncludePayload();
    const tags = parseTags();

    const response = await previewMetadata({
      query: queryText.value,
      scoreThreshold: scoreThreshold.value,
      topK: topK.value,
      include: Object.keys(include).length ? include : undefined,
      tags: tags.length ? tags : undefined
    });

    previewResults.value = response.items ?? [];
    history.value = [
      {
        id: crypto.randomUUID(),
        query: queryText.value,
        timestamp: new Date(),
        include,
        tags,
        previewItems: response.items ?? []
      },
      ...history.value
    ].slice(0, 15);
    mode.value = 'preview';
  } catch (error) {
    previewError.value = (error as Error).message ?? 'Failed to run preview.';
  } finally {
    isPreviewing.value = false;
  }
}

function buildIncludePayload(): PreviewInclude {
  const payload: PreviewInclude = {};
  (Object.entries(categoryState) as [MetadataCategory, { enabled: boolean; ids: string[] }][]).forEach(
    ([key, value]) => {
      if (!value.enabled) {
        return;
      }
      payload[key] = value.ids.length > 0 ? [...value.ids] : true;
    }
  );
  return payload;
}

function parseTags() {
  return tagsInput.value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

async function sendToAi() {
  if (previewResults.value.length === 0) {
    aiError.value = 'Run a preview before asking the AI.';
    return;
  }
  if (!queryText.value.trim()) {
    aiError.value = 'Enter a question for the AI.';
    return;
  }
  if (!selectedModel.value) {
    aiError.value = 'Select a model to continue.';
    return;
  }

  aiError.value = '';
  aiResponseText.value = '';
  aiUsage.value = null;
  isAsking.value = true;

  try {
    const contextLines = previewResults.value
      .map((item) => `• [${item.entityType}] ${item.title} (score ${item.score.toFixed(2)})`)
      .join('\n');

    const historyMessages = [
      {
        role: 'system' as const,
        content: contextLines ? `Relevant metadata:\n${contextLines}` : 'No metadata context supplied.'
      }
    ];

    const response = await sendChat({
      brandRef: activeTenant.value.brandRef,
      structure: activeTenant.value.structure,
      content: queryText.value,
      model: selectedModel.value,
      history: historyMessages
    });

    aiResponseText.value = response.content;
    aiUsage.value = response.usage ?? null;
    mode.value = 'ask-ai';
  } catch (error) {
    aiError.value = (error as Error).message ?? 'Failed to get AI response.';
  } finally {
    isAsking.value = false;
  }
}

function loadHistory(item: HistoryItem) {
  queryText.value = item.query;
  tagsInput.value = item.tags.join(', ');
  previewResults.value = item.previewItems;
  (Object.entries(categoryState) as [MetadataCategory, { enabled: boolean; ids: string[] }][]).forEach(
    ([key, value]) => {
      const includeValue = item.include?.[key];
      if (includeValue === undefined) {
        value.enabled = false;
        value.ids = [];
        return;
      }
      if (includeValue === false) {
        value.enabled = false;
        value.ids = [];
        return;
      }
      value.enabled = true;
      value.ids = Array.isArray(includeValue) ? [...includeValue] : [];
    }
  );
}

function setAllCategories(value: boolean) {
  (Object.keys(categoryState) as MetadataCategory[]).forEach((key) => {
    categoryState[key].enabled = value;
  });
}

function restoreCategoryDefaults() {
  (Object.keys(categoryState) as MetadataCategory[]).forEach((key) => {
    categoryState[key].enabled = defaultCategoryConfig[key].enabled;
    categoryState[key].ids = [];
  });
}

function formatRelative(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  if (Math.abs(diffMinutes) < 1) return 'just now';
  if (Math.abs(diffMinutes) < 60) {
    return `${diffMinutes} min ago`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return `${diffHours} hr ago`;
  }
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}
</script>
