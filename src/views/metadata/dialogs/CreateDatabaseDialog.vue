<template>
  <Dialog :open="open" @update:open="emit('update:open', false)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Create Database Metadata</DialogTitle>
        <DialogDescription>
          Provide the information required to register a new database.
        </DialogDescription>
      </DialogHeader>
      <Form class="space-y-4" @submit.prevent="submit">
        <div class="grid gap-2">
          <label class="text-sm font-medium">Database Name</label>
          <Input v-model="form.database_name" required class="rounded-md border border-border px-3 py-2"/>
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium">Dialect</label>
          <select v-model="form.dialect" class="rounded-md border border-border px-3 py-2">
            <option value="SQLServer">SQL Server</option>
            <option value="PostgreSQL">PostgreSQL</option>
            <option value="BigQuery">BigQuery</option>
          </select>
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium">Display Name (EN)</label>
          <Input v-model="form.display_name.en" required class="rounded-md border border-border px-3 py-2"/>
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium">Display Name (TH)</label>
          <Input v-model="form.display_name.th" class="rounded-md border border-border px-3 py-2"/>
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium">Description (EN)</label>
          <textarea v-model="form.description.en" rows="3" class="rounded-md border border-border px-3 py-2 text-sm"/>
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium">Description (TH)</label>
          <textarea v-model="form.description.th" rows="3" class="rounded-md border border-border px-3 py-2 text-sm"/>
        </div>

        <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>

        <div class="flex justify-end gap-2">
          <button type="button" class="rounded-md border border-border px-3 py-2 text-sm"
                  @click="emit('update:open', false)">
            Cancel
          </button>
          <button
              class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Creating…' : 'Create' }}
          </button>
        </div>
      </Form>

      <DialogFooter>
        <Button>
          Footer
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {reactive, ref, watch} from 'vue';
import {storeToRefs} from 'pinia';

import {createDatabase} from '@/api/metadata';
import type {DatabaseMetadata} from '@/types/metadata';
import {useTenantStore} from '@/stores/tenant';
import {useDatabases} from '@/composables/useMetadataQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {Input} from "@/components/ui/input"

interface Props {
  open: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{ 'update:open': [value: boolean] }>();

const tenantStore = useTenantStore();
const {activeTenant} = storeToRefs(tenantStore);
const databasesQuery = useDatabases();

const emptyForm: DatabaseMetadata = {
  database_id: crypto.randomUUID(),
  type: 'database',
  database_name: '',
  display_name: {en: '', th: ''},
  description: {en: '', th: ''},
  dialect: 'SQLServer'
};

const form = reactive({...emptyForm});
const isSubmitting = ref(false);
const errorMessage = ref('');

watch(
    () => props.open,
    (open) => {
      if (open) {
        Object.assign(form, {...emptyForm, database_id: crypto.randomUUID()});
        errorMessage.value = '';
      }
    }
);

async function submit() {
  try {
    isSubmitting.value = true;
    await createDatabase({
      brandRef: activeTenant.value.brandRef,
      structure: activeTenant.value.structure,
      database: form
    });
    await databasesQuery.refetch();
    emit('update:open', false);
  } catch (error) {
    errorMessage.value = (error as Error).message ?? 'Failed to create database';
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
