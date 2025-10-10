<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div class="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-lg border border-border bg-background shadow-lg">
          <header class="border-b border-border px-6 py-4">
            <h2 class="text-lg font-semibold">Import Query Templates</h2>
            <p class="text-sm text-muted-foreground">Paste JSON array of query templates, review, then import or upsert.</p>
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
                  placeholder="Paste JSON array of query templates"
                />
                <div class="flex items-center justify-between text-sm">
                  <p v-if="parseError" class="text-destructive">{{ parseError }}</p>
                  <div class="flex items-center gap-2">
                    <label class="flex items-center gap-2 text-xs text-muted-foreground">
                      <input type="checkbox" v-model="replaceOnImport" />
                      Update existing templates when IDs match
                    </label>
                    <button class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90" @click="parseJson">
                      Parse JSON
                    </button>
                  </div>
                </div>
              </section>

              <section class="flex flex-col overflow-hidden">
                <div class="mb-3 flex items-center justify-between">
                  <h3 class="text-sm font-medium uppercase tracking-wide text-muted-foreground">Preview ({{ drafts.length }})</h3>
                  <button class="rounded-md border border-border px-3 py-1.5 text-sm" :disabled="drafts.length === 0" @click="removeAll">
                    Remove All
                  </button>
                </div>
                <div class="flex-1 overflow-y-auto rounded-lg border border-border">
                  <ul v-if="drafts.length" class="divide-y divide-border text-sm">
                    <li v-for="draft in drafts" :key="draft.internalId" class="space-y-3 p-4">
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <h4 class="text-base font-semibold text-foreground">{{ draft.template.question_en || 'Untitled Template' }}</h4>
                          <p class="text-xs text-muted-foreground">{{ draft.template.tags.join(', ') || 'No tags' }}</p>
                        </div>
                        <div class="flex items-center gap-2 text-xs">
                          <span v-if="draft.status === 'success'" class="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">Imported</span>
                          <span
                            v-else-if="draft.status === 'error'"
                            class="rounded-full bg-destructive/10 px-2 py-0.5 font-medium text-destructive"
                          >
                            Failed
                          </span>
                          <button class="rounded-md border border-border px-2 py-1" @click="toggleExpand(draft.internalId)">
                            {{ expanded.has(draft.internalId) ? 'Collapse' : 'Inspect' }}
                          </button>
                          <button class="rounded-md border border-border px-2 py-1 text-destructive" @click="removeDraft(draft.internalId)">Remove</button>
                        </div>
                      </div>

                      <div v-if="expanded.has(draft.internalId)" class="grid gap-3 rounded-md border border-border p-3 text-xs">
                        <label class="flex flex-col gap-1">
                          <span class="font-medium">Question (EN)</span>
                          <input v-model="draft.template.question_en" class="rounded-md border border-border px-2 py-1.5" />
                        </label>
                        <label class="flex flex-col gap-1">
                          <span class="font-medium">Question (TH)</span>
                          <input v-model="draft.template.question_th" class="rounded-md border border-border px-2 py-1.5" />
                        </label>
                        <label class="flex flex-col gap-1">
                          <span class="font-medium">SQL Statement</span>
                          <textarea v-model="draft.template.sql_statement" rows="2" class="rounded-md border border-border px-2 py-1.5" />
                        </label>
                        <label class="flex flex-col gap-1">
                          <span class="font-medium">Tags</span>
                          <input v-model="draft.tagsInput" placeholder="Comma separated" class="rounded-md border border-border px-2 py-1.5" />
                        </label>
                      </div>

                      <p v-if="draft.error" class="text-xs text-destructive">{{ draft.error }}</p>
                    </li>
                  </ul>
                  <div v-else class="flex h-full items-center justify-center text-sm text-muted-foreground">Parsed templates will appear here.</div>
                </div>
              </section>
            </div>

            <footer class="flex items-center justify-between border-t border-border bg-muted/40 px-6 py-4 text-sm">
              <p class="text-muted-foreground">{{ importSummary }}</p>
              <div class="flex items-center gap-2">
                <button class="rounded-md border border-border px-4 py-2" @click="emit('update:open', false)">Close</button>
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
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { createQueryTemplate, updateQueryTemplate } from '@/api/metadata';
import type { QueryTemplateMetadata } from '@/types/metadata';
import { useTenantStore } from '@/stores/tenant';

