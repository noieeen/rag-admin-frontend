<template>
  <Dialog :open="open" @update:open="emit('update:open', false)">
    <DialogContent class="sm:max-w-[1000px]">
      <DialogHeader>
        <DialogTitle>Import Columns</DialogTitle>
        <DialogDescription>Paste a JSON array of columns to import.</DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 p-1 lg:grid-cols-[1.1fr,1.3fr]">
        <section class="flex flex-col gap-3">
          <h3 class="text-sm font-medium uppercase tracking-wide text-muted-foreground">JSON Input</h3>
          <textarea v-model="raw" rows="12" class="rounded-md border border-border bg-background px-3 py-2 font-mono text-xs" placeholder="Paste JSON array of columns here" />
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
              <li v-for="draft in drafts" :key="draft.internalId" class="space-y-2 p-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="font-medium">{{ draft.record.display_name?.en || draft.record.column_name || 'Untitled Column' }}</p>
                    <p class="text-xs text-muted-foreground">{{ draft.record.table_name }} · {{ draft.record.data_type }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button class="rounded-md border border-border px-2 py-1 text-xs" @click="toggleExpand(draft.internalId)">
                      {{ expanded.has(draft.internalId) ? 'Collapse' : 'Inspect' }}
                    </button>
                    <button class="rounded-md border border-border px-2 py-1 text-xs" @click="removeDraft(draft.internalId)">Remove</button>
                  </div>
                </div>
                <div v-if="expanded.has(draft.internalId)" class="grid gap-3 rounded-md border border-border p-3 text-xs">
                  <label class="flex flex-col gap-1">
                    <span class="font-medium">Column Name</span>
                    <input v-model="draft.record.column_name" class="rounded-md border border-border px-2 py-1.5" />
                  </label>
                  <label class="flex flex-col gap-1">
                    <span class="font-medium">Display Name (EN)</span>
                    <input v-model="draft.record.display_name.en" class="rounded-md border border-border px-2 py-1.5" />
                  </label>
                  <div class="grid grid-cols-2 gap-3">
                    <label class="flex flex-col gap-1">
                      <span class="font-medium">Data Type</span>
                      <input v-model="draft.record.data_type" class="rounded-md border border-border px-2 py-1.5" />
                    </label>
                    <label class="flex flex-col gap-1">
                      <span class="font-medium">Sensitivity</span>
                      <input v-model="draft.record.sensitivity" class="rounded-md border border-border px-2 py-1.5" />
                    </label>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <label class="flex items-center gap-2">
                      <input type="checkbox" v-model="draft.record.is_primary_key" />
                      <span>Primary Key</span>
                    </label>
                    <label class="flex items-center gap-2">
                      <input type="checkbox" v-model="draft.record.is_foreign_key" />
                      <span>Foreign Key</span>
                    </label>
                  </div>
                </div>
              </li>
            </ul>
            <div v-else class="flex h-40 items-center justify-center text-sm text-muted-foreground">Parsed columns will appear here.</div>
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
import { createColumn } from '@/api/metadata';
import type { ColumnMetadata } from '@/types/metadata';
import { useTenantStore } from '@/stores/tenant';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props { open: boolean }
const props = defineProps<Props>();
const emit = defineEmits<{ 'update:open': [value: boolean]; imported: [] }>();

const tenantStore = useTenantStore();
const { activeTenant } = storeToRefs(tenantStore);

const raw = ref('');
const error = ref('');
const drafts = reactive<{ internalId: string; record: ColumnMetadata }[]>([]);
const expanded = reactive(new Set<string>());
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
    parsed.forEach((item: ColumnMetadata, index: number) => {
      drafts.push({ internalId: `${item?.column_id ?? 'col'}-${index}-${crypto.randomUUID()}` , record: item });
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
  expanded.clear();
}

const importSummary = computed(() => drafts.length ? `${drafts.length} columns ready to import.` : 'No columns parsed.');

async function runImport() {
  if (!drafts.length) return;
  isImporting.value = true;
  progress.value = 0;
  for (let i = 0; i < drafts.length; i += 1) {
    const record = drafts[i].record;
    try {
      await createColumn({ brandRef: activeTenant.value.brandRef, structure: activeTenant.value.structure, column: record });
      progress.value = i + 1;
    } catch (e) {
      // continue
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
    "column_id": "demo-col",
    "type": "column",
    "database_id": "demo-db",
    "table_id": "demo-table",
    "table_name": "orders",
    "column_name": "order_id",
    "display_name": { "en": "Order ID", "th": "รหัสคำสั่งซื้อ" },
    "description": { "en": "Unique identifier for order", "th": "รหัสเฉพาะของคำสั่งซื้อ" },
    "data_type": "uuid",
    "is_nullable": false,
    "is_primary_key": true,
    "is_foreign_key": false,
    "sensitivity": "internal"
  }
]`;

function toggleExpand(id: string) {
  if (expanded.has(id)) expanded.delete(id); else expanded.add(id);
}
</script>


