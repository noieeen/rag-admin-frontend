<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div class="w-full max-w-3xl rounded-lg border border-border bg-background p-6 shadow-lg">
          <header class="mb-4 space-y-1">
            <h2 class="text-lg font-semibold">{{ isEdit ? 'Edit Query Template' : 'New Query Template' }}</h2>
            <p class="text-sm text-muted-foreground">
              Capture the natural language question, SQL statement, and related metadata for the template.
            </p>
          </header>

          <form class="grid gap-4" @submit.prevent="submit">
            <div class="grid gap-2 md:grid-cols-2">
              <label class="flex flex-col gap-1 text-sm font-medium">
                <span>Question (EN)</span>
                <input v-model="form.question_en" required class="rounded-md border border-border px-3 py-2" />
              </label>
              <label class="flex flex-col gap-1 text-sm font-medium">
                <span>Question (TH)</span>
                <input v-model="form.question_th" class="rounded-md border border-border px-3 py-2" />
              </label>
            </div>

            <label class="flex flex-col gap-1 text-sm font-medium">
              <span>SQL Statement</span>
              <textarea v-model="form.sql_statement" rows="6" required class="rounded-md border border-border px-3 py-2 font-mono text-sm" />
            </label>

            <div class="grid gap-2 md:grid-cols-2">
              <label class="flex flex-col gap-1 text-sm font-medium">
                <span>Database ID</span>
                <input v-model="form.database_id" class="rounded-md border border-border px-3 py-2" placeholder="Optional" />
              </label>
              <label class="flex flex-col gap-1 text-sm font-medium">
                <span>Query Complexity</span>
                <select v-model="form.query_complexity" class="rounded-md border border-border px-3 py-2">
                  <option value="SIMPLE">Simple</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="COMPLEX">Complex</option>
                </select>
              </label>
            </div>

            <div class="grid gap-2 md:grid-cols-2">
              <label class="flex flex-col gap-1 text-sm font-medium">
                <span>Relevant Table IDs</span>
                <input v-model="form.relevant_table_ids" class="rounded-md border border-border px-3 py-2" placeholder="Comma separated" />
              </label>
              <label class="flex flex-col gap-1 text-sm font-medium">
                <span>Relevant Column IDs</span>
                <input v-model="form.relevant_column_ids" class="rounded-md border border-border px-3 py-2" placeholder="Comma separated" />
              </label>
            </div>

            <div class="grid gap-2 md:grid-cols-2">
              <label class="flex flex-col gap-1 text-sm font-medium">
                <span>Relevant Relationship IDs</span>
                <input v-model="form.relevant_relationship_ids" class="rounded-md border border-border px-3 py-2" placeholder="Comma separated" />
              </label>
              <label class="flex flex-col gap-1 text-sm font-medium">
                <span>Tags</span>
                <input v-model="form.tags" class="rounded-md border border-border px-3 py-2" placeholder="Comma separated" />
              </label>
            </div>

            <div class="grid gap-2 md:grid-cols-2">
              <label class="flex flex-col gap-1 text-sm font-medium">
                <span>Performance Notes</span>
                <textarea v-model="form.performance_notes" rows="2" class="rounded-md border border-border px-3 py-2 text-sm" />
              </label>
              <label class="flex flex-col gap-1 text-sm font-medium">
                <span>Estimated Rows Returned</span>
                <input v-model.number="form.estimated_rows_returned" type="number" min="0" class="rounded-md border border-border px-3 py-2" />
              </label>
            </div>

            <label class="flex flex-col gap-1 text-sm font-medium">
              <span>Usage Frequency</span>
              <input v-model.number="form.usage_frequency" type="number" min="0" class="w-full rounded-md border border-border px-3 py-2" />
            </label>

            <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>

            <div class="flex justify-end gap-2">
              <button type="button" class="rounded-md border border-border px-3 py-2 text-sm" @click="emit('update:open', false)">
                Cancel
              </button>
              <button
                class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Template' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { createQueryTemplate, updateQueryTemplate } from '@/api/metadata';
import type { QueryTemplateMetadata } from '@/types/metadata';
import { useTenantStore } from '@/stores/tenant';

interface Props {
  open: boolean;
  template?: QueryTemplateMetadata | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ 'update:open': [value: boolean]; saved: [] }>();

const tenantStore = useTenantStore();
const { activeTenant } = storeToRefs(tenantStore);

const isSubmitting = ref(false);
const errorMessage = ref('');

const defaultForm = () => ({
  database_id: '',
  question_en: '',
  question_th: '',
  sql_statement: '',
  relevant_table_ids: '',
  relevant_column_ids: '',
  relevant_relationship_ids: '',
  tags: '',
  performance_notes: '',
  query_complexity: 'SIMPLE',
  estimated_rows_returned: undefined as number | undefined,
  usage_frequency: 0
});

const form = reactive(defaultForm());
const isEdit = computed(() => Boolean(props.template));

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    if (props.template) {
      const tpl = props.template;
      Object.assign(form, defaultForm(), {
        database_id: tpl.database_id ?? '',
        question_en: tpl.natural_language_question?.en ?? '',
        question_th: tpl.natural_language_question?.th ?? '',
        sql_statement: tpl.sql_statement ?? '',
        relevant_table_ids: tpl.relevant_table_ids?.join(', ') ?? '',
        relevant_column_ids: tpl.relevant_column_ids?.join(', ') ?? '',
        relevant_relationship_ids: tpl.relevant_relationship_ids?.join(', ') ?? '',
        tags: tpl.tags?.join(', ') ?? '',
        performance_notes: tpl.performance_notes ?? '',
        query_complexity: tpl.query_complexity ?? 'SIMPLE',
        estimated_rows_returned: tpl.estimated_rows_returned,
        usage_frequency: tpl.usage_frequency ?? 0
      });
    } else {
      Object.assign(form, defaultForm());
    }
    errorMessage.value = '';
  }
);

async function submit() {
  if (!form.question_en.trim()) {
    errorMessage.value = 'Question (EN) is required.';
    return;
  }
  if (!form.sql_statement.trim()) {
    errorMessage.value = 'SQL statement is required.';
    return;
  }

  try {
    isSubmitting.value = true;
    const payload = buildPayload();

    if (isEdit.value && props.template) {
      await updateQueryTemplate(props.template.query_template_id, payload);
    } else {
      await createQueryTemplate(payload);
    }

    emit('update:open', false);
    emit('saved');
  } catch (error) {
    errorMessage.value = (error as Error).message ?? 'Failed to save template';
  } finally {
    isSubmitting.value = false;
  }
}

function buildPayload() {
  const parseList = (value: string) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  return {
    brandRef: activeTenant.value.brandRef,
    structure: activeTenant.value.structure,
    template: {
      type: 'query_template',
      query_template_id: props.template?.query_template_id,
      database_id: form.database_id || undefined,
      natural_language_question: {
        en: form.question_en,
        th: form.question_th
      },
      sql_statement: form.sql_statement,
      relevant_table_ids: parseList(form.relevant_table_ids),
      relevant_column_ids: parseList(form.relevant_column_ids),
      relevant_relationship_ids: parseList(form.relevant_relationship_ids),
      tags: parseList(form.tags),
      query_complexity: form.query_complexity,
      performance_notes: form.performance_notes || undefined,
      estimated_rows_returned: form.estimated_rows_returned ?? undefined,
      usage_frequency: form.usage_frequency
    }
  };
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
