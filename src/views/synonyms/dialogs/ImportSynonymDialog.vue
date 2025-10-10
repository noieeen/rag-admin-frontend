<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div class="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-lg border border-border bg-background shadow-lg">
          <header class="border-b border-border px-6 py-4">
            <h2 class="text-lg font-semibold">Import Synonym Mappings</h2>
            <p class="text-sm text-muted-foreground">Paste JSON array of synonym mappings, review, then import or upsert.</p>
          </header>

          <div class="flex flex-1 flex-col overflow-hidden">
            <div class="grid flex-1 gap-4 overflow-hidden p-6 lg:grid-cols-[1.1fr,1.2fr]">
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
                  placeholder="Paste JSON array of synonym mappings"
                />
                <div class="flex items-center justify-between text-sm">
                  <p v-if="parseError" class="text-destructive">{{ parseError }}</p>
                  <div class="flex items-center gap-2">
                    <label class="flex items-center gap-2 text-xs text-muted-foreground">
                      <input type="checkbox" v-model="replaceOnImport" />
                      Update existing mappings when canonical term matches
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
                  <button class="rounded-md border border-border px-3 py-1.5 text-sm" :disabled="drafts.length === 0" @click="removeAll">Remove All</button>
                </div>
                <div class="flex-1 overflow-y-auto rounded-lg border border-border">
                  <ul v-if="drafts.length" class="divide-y divide-border text-sm">
                    <li v-for="draft in drafts" :key="draft.internalId" class="space-y-3 p-4">
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <h4 class="text-base font-semibold text-foreground">{{ draft.mapping.canonical_term || 'Untitled Synonym' }}</h4>
                          <p class="text-xs text-muted-foreground">{{ draft.mapping.aliases.join(', ') || 'No aliases' }}</p>
                        </div>
                        <div class="flex items-center gap-2 text-xs">
                          <span v-if="draft.status === 'success'" class="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">Imported</span>
                          <span v-else-if="draft.status === 'error'" class="rounded-full bg-destructive/10 px-2 py-0.5 font-medium text-destructive">Failed</span>
                          <button class="rounded-md border border-border px-2 py-1" @click="toggleExpand(draft.internalId)">
                            {{ expanded.has(draft.internalId) ? 'Collapse' : 'Inspect' }}
                          </button>
                          <button class="rounded-md border border-border px-2 py-1 text-destructive" @click="removeDraft(draft.internalId)">Remove</button>
                        </div>
                      </div>

                      <div v-if="expanded.has(draft.internalId)" class="grid gap-3 rounded-md border border-border p-3 text-xs">
                        <label class="flex flex-col gap-1">
                          <span class="font-medium">Canonical Term</span>
                          <input v-model="draft.mapping.canonical_term" class="rounded-md border border-border px-2 py-1.5" />
                        </label>
                        <label class="flex flex-col gap-1">
                          <span class="font-medium">Aliases</span>
                          <input v-model="draft.aliasesInput" placeholder="Comma separated" class="rounded-md border border-border px-2 py-1.5" />
                        </label>
                        <label class="flex flex-col gap-1">
                          <span class="font-medium">Entity Type</span>
                          <input v-model="draft.mapping.entity_type" class="rounded-md border border-border px-2 py-1.5" />
                        </label>
                        <label class="flex flex-col gap-1">
                          <span class="font-medium">Entity ID</span>
                          <input v-model="draft.mapping.entity_id" class="rounded-md border border-border px-2 py-1.5" />
                        </label>
                      </div>

                      <p v-if="draft.error" class="text-xs text-destructive">{{ draft.error }}</p>
                    </li>
                  </ul>
                  <div v-else class="flex h-full items-center justify-center text-sm text-muted-foreground">Parsed synonyms will appear here.</div>
                </div>
              </section>
            </div>

            <footer class="flex items-center justify-between border-t border-border bg-muted/40 px-6 py-4 text-sm">
              <p class="text-muted-foreground">{{ importSummary }}</p>
              <div class="flex items-center gap-2">
                <button class="rounded-md border border-border px-4 py-2" @click="emit('update:open', false)">Close</button>
                <button class="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50" :disabled="drafts.length === 0 || isImporting" @click="runImport">
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

import { createSynonymMapping, updateSynonymMapping } from '@/api/metadata';
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
const drafts = reactive<SynonymDraft[]>([]);
const expanded = reactive(new Set<string>());
const isImporting = ref(false);
const importProgress = ref(0);

interface SynonymDraftModel {
  canonical_term: string;
  aliases: string[];
  entity_type: string;
  entity_id?: string;
}

interface SynonymDraft {
  internalId: string;
  mapping: SynonymDraftModel;
  status: 'pending' | 'success' | 'error';
  error?: string;
  aliasesInput: string;
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
      parseError.value = 'Expected a JSON array of synonym mappings.';
      return;
    }

    parsed.forEach((item: any, index: number) => {
      drafts.push(normalize(item, index));
    });
  } catch (error) {
    parseError.value = (error as Error).message ?? 'Failed to parse JSON';
  }
}

function normalize(raw: any, index: number): SynonymDraft {
  const draft: SynonymDraft = {
    internalId: `${raw?.canonical_term ?? 'synonym'}-${index}-${crypto.randomUUID()}`,
    mapping: {
      canonical_term: raw?.canonical_term ?? '',
      aliases: raw?.aliases ?? [],
      entity_type: raw?.entity_type ?? '',
      entity_id: raw?.entity_id ?? ''
    },
    status: 'pending',
    aliasesInput: (raw?.aliases ?? []).join(', ')
  };
  return draft;
}

function toggleExpand(id: string) {
  expanded.has(id) ? expanded.delete(id) : expanded.add(id);
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
  if (!drafts.length) return 'No synonyms parsed.';
  const success = drafts.filter((draft) => draft.status === 'success').length;
  const failed = drafts.filter((draft) => draft.status === 'error').length;
  if (success === 0 && failed === 0) return `${drafts.length} mappings ready to import.`;
  return `${success} imported, ${failed} failed.`;
});

async function runImport() {
  if (!drafts.length) return;
  isImporting.value = true;
  importProgress.value = 0;

  for (let index = 0; index < drafts.length; index += 1) {
    const draft = drafts[index];
    draft.status = 'pending';
    draft.error = undefined;

    draft.mapping.aliases = draft.aliasesInput
      .split(',')
      .map((alias) => alias.trim())
      .filter(Boolean);

    const payload = buildPayload(draft.mapping);

    try {
      if (replaceOnImport.value && draft.mapping.canonical_term) {
        await updateSynonymMapping(draft.mapping.canonical_term, payload);
      } else {
        await createSynonymMapping(payload);
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

function buildPayload(mapping: SynonymDraftModel) {
  return {
    brandRef: activeTenant.value.brandRef,
    structure: activeTenant.value.structure,
    mapping: {
      canonical_term: mapping.canonical_term,
      aliases: mapping.aliases,
      entity_type: mapping.entity_type,
      entity_id: mapping.entity_id || undefined
    }
  };
}

const sampleJson = `[
  {
    "canonical_term": "customer",
    "aliases": ["member", "client"],
    "entity_type": "table",
    "entity_id": "demo-table-id"
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
