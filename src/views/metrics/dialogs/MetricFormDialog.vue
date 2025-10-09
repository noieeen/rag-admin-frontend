<template>
  <Dialog>
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div class="w-full max-w-3xl rounded-lg border border-border bg-background p-6 shadow-lg">
        <header class="mb-4">
          <h2 class="text-lg font-semibold">{{ isEdit ? 'Edit Business Metric' : 'New Business Metric' }}</h2>
          <p class="text-sm text-muted-foreground">
            Capture core metadata, calculation logic, and relationships for the business metric.
          </p>
        </header>

        <form class="grid gap-4" @submit.prevent="submit">
          <div class="grid gap-2 md:grid-cols-2">
            <label class="flex flex-col gap-1 text-sm font-medium">
              <span>Metric Name (EN)</span>
              <input v-model="form.metric_name_en" required class="rounded-md border border-border px-3 py-2" />
            </label>
            <label class="flex flex-col gap-1 text-sm font-medium">
              <span>Metric Name (TH)</span>
              <input v-model="form.metric_name_th" class="rounded-md border border-border px-3 py-2" />
            </label>
          </div>

          <div class="grid gap-2 md:grid-cols-2">
            <label class="flex flex-col gap-1 text-sm font-medium">
              <span>Short Name</span>
              <input v-model="form.short_name" required class="rounded-md border border-border px-3 py-2" />
            </label>
            <label class="flex flex-col gap-1 text-sm font-medium">
              <span>Business Domain</span>
              <input v-model="form.business_domain" required class="rounded-md border border-border px-3 py-2" />
            </label>
          </div>

          <div class="grid gap-2">
            <label class="flex flex-col gap-1 text-sm font-medium">
              <span>Database ID</span>
              <input
                  v-model="form.database_id"
                  placeholder="Associated database UUID"
                  class="rounded-md border border-border px-3 py-2"
              />
            </label>
          </div>

          <div class="grid gap-2 md:grid-cols-2">
            <label class="flex flex-col gap-1 text-sm font-medium">
              <span>Description (EN)</span>
              <textarea v-model="form.description_en" rows="3" class="rounded-md border border-border px-3 py-2 text-sm" />
            </label>
            <label class="flex flex-col gap-1 text-sm font-medium">
              <span>Description (TH)</span>
              <textarea v-model="form.description_th" rows="3" class="rounded-md border border-border px-3 py-2 text-sm" />
            </label>
          </div>

          <div class="grid gap-2 md:grid-cols-2">
            <label class="flex flex-col gap-1 text-sm font-medium">
              <span>Calculation Logic</span>
              <textarea v-model="form.calculation_logic" rows="3" class="rounded-md border border-border px-3 py-2 text-sm" />
            </label>
            <label class="flex flex-col gap-1 text-sm font-medium">
              <span>SQL Expression</span>
              <textarea v-model="form.sql_expression" rows="3" class="rounded-md border border-border px-3 py-2 text-sm" />
            </label>
          </div>

          <div class="grid gap-2 md:grid-cols-2">
            <label class="flex flex-col gap-1 text-sm font-medium">
              <span>Aggregation Type</span>
              <input v-model="form.aggregation_type" class="rounded-md border border-border px-3 py-2" />
            </label>
            <label class="flex flex-col gap-1 text-sm font-medium">
              <span>Unit of Measure</span>
              <input v-model="form.unit_of_measure" class="rounded-md border border-border px-3 py-2" />
            </label>
          </div>

          <div class="grid gap-2 md:grid-cols-2">
            <label class="flex flex-col gap-1 text-sm font-medium">
              <span>Grain</span>
              <input v-model="form.grain" class="rounded-md border border-border px-3 py-2" />
            </label>
            <label class="flex flex-col gap-1 text-sm font-medium">
              <span>Business Owner</span>
              <input v-model="form.business_owner" class="rounded-md border border-border px-3 py-2" />
            </label>
          </div>

          <div class="grid gap-2 md:grid-cols-2">
            <label class="flex flex-col gap-1 text-sm font-medium">
              <span>Refresh Schedule</span>
              <select v-model="form.refresh_schedule" class="rounded-md border border-border px-3 py-2">
                <option value="daily">Daily</option>
                <option value="hourly">Hourly</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </label>
            <label class="flex flex-col gap-1 text-sm font-medium">
              <span>Usage Frequency</span>
              <input v-model.number="form.usage_frequency" type="number" min="0" class="rounded-md border border-border px-3 py-2" />
            </label>
          </div>

          <div class="grid gap-2 md:grid-cols-2">
            <label class="flex flex-col gap-1 text-sm font-medium">
              <span>Relevant Table IDs</span>
              <input v-model="form.relevant_table_ids" placeholder="Comma separated UUIDs" class="rounded-md border border-border px-3 py-2" />
            </label>
            <label class="flex flex-col gap-1 text-sm font-medium">
              <span>Relevant Column IDs</span>
              <input v-model="form.relevant_column_ids" placeholder="Comma separated UUIDs" class="rounded-md border border-border px-3 py-2" />
            </label>
          </div>

          <div class="grid gap-2 md:grid-cols-2">
            <label class="flex flex-col gap-1 text-sm font-medium">
              <span>Related Metric IDs</span>
              <input v-model="form.related_metrics" placeholder="Comma separated IDs" class="rounded-md border border-border px-3 py-2" />
            </label>
            <label class="flex flex-col gap-1 text-sm font-medium">
              <span>Tags</span>
              <input v-model="form.tags" placeholder="Comma separated tags" class="rounded-md border border-border px-3 py-2" />
            </label>
          </div>

          <div class="grid gap-2">
            <label class="flex flex-col gap-1 text-sm font-medium">
              <span>Common Filters</span>
              <textarea v-model="form.common_filters" rows="2" placeholder="Comma separated filters" class="rounded-md border border-border px-3 py-2 text-sm" />
            </label>
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
              {{ isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Metric' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch, computed } from 'vue';
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
  metric?: BusinessMetricMetadata | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ 'update:open': [value: boolean]; saved: [] }>();

const tenantStore = useTenantStore();
const { activeTenant } = storeToRefs(tenantStore);

const isSubmitting = ref(false);
const errorMessage = ref('');

const defaultForm = () => ({
  database_id: '',
  metric_name_en: '',
  metric_name_th: '',
  short_name: '',
  description_en: '',
  description_th: '',
  business_domain: '',
  calculation_logic: '',
  sql_expression: '',
  aggregation_type: '',
  unit_of_measure: '',
  grain: '',
  business_owner: '',
  refresh_schedule: 'daily',
  usage_frequency: 0,
  relevant_table_ids: '',
  relevant_column_ids: '',
  related_metrics: '',
  tags: '',
  common_filters: ''
});

const form = reactive(defaultForm());

const isEdit = computed(() => Boolean(props.metric));

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    if (props.metric) {
      const metric = props.metric;
      Object.assign(form, defaultForm(), {
        database_id: metric.database_id ?? '',
        metric_name_en: metric.metric_name?.en ?? '',
        metric_name_th: metric.metric_name?.th ?? '',
        short_name: metric.short_name ?? '',
        description_en: metric.description?.en ?? '',
        description_th: metric.description?.th ?? '',
        business_domain: metric.business_domain ?? '',
        calculation_logic: metric.calculation_logic ?? '',
        sql_expression: metric.sql_expression ?? '',
        aggregation_type: metric.aggregation_type ?? '',
        unit_of_measure: metric.unit_of_measure ?? '',
        grain: metric.grain ?? '',
        business_owner: metric.business_owner ?? '',
        refresh_schedule: metric.refresh_schedule ?? 'daily',
        usage_frequency: metric.usage_frequency ?? 0,
        relevant_table_ids: metric.relevant_table_ids?.join(', ') ?? '',
        relevant_column_ids: metric.relevant_column_ids?.join(', ') ?? '',
        related_metrics: metric.related_metrics?.join(', ') ?? '',
        tags: metric.tags?.join(', ') ?? '',
        common_filters: metric.common_filters?.join(', ') ?? ''
      });
    } else {
      Object.assign(form, defaultForm());
    }
    errorMessage.value = '';
  }
);

