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

    <div class="grid gap-4 lg:grid-cols-2">
      <Card v-for="n in 4" :key="n">
        <CardHeader>
          <CardTitle>What is today sales?</CardTitle>
          <CardDescription>Updated 5 minutes ago</CardDescription>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground">
            SELECT COALESCE(SUM(Total), 0) AS Today_Sales FROM [dbo].[BP_Order]...
          </p>
        </CardContent>
      </Card>
    </div>
  </section>
</template>

<script setup lang="ts">
import Card from '@/components/ui/Card.vue';
import CardHeader from '@/components/ui/CardHeader.vue';
import CardContent from '@/components/ui/CardContent.vue';
import CardTitle from '@/components/ui/CardTitle.vue';
import CardDescription from '@/components/ui/CardDescription.vue';
</script>
