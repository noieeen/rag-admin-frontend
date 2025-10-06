<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div class="w-full max-w-lg rounded-lg border border-border bg-background p-6 shadow-lg">
          <header class="mb-4">
            <h2 class="text-lg font-semibold">Create Synonym Mapping</h2>
            <p class="text-sm text-muted-foreground">Define a canonical term and its aliases for better search recall.</p>
          </header>

          <form class="space-y-4" @submit.prevent="submit">
            <div class="grid gap-2">
              <label class="text-sm font-medium">Canonical Term</label>
              <input v-model="form.canonical_term" required class="rounded-md border border-border px-3 py-2" />
            </div>

            <div class="grid gap-2">
              <label class="text-sm font-medium">Aliases (comma separated)</label>
              <input v-model="aliasesInput" class="rounded-md border border-border px-3 py-2" />
            </div>

            <div class="grid gap-2">
              <label class="text-sm font-medium">Entity Type</label>
              <select v-model="form.entity_type" class="rounded-md border border-border px-3 py-2">
                <option disabled value="">Select entity type</option>
                <option value="database">Database</option>
                <option value="table">Table</option>
                <option value="column">Column</option>
                <option value="business_metric">Business Metric</option>
                <option value="query_template">Query Template</option>
              </select>
            </div>

            <div class="grid gap-2">
              <label class="text-sm font-medium">Entity ID (optional)</label>
              <input v-model="form.entity_id" class="rounded-md border border-border px-3 py-2" />
              <p class="text-xs text-muted-foreground">Link to a specific metadata record when available (UUID).</p>
            </div>

            <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>

            <div class="flex justify-end gap-2">
              <button type="button" class="rounded-md border border-border px-3 py-2 text-sm" @click="emit('update:open', false)">
                Cancel
              </button>
              <button
                class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? 'Creating…' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { createSynonymMapping } from '@/api/metadata';
import type { SynonymMapping } from '@/types/metadata';
import { useTenantStore } from '@/stores/tenant';

interface Props {
  open: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{ 'update:open': [value: boolean]; created: [] }>();

const tenantStore = useTenantStore();
const { activeTenant } = storeToRefs(tenantStore);

const emptyForm: SynonymMapping = {
  canonical_term: '',
  aliases: [],
  entity_type: 'table',
  entity_id: '',
  brand_ref: activeTenant.value.brandRef
};

const form = reactive({ ...emptyForm });
const aliasesInput = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');

watch(
  () => props.open,
  (open) => {
    if (open) {
      Object.assign(form, { ...emptyForm, brand_ref: activeTenant.value.brandRef });
      form.entity_type = 'table';
      form.entity_id = '';
      aliasesInput.value = '';
      errorMessage.value = '';
    }
  }
);

async function submit() {
  if (!form.canonical_term.trim()) {
    errorMessage.value = 'Canonical term is required.';
    return;
  }

  try {
    isSubmitting.value = true;
    const aliases = aliasesInput.value
      .split(',')
      .map((alias) => alias.trim())
      .filter(Boolean);

    await createSynonymMapping({
      brandRef: activeTenant.value.brandRef,
      structure: activeTenant.value.structure,
      mapping: {
        canonical_term: form.canonical_term,
        aliases,
        entity_type: form.entity_type,
        entity_id: form.entity_id || undefined
      }
    });

    emit('update:open', false);
    emit('created');
  } catch (error) {
    errorMessage.value = (error as Error).message ?? 'Failed to create mapping';
  } finally {
    isSubmitting.value = false;
  }
}
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
