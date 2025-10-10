<template>
  <section class="space-y-6">
    <header class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">Templates</h1>
          <p class="text-sm text-muted-foreground">Reusable query templates with metadata and approval status.</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="rounded-md border border-border px-3 py-2 text-sm" :disabled="templates.length === 0" @click="exportTemplates">
            Export JSON
          </button>
          <button class="rounded-md border border-border px-3 py-2 text-sm" @click="isImportOpen = true">
            Import JSON
          </button>
          <button class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90" @click="openCreate()">
            New Template
          </button>
        </div>
      </div>
    </header>

    <div v-if="query.isLoading.value" class="rounded-lg border border-border p-6 text-center text-muted-foreground">
      Loading templates...
    </div>

    <div v-else class="grid gap-4 lg:grid-cols-2">
      <Card v-for="template in templates" :key="template.query_template_id" class="flex flex-col">
        <CardHeader>
          <CardTitle>{{ template.natural_language_question?.en ?? 'Untitled Template' }}</CardTitle>
          <CardDescription>{{ template.tags?.slice(0, 3).join(', ') ?? 'No tags' }}</CardDescription>
        </CardHeader>
        <CardContent class="space-y-2 text-sm text-muted-foreground">
          <p class="font-mono text-xs text-foreground/80">{{ template.sql_statement }}</p>
          <p class="text-xs text-muted-foreground">Complexity: {{ template.query_complexity ?? '—' }}</p>
        </CardContent>
        <CardContent class="mt-auto flex items-center justify-end gap-2 border-t border-border pt-4 text-sm">
          <button class="rounded-md border border-border px-3 py-2 text-muted-foreground hover:bg-muted" @click="openEdit(template)">
            Edit
          </button>
          <button
            class="rounded-md border border-border px-3 py-2 text-destructive hover:bg-destructive/10"
            :disabled="isDeleting === template.query_template_id"
            @click="removeTemplate(template)"
          >
            {{ isDeleting === template.query_template_id ? 'Removing…' : 'Delete' }}
          </button>
        </CardContent>
      </Card>
      <Card v-if="templates.length === 0">
        <CardContent class="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No templates available.
        </CardContent>
      </Card>
    </div>

    <TemplateFormDialog v-model:open="isDialogOpen" :template="activeTemplate" @saved="onSaved" />
    <TemplateImportDialog v-model:open="isImportOpen" @imported="onImported" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';


import {Card,CardHeader,CardContent,CardDescription,CardTitle} from '@/components/ui/card';

import { useTemplates } from '@/composables/useMetadataQueries';
import type { QueryTemplateMetadata } from '@/types/metadata';
import { deleteQueryTemplate } from '@/api/metadata';
import TemplateFormDialog from './dialogs/TemplateFormDialog.vue';
import TemplateImportDialog from './dialogs/TemplateImportDialog.vue';
import { downloadJson } from '@/utils/download';

const query = useTemplates();
const templates = computed(() => query.data.value ?? []);
const isDialogOpen = ref(false);
const isImportOpen = ref(false);
const activeTemplate = ref<QueryTemplateMetadata | null>(null);
const isDeleting = ref<string | null>(null);

function openCreate() {
  activeTemplate.value = null;
  isDialogOpen.value = true;
}

function openEdit(template: QueryTemplateMetadata) {
  activeTemplate.value = template;
  isDialogOpen.value = true;
}

async function removeTemplate(template: QueryTemplateMetadata) {
  if (!template.query_template_id || isDeleting.value) return;
  const confirmed = window.confirm(`Delete template "${template.natural_language_question?.en ?? template.query_template_id}"?`);
  if (!confirmed) return;

  try {
    isDeleting.value = template.query_template_id;
    await deleteQueryTemplate(template.query_template_id);
    await query.refetch();
  } catch (error) {
    alert((error as Error).message ?? 'Failed to delete template');
  } finally {
    isDeleting.value = null;
  }
}

async function onSaved() {
  isDialogOpen.value = false;
  activeTemplate.value = null;
  await query.refetch();
}

async function onImported() {
  isImportOpen.value = false;
  await query.refetch();
}

function exportTemplates() {
  if (!templates.value.length) return;
  const filename = `query-templates-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  downloadJson(filename, templates.value);
}
</script>
