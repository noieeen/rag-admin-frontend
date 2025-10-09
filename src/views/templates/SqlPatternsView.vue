<template>
  <section class="grid gap-6 lg:grid-cols-[2fr,3fr]">
    <Card>
      <CardHeader>
        <CardTitle>Add SQL Pattern</CardTitle>
        <CardDescription>Create reusable SQL query pattern</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <label class="text-xs uppercase text-muted-foreground">Natural Language Question (EN)</label>
          <textarea rows="3" class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"></textarea>
        </div>
        <div class="space-y-2">
          <label class="text-xs uppercase text-muted-foreground">Natural Language Question (TH)</label>
          <textarea rows="3" class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"></textarea>
        </div>
        <div class="space-y-2">
          <label class="text-xs uppercase text-muted-foreground">SQL Statement</label>
          <textarea rows="6" class="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm"></textarea>
        </div>
        <div class="flex justify-end gap-2">
          <button class="rounded-md border border-border px-3 py-2 text-sm">AI Generate</button>
          <button class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Add Pattern
          </button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>SQL Patterns</CardTitle>
        <CardDescription>Saved query patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <ul class="space-y-4">
          <li v-for="n in 4" :key="n" class="rounded-md border border-border p-4">
            <p class="font-medium">What is today sales?</p>
            <p class="text-sm text-muted-foreground">วันนี้ยอดขายเท่าไหร่?</p>
            <p class="mt-2 font-mono text-xs text-muted-foreground">SELECT ...</p>
            <div class="mt-3 flex gap-2 text-xs text-muted-foreground">
              <button class="rounded-md border border-border px-2 py-1">Copy</button>
              <button class="rounded-md border border-border px-2 py-1">Edit</button>
              <button class="rounded-md border border-border px-2 py-1 text-destructive">Delete</button>
            </div>
          </li>
        </ul>
      </CardContent>
    </Card>
  </section>
</template>

<script setup lang="ts">
import {Card, CardHeader, CardContent, CardTitle, CardDescription} from '@/components/ui/card';

</script>
