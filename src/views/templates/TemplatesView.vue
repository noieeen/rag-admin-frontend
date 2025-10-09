<template>
  <section class="space-y-6">
    <header class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">Templates</h1>
          <p class="text-sm text-muted-foreground">Reusable query templates with metadata and approval status.</p>
        </div>
        <button class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          New Template
        </button>
      </div>
    </header>

    <div v-if="query.isLoading.value" class="rounded-lg border border-border p-6 text-center text-muted-foreground">
      Loading templates...
    </div>

    <div v-else class="grid gap-4 lg:grid-cols-2">
      <Card v-for="template in templates" :key="template.query_template_id">
        <CardHeader>
          <CardTitle>{{ template.natural_language_question_en }}</CardTitle>
          <CardDescription>{{ template.tags?.slice(0, 3).join(', ') ?? 'No tags' }}</CardDescription>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground">
            {{ template.sql_statement }}
          </p>
        </CardContent>
      </Card>
      <Card v-if="templates.length === 0">
        <CardContent class="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No templates available.
        </CardContent>
      </Card>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import {Card, CardHeader, CardContent, CardTitle, CardDescription} from '@/components/ui/card';

import { useTemplates } from '@/composables/useMetadataQueries';

const query = useTemplates();
const templates = computed(() => query.data.value ?? []);
</script>
