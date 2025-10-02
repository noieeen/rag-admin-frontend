<template>
  <section class="space-y-6">
    <header class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">Databases</h1>
          <p class="text-sm text-muted-foreground">Manage registered databases and their metadata.</p>
        </div>
        <button class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          New Database
        </button>
      </div>
      <div class="flex flex-wrap gap-2 text-sm">
        <input
          class="w-full rounded-md border border-border bg-background px-3 py-2 md:w-72"
          placeholder="Search databases"
          type="search"
        />
        <button class="rounded-md border border-border px-3 py-2">Filters</button>
      </div>
    </header>

    <div class="overflow-hidden rounded-lg border border-border">
      <table class="min-w-full divide-y divide-border text-sm">
        <thead class="bg-muted/40 text-left">
          <tr>
            <th class="px-4 py-3 font-medium">Name</th>
            <th class="px-4 py-3 font-medium">Dialect</th>
            <th class="px-4 py-3 font-medium">Tags</th>
            <th class="px-4 py-3 font-medium">Updated</th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-border hover:bg-muted/40" v-for="n in 3" :key="n">
            <td class="px-4 py-3 font-medium">—</td>
            <td class="px-4 py-3 text-muted-foreground">—</td>
            <td class="px-4 py-3 text-muted-foreground">—</td>
            <td class="px-4 py-3 text-muted-foreground">—</td>
            <td class="px-4 py-3 text-right text-muted-foreground">
              <button class="rounded-md border border-border px-2 py-1">Details</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
// Data wiring will be added once API layer is ready.
</script>
