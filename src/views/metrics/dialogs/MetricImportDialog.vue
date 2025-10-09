<template>
  <Dialog>
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div class="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-lg border border-border bg-background shadow-lg">
        <header class="border-b border-border px-6 py-4">
          <h2 class="text-lg font-semibold">Import Business Metrics</h2>
          <p class="text-sm text-muted-foreground">
            Paste JSON for one or more business metrics. Review and edit before committing the import.
          </p>
        </header>

        <div class="flex flex-1 flex-col overflow-hidden">
          <div class="grid flex-1 gap-4 overflow-hidden p-6 lg:grid-cols-[1.1fr,1.3fr]">
            <section class="flex flex-col gap-4 overflow-hidden">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-medium uppercase tracking-wide text-muted-foreground">JSON Input</h3>
                <div class="flex items-center gap-2 text-sm">
                  <button class="rounded-md border border-border px-3 py-1.5" @click="loadSample">Load Sample</button>
                  <button class="rounded-md border border-border px-3 py-1.5" @click="clearInput">Clear</button>
                </div>
              </div>
              <textarea
                  v-model="rawInput"
                  rows="12"
                  class="flex-1 rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
                  placeholder="Paste JSON array of business metrics here"
              />
              <div class="flex items-center justify-between text-sm">
                <p v-if="parseError" class="text-destructive">{{ parseError }}</p>
                <div class="flex items-center gap-2">
                  <label class="flex items-center gap-2 text-xs text-muted-foreground">
                    <input type="checkbox" v-model="replaceOnImport" />
                    Update existing metrics when IDs match
                  </label>
                  <button
                      class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                      @click="parseJson"
                  >
                    Parse JSON
                  </button>
                </div>
              </div>
            </section>

            <section class="flex flex-col overflow-hidden">
              <div class="mb-3 flex items-center justify-between">
                <h3 class="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  Preview ({{ drafts.length }} records)
                </h3>
                <button
                    class="rounded-md border border-border px-3 py-1.5 text-sm"
                    :disabled="drafts.length === 0"
                    @click="removeAll"
                >
                  Remove All
                </button>
              </div>
              <div class="flex-1 overflow-y-auto rounded-lg border border-border">
                <ul v-if="drafts.length" class="divide-y divide-border text-sm">
                  <li v-for="draft in drafts" :key="draft.internalId" class="space-y-3 p-4">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <h4 class="text-base font-semibold text-foreground">
                          {{ draft.metric.metric_name_en || draft.metric.short_name || 'Untitled Metric' }}
                        </h4>
                        <p class="text-xs text-muted-foreground">
                          {{ draft.metric.business_domain || '—' }} · {{ draft.metric.refresh_schedule || '—' }}
                        </p>
                      </div>
                      <div class="flex items-center gap-2 text-xs">
                          <span
                              v-if="draft.status === 'success'"
                              class="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700"
                          >
                            Imported
                          </span>
                        <span
                            v-else-if="draft.status === 'error'"
                            class="rounded-full bg-destructive/10 px-2 py-0.5 font-medium text-destructive"
                        >
                            Failed
                          </span>
                        <button
                            class="rounded-md border border-border px-2 py-1"
                            @click="toggleExpand(draft.internalId)"
                        >
                          {{ expanded.has(draft.internalId) ? 'Collapse' : 'Inspect' }}
                        </button>
                        <button
                            class="rounded-md border border-border px-2 py-1 text-destructive"
                            @click="removeDraft(draft.internalId)"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div v-if="expanded.has(draft.internalId)" class="grid gap-3 rounded-md border border-border p-3 text-xs">
                      <label class="flex flex-col gap-1">
                        <span class="font-medium">Metric Name (EN)</span>
                        <input v-model="draft.metric.metric_name_en" class="rounded-md border border-border px-2 py-1.5" />
                      </label>
                      <label class="flex flex-col gap-1">
                        <span class="font-medium">Metric Name (TH)</span>
                        <input v-model="draft.metric.metric_name_th" class="rounded-md border border-border px-2 py-1.5" />
                      </label>
                      <label class="flex flex-col gap-1">
                        <span class="font-medium">Short Name</span>
                        <input v-model="draft.metric.short_name" class="rounded-md border border-border px-2 py-1.5" />
                      </label>
                      <label class="flex flex-col gap-1">
                        <span class="font-medium">Business Domain</span>
                        <input v-model="draft.metric.business_domain" class="rounded-md border border-border px-2 py-1.5" />
                      </label>
                      <label class="flex flex-col gap-1">
                        <span class="font-medium">Description (EN)</span>
                        <textarea v-model="draft.metric.description_en" rows="2" class="rounded-md border border-border px-2 py-1.5" />
                      </label>
                      <label class="flex flex-col gap-1">
                        <span class="font-medium">Calculation Logic</span>
                        <textarea v-model="draft.metric.calculation_logic" rows="2" class="rounded-md border border-border px-2 py-1.5" />
                      </label>
                      <label class="flex flex-col gap-1">
                        <span class="font-medium">SQL Expression</span>
                        <textarea v-model="draft.metric.sql_expression" rows="2" class="rounded-md border border-border px-2 py-1.5" />
                      </label>
                      <label class="flex flex-col gap-1">
                        <span class="font-medium">Tags</span>
                        <input
                            v-model="draft.tagsInput"
                            placeholder="Comma separated"
                            class="rounded-md border border-border px-2 py-1.5"
                        />
                      </label>
                      <label class="flex flex-col gap-1">
                        <span class="font-medium">Common Filters</span>
                        <input
                            v-model="draft.filtersInput"
                            placeholder="Comma separated"
                            class="rounded-md border border-border px-2 py-1.5"
                        />
                      </label>
                    </div>

                    <p v-if="draft.error" class="text-xs text-destructive">{{ draft.error }}</p>
                  </li>
                </ul>
                <div v-else class="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Parsed metrics will appear here.
                </div>
              </div>
            </section>
          </div>

          <footer class="flex items-center justify-between border-t border-border bg-muted/40 px-6 py-4 text-sm">
            <p class="text-muted-foreground">
              {{ importSummary }}
            </p>
            <div class="flex items-center gap-2">
              <button class="rounded-md border border-border px-4 py-2" @click="emit('update:open', false)">
                Close
              </button>
              <button
                  class="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  :disabled="drafts.length === 0 || isImporting"
                  @click="runImport"
              >
                {{ isImporting ? `Importing ${importProgress}/${drafts.length}` : 'Import Records' }}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { createBusinessMetric, updateBusinessMetric } from '@/api/metadata';