async function submit() {
  if (!form.metric_name_en.trim()) {
    errorMessage.value = 'Metric name (EN) is required.';
    return;
  }
  if (!form.short_name.trim()) {
    errorMessage.value = 'Short name is required.';
    return;
  }

  try {
    isSubmitting.value = true;
    const payload = buildMetricPayload();

    if (isEdit.value && props.metric) {
      await updateBusinessMetric(props.metric.metric_id, payload);
    } else {
      await createBusinessMetric(payload);
    }

    emit('update:open', false);
    emit('saved');
  } catch (error) {
    errorMessage.value = (error as Error).message ?? 'Failed to save metric';
  } finally {
    isSubmitting.value = false;
  }
}

function buildMetricPayload() {
  const parseList = (value: string) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  return {
    brandRef: activeTenant.value.brandRef,
    structure: activeTenant.value.structure,
    metric: {
      type: 'business_metric',
      database_id: form.database_id,
      metric_name: {
        en: form.metric_name_en,
        th: form.metric_name_th
      },
      short_name: form.short_name,
      description: {
        en: form.description_en,
        th: form.description_th
      },
      business_domain: form.business_domain,
      calculation_logic: form.calculation_logic,
      sql_expression: form.sql_expression,
      relevant_table_ids: parseList(form.relevant_table_ids),
      relevant_column_ids: parseList(form.relevant_column_ids),
      unit_of_measure: form.unit_of_measure,
      aggregation_type: form.aggregation_type,
      grain: form.grain,
      business_owner: form.business_owner,
      refresh_schedule: form.refresh_schedule,
      typical_range: props.metric?.typical_range ?? undefined,
      related_metrics: parseList(form.related_metrics),
      common_filters: parseList(form.common_filters),
      tags: parseList(form.tags),
      usage_frequency: form.usage_frequency,
      last_queried: props.metric?.last_queried ?? undefined
    }
  } as any;
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
