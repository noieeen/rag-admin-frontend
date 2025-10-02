<template>
  <section class="space-y-6">
    <header class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">Relations</h1>
          <p class="text-sm text-muted-foreground">Visualize joins and dependencies between tables.</p>
        </div>
        <button class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          Add Relation
        </button>
      </div>
    </header>

    <Card>
      <CardContent>
        <div v-if="query.isLoading.value" class="flex h-64 items-center justify-center text-sm text-muted-foreground">
          Loading relationships...
        </div>
        <div v-else-if="relationships.length === 0" class="flex h-64 items-center justify-center text-sm text-muted-foreground">
          No relationships documented yet.
        </div>
        <ul v-else class="space-y-3">
          <li
            v-for="relationship in relationships"
            :key="relationship.relationship_id"
            class="rounded-md border border-border p-4"
          >
            <p class="font-medium">{{ relationship.from_table_id }} → {{ relationship.to_table_id }}</p>
            <p class="text-sm text-muted-foreground">{{ relationship.join_type ?? 'join' }} · {{ relationship.type }}</p>
          </li>
        </ul>
      </CardContent>
    </Card>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import Card from '@/components/ui/Card.vue';
import CardContent from '@/components/ui/CardContent.vue';
import { useRelationships } from '@/composables/useMetadataQueries';

const query = useRelationships();
const relationships = computed(() => query.data.value ?? []);
</script>
