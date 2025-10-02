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
        <div class="flex h-64 items-center justify-center text-sm text-muted-foreground">
          Relationship graph placeholder
        </div>
      </CardContent>
    </Card>
  </section>
</template>

<script setup lang="ts">
import Card from '@/components/ui/Card.vue';
import CardContent from '@/components/ui/CardContent.vue';
</script>
