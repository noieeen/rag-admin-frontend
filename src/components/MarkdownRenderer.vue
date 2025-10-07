<template>
  <div
    v-if="rendered"
    :class="['prose prose-sm max-w-none text-foreground prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:bg-muted/70', attrs.class]"
    v-html="rendered"
  />
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import MarkdownIt from 'markdown-it';

defineOptions({ inheritAttrs: false });

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true
});

const props = withDefaults(
  defineProps<{
    source: string | null | undefined;
    inline?: boolean;
  }>(),
  {
    source: '',
    inline: false
  }
);

const attrs = useAttrs();

const rendered = computed(() => {
  const value = props.source ?? '';
  if (!value.trim()) return '';
  return props.inline ? markdown.renderInline(value) : markdown.render(value);
});
</script>