import type { BusinessMetricMetadata } from '@/types/metadata';
import { useTenantStore } from '@/stores/tenant';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
interface Props {
  open: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{ 'update:open': [value: boolean]; imported: [] }>();

const tenantStore = useTenantStore();
const { activeTenant } = storeToRefs(tenantStore);

const rawInput = ref('');
const parseError = ref('');
const drafts = reactive<ImportDraft[]>([]);
const expanded = reactive(new Set<string>());
const replaceOnImport = ref(false);
const isImporting = ref(false);
const importProgress = ref(0);

interface ImportDraft {
  internalId: string;
  metric: MetricDraftModel;
  status: 'pending' | 'success' | 'error';
  error?: string;
  tagsInput: string;
  filtersInput: string;
  originalId?: string;
}

interface MetricDraftModel {
  metric_id?: string;
  database_id?: string;
  metric_name_en: string;
  metric_name_th: string;
  short_name: string;
  description_en: string;
  description_th: string;
  business_domain: string;
  calculation_logic: string;
  sql_expression: string;
  relevant_table_ids: string[];
  relevant_column_ids: string[];
  unit_of_measure: string;
  aggregation_type: string;
  grain: string;
  business_owner: string;
  refresh_schedule: string;
  typical_range?: BusinessMetricMetadata['typical_range'];
  related_metrics: string[];
  common_filters: string[];
  tags: string[];
  usage_frequency: number;
}

function parseJson() {
  parseError.value = '';
  drafts.splice(0);
  expanded.clear();

  if (!rawInput.value.trim()) {
    parseError.value = 'Paste JSON data first.';
    return;
  }

  try {
    const parsed = JSON.parse(rawInput.value);
    if (!Array.isArray(parsed)) {
      parseError.value = 'Expected a JSON array of metrics.';
      return;
    }

    parsed.forEach((item: any, index: number) => {
      const draft = normalizeMetric(item, index);
      drafts.push(draft);
    });
  } catch (error) {
    parseError.value = (error as Error).message ?? 'Failed to parse JSON';
  }
}

function normalizeMetric(raw: any, index: number): ImportDraft {
  const metricName = raw?.metric_name ?? {};
  const description = raw?.description ?? {};
  const draft: ImportDraft = {
    internalId: `${raw?.metric_id ?? 'metric'}-${index}-${crypto.randomUUID()}`,
    metric: {
      metric_id: raw?.metric_id,
      database_id: raw?.database_id ?? '',
      metric_name_en: metricName.en ?? '',
      metric_name_th: metricName.th ?? '',
      short_name: raw?.short_name ?? '',
      description_en: description.en ?? '',
      description_th: description.th ?? '',
      business_domain: raw?.business_domain ?? '',
      calculation_logic: raw?.calculation_logic ?? '',
      sql_expression: raw?.sql_expression ?? '',
      relevant_table_ids: raw?.relevant_table_ids ?? [],
      relevant_column_ids: raw?.relevant_column_ids ?? [],
      unit_of_measure: raw?.unit_of_measure ?? '',
      aggregation_type: raw?.aggregation_type ?? '',
      grain: raw?.grain ?? '',
      business_owner: raw?.business_owner ?? '',
      refresh_schedule: raw?.refresh_schedule ?? 'daily',
      typical_range: raw?.typical_range,
      related_metrics: raw?.related_metrics ?? [],
      common_filters: raw?.common_filters ?? [],
      tags: raw?.tags ?? [],
      usage_frequency: raw?.usage_frequency ?? 0
    },
    status: 'pending',
    tagsInput: (raw?.tags ?? []).join(', '),
    filtersInput: (raw?.common_filters ?? []).join(', '),
    originalId: raw?.metric_id
  };
  return draft;
}

function toggleExpand(id: string) {
  if (expanded.has(id)) {
    expanded.delete(id);
  } else {
    expanded.add(id);
  }
}

function removeDraft(id: string) {
  const index = drafts.findIndex((draft) => draft.internalId === id);
  if (index >= 0) drafts.splice(index, 1);
}

function removeAll() {
  drafts.splice(0);
  expanded.clear();
}

function clearInput() {
  rawInput.value = '';
  parseError.value = '';
  removeAll();
}

function loadSample() {
  rawInput.value = sampleJson.trim();
  parseJson();
}

const importSummary = computed(() => {
  if (!drafts.length) return 'No metrics parsed.';
  const success = drafts.filter((draft) => draft.status === 'success').length;
  const failed = drafts.filter((draft) => draft.status === 'error').length;
  if (success === 0 && failed === 0) {
    return `${drafts.length} metrics ready to import.`;
  }
  return `${success} imported, ${failed} failed.`;
});

async function runImport() {
  if (drafts.length === 0) return;
  isImporting.value = true;
  importProgress.value = 0;

  const parseList = (value: string) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  for (let index = 0; index < drafts.length; index += 1) {
    const draft = drafts[index];
    draft.status = 'pending';
    draft.error = undefined;

    draft.metric.tags = parseList(draft.tagsInput);
    draft.metric.common_filters = parseList(draft.filtersInput);

    const payload = buildCreatePayload(draft.metric);

    try {
      if (replaceOnImport.value && draft.metric.metric_id) {
        await updateBusinessMetric(draft.metric.metric_id, payload);
      } else {
        await createBusinessMetric(payload);
      }
      draft.status = 'success';
      importProgress.value = index + 1;
    } catch (error) {
      draft.status = 'error';
      draft.error = (error as Error).message ?? 'Failed to import';
    }
  }

  isImporting.value = false;
  emit('imported');
}

function buildCreatePayload(draft: MetricDraftModel) {
  return {
    brandRef: activeTenant.value.brandRef,
    structure: activeTenant.value.structure,
    metric: {
      type: 'business_metric',
      metric_id: draft.metric_id,
      database_id: draft.database_id ?? '',
      metric_name: {
        en: draft.metric_name_en,
        th: draft.metric_name_th
      },
      short_name: draft.short_name,
      description: {
        en: draft.description_en,
        th: draft.description_th
      },
      business_domain: draft.business_domain,
      calculation_logic: draft.calculation_logic,
      sql_expression: draft.sql_expression,
      relevant_table_ids: draft.relevant_table_ids,
      relevant_column_ids: draft.relevant_column_ids,
      unit_of_measure: draft.unit_of_measure,
      aggregation_type: draft.aggregation_type,
      grain: draft.grain,
      business_owner: draft.business_owner,
      refresh_schedule: draft.refresh_schedule,
      typical_range: draft.typical_range,
      related_metrics: draft.related_metrics,
      common_filters: draft.common_filters,
      tags: draft.tags,
      usage_frequency: draft.usage_frequency,
      last_queried: undefined
    }
  };
}

const sampleJson = `[
  {
    "metric_id": "sample-metric-1",
    "type": "business_metric",
    "database_id": "demo-database-id",
    "metric_name": { "en": "Sample Metric", "th": "ตัวอย่างเมตริก" },
    "short_name": "SM",
    "description": { "en": "Demo metric for preview.", "th": "ตัวอย่างสำหรับการแสดงตัวอย่าง" },
    "business_domain": "demo",
    "calculation_logic": "SUM(value)",
    "sql_expression": "SELECT SUM(value) FROM demo",
    "relevant_table_ids": [],
    "relevant_column_ids": [],
    "unit_of_measure": "count",
    "aggregation_type": "SUM",
    "grain": "item",
    "business_owner": "demo-team",
    "refresh_schedule": "daily",
    "typical_range": { "min": 0, "median": 10, "p95": 20, "max": 30 },
    "related_metrics": [],
    "common_filters": [],
    "tags": ["demo"],
    "usage_frequency": 0
  }
]`;
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