interface Props {
  open: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{ 'update:open': [value: boolean]; imported: [] }>();

const tenantStore = useTenantStore();
const { activeTenant } = storeToRefs(tenantStore);

const rawInput = ref('');
const parseError = ref('');
const replaceOnImport = ref(false);
const drafts = reactive<TemplateDraft[]>([]);
const expanded = reactive(new Set<string>());
const isImporting = ref(false);
const importProgress = ref(0);

interface TemplateDraftModel {
  query_template_id?: string;
  database_id?: string;
  question_en: string;
  question_th: string;
  sql_statement: string;
  relevant_table_ids: string[];
  relevant_column_ids: string[];
  relevant_relationship_ids: string[];
  tags: string[];
  performance_notes?: string;
  query_complexity?: string;
  estimated_rows_returned?: number;
  usage_frequency?: number;
}

interface TemplateDraft {
  internalId: string;
  template: TemplateDraftModel;
  status: 'pending' | 'success' | 'error';
  error?: string;
  tagsInput: string;
  originalId?: string;
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
      parseError.value = 'Expected a JSON array of templates.';
      return;
    }

    parsed.forEach((item: any, index: number) => {
      drafts.push(normalizeTemplate(item, index));
    });
  } catch (error) {
    parseError.value = (error as Error).message ?? 'Failed to parse JSON';
  }
}

function normalizeTemplate(raw: any, index: number): TemplateDraft {
  const question = raw?.natural_language_question ?? {};
  const draft: TemplateDraft = {
    internalId: `${raw?.query_template_id ?? 'template'}-${index}-${crypto.randomUUID()}`,
    template: {
      query_template_id: raw?.query_template_id,
      database_id: raw?.database_id ?? '',
      question_en: question.en ?? '',
      question_th: question.th ?? '',
      sql_statement: raw?.sql_statement ?? '',
      relevant_table_ids: raw?.relevant_table_ids ?? [],
      relevant_column_ids: raw?.relevant_column_ids ?? [],
      relevant_relationship_ids: raw?.relevant_relationship_ids ?? [],
      tags: raw?.tags ?? [],
      performance_notes: raw?.performance_notes ?? '',
      query_complexity: raw?.query_complexity ?? 'SIMPLE',
      estimated_rows_returned: raw?.estimated_rows_returned,
      usage_frequency: raw?.usage_frequency ?? 0
    },
    status: 'pending',
    tagsInput: (raw?.tags ?? []).join(', '),
    originalId: raw?.query_template_id
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
  if (!drafts.length) return 'No templates parsed.';
  const success = drafts.filter((draft) => draft.status === 'success').length;
  const failed = drafts.filter((draft) => draft.status === 'error').length;
  if (success === 0 && failed === 0) return `${drafts.length} templates ready to import.`;
  return `${success} imported, ${failed} failed.`;
});

async function runImport() {
  if (!drafts.length) return;
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

    draft.template.tags = parseList(draft.tagsInput);

    const payload = buildPayload(draft.template);

    try {
      if (replaceOnImport.value && draft.template.query_template_id) {
        await updateQueryTemplate(draft.template.query_template_id, payload);
      } else {
        await createQueryTemplate(payload);
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

function buildPayload(draft: TemplateDraftModel) {
  return {
    brandRef: activeTenant.value.brandRef,
    structure: activeTenant.value.structure,
    template: {
      type: 'query_template',
      query_template_id: draft.query_template_id,
      database_id: draft.database_id || undefined,
      natural_language_question: {
        en: draft.question_en,
        th: draft.question_th
      },
      sql_statement: draft.sql_statement,
      relevant_table_ids: draft.relevant_table_ids,
      relevant_column_ids: draft.relevant_column_ids,
      relevant_relationship_ids: draft.relevant_relationship_ids,
      tags: draft.tags,
      performance_notes: draft.performance_notes || undefined,
      query_complexity: draft.query_complexity,
      estimated_rows_returned: draft.estimated_rows_returned,
      usage_frequency: draft.usage_frequency
    }
  };
}

const sampleJson = `[
  {
    "query_template_id": "sample-template-1",
    "type": "query-template",
    "database_id": "demo-database-id",
    "natural_language_question": {
      "en": "Show sample template",
      "th": "แสดงตัวอย่างเทมเพลต"
    },
    "sql_statement": "SELECT 1 AS Sample",
    "relevant_table_ids": [],
    "relevant_column_ids": [],
    "tags": ["demo"],
    "query_complexity": "SIMPLE",
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
