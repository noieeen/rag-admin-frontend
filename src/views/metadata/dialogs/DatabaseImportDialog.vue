<template>
  <Dialog :open="open" @update:open="emit('update:open', false)">
    <DialogContent class="sm:max-w-[900px]">
      <DialogHeader>
        <DialogTitle>Import Databases</DialogTitle>
        <DialogDescription>Paste a JSON array of databases to import.</DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 p-1 lg:grid-cols-[1.1fr,1.3fr]">
        <section class="flex flex-col gap-3">
          <h3 class="text-sm font-medium uppercase tracking-wide text-muted-foreground">JSON Input</h3>
          <textarea v-model="raw" rows="12" class="rounded-md border border-border bg-background px-3 py-2 font-mono text-xs" placeholder="Paste JSON array of databases here" />
          <div class="flex items-center justify-between text-sm">
            <p v-if="error" class="text-destructive">{{ error }}</p>
            <div class="flex items-center gap-2">
              <button class="rounded-md border border-border px-3 py-1.5" @click="loadSample">Load Sample</button>
              <button class="rounded-md border border-border px-3 py-1.5" @click="clear">Clear</button>
              <button class="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90" @click="parseJson">Parse JSON</button>
            </div>
          </div>
        </section>

        <section class="flex flex-col overflow-hidden">
          <div class="mb-2 flex items-center justify-between">
            <h3 class="text-sm font-medium uppercase tracking-wide text-muted-foreground">Preview ({{ drafts.length }} records)</h3>
            <button class="rounded-md border border-border px-3 py-1.5 text-sm" :disabled="drafts.length === 0" @click="removeAll">Remove All</button>
          </div>
          <div class="flex-1 overflow-y-auto rounded-lg border border-border">
            <ul v-if="drafts.length" class="divide-y divide-border text-sm">
              <li v-for="draft in drafts" :key="draft.internalId" class="flex items-center justify-between gap-3 p-3">
                <div>
                  <p class="font-medium">{{ draft.record.display_name?.en || draft.record.database_name || 'Untitled Database' }}</p>
                  <p class="text-xs text-muted-foreground">{{ draft.record.dialect || '—' }}</p>
                </div>
                <button class="rounded-md border border-border px-2 py-1 text-xs" @click="removeDraft(draft.internalId)">Remove</button>
              </li>
            </ul>
            <div v-else class="flex h-40 items-center justify-center text-sm text-muted-foreground">Parsed databases will appear here.</div>
          </div>
        </section>
      </div>

      <div class="flex items-center justify-between border-t border-border bg-muted/40 px-6 py-4 text-sm">
        <p class="text-muted-foreground">{{ importSummary }}</p>
        <div class="flex items-center gap-2">
          <button class="rounded-md border border-border px-4 py-2" @click="emit('update:open', false)">Close</button>
          <button class="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50" :disabled="drafts.length === 0 || isImporting" @click="runImport">
            {{ isImporting ? `Importing ${progress}/${drafts.length}` : 'Import Records' }}
          </button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { createDatabase } from '@/api/metadata';
import type { DatabaseMetadata } from '@/types/metadata';
import { useTenantStore } from '@/stores/tenant';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props { open: boolean }
const props = defineProps<Props>();
const emit = defineEmits<{ 'update:open': [value: boolean]; imported: [] }>();

const tenantStore = useTenantStore();
const { activeTenant } = storeToRefs(tenantStore);

const raw = ref('');
const error = ref('');
const drafts = reactive<{ internalId: string; record: DatabaseMetadata }[]>([]);
const isImporting = ref(false);
const progress = ref(0);

function clear() {
  raw.value = '';
  error.value = '';
  removeAll();
}

function parseJson() {
  error.value = '';
  drafts.splice(0);
  try {
    const parsed = JSON.parse(raw.value);
    if (!Array.isArray(parsed)) {
      error.value = 'Expected a JSON array.';
      return;
    }
    parsed.forEach((item: DatabaseMetadata, index: number) => {
      drafts.push({ internalId: `${item?.database_id ?? 'db'}-${index}-${crypto.randomUUID()}` , record: item });
    });
  } catch (e) {
    error.value = (e as Error).message ?? 'Failed to parse JSON';
  }
}

function removeDraft(id: string) {
  const i = drafts.findIndex(d => d.internalId === id);
  if (i >= 0) drafts.splice(i, 1);
}

function removeAll() {
  drafts.splice(0);
}

const importSummary = computed(() => drafts.length ? `${drafts.length} databases ready to import.` : 'No databases parsed.');

async function runImport() {
  if (!drafts.length) return;
  isImporting.value = true;
  progress.value = 0;
  for (let i = 0; i < drafts.length; i += 1) {
    const record = drafts[i].record;
    try {
      await createDatabase({ brandRef: activeTenant.value.brandRef, structure: activeTenant.value.structure, database: record });
      progress.value = i + 1;
    } catch (e) {
      // swallow individual failures to proceed with others
    }
  }
  isImporting.value = false;
  emit('imported');
}

function loadSample() {
  raw.value = sampleJson.trim();
  parseJson();
}

const sampleJson = `[
  {
    "database_id": "demo-db",
    "type": "database",
    "database_name": "demo",
    "display_name": { "en": "Demo Database", "th": "ฐานข้อมูลเดโม" },
    "description": { "en": "Sample database for import", "th": "ตัวอย่างสำหรับการนำเข้า" },
    "dialect": "PostgreSQL",
    "tags": { "en": ["demo", "sample"] }
  }
]`;
</script>


