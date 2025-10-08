<template>
  <div
    ref="rootEl"
    v-if="rendered"
    :class="['prose prose-sm max-w-none text-foreground prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:bg-muted/70', attrs.class]"
    v-html="rendered"
  />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useAttrs } from 'vue';
import MarkdownIt from 'markdown-it';

defineOptions({ inheritAttrs: false });

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  highlight(code, lang) {
    const language = (lang ?? '').trim().toLowerCase() || 'text';
    const label = language === 'text' ? 'CODE' : language.toUpperCase();
    const escaped = markdown.utils.escapeHtml(code);
    const encoded = encodeURIComponent(code);

    return `
      <div class="code-block overflow-hidden rounded-2xl border border-border bg-muted/40 ">
        <div class="flex items-center justify-between border-b border-border bg-muted/60 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
          <span>${label}</span>
          <button
            type="button"
            class="copy-button rounded-md border border-border bg-background px-2 py-1 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground transition hover:bg-muted data-[state=copied]:text-primary"
            data-code="${encoded}"
          >
            Copy
          </button>
        </div>
        <pre class="max-h-96 overflow-x-auto overflow-y-auto px-4 py-3 text-xs leading-relaxed">
<code class="language-${language}">${escaped}</code>
        </pre>
      </div>
    `;
  }
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
const rootEl = ref<HTMLElement | null>(null);

const rendered = computed(() => {
  const value = props.source ?? '';
  if (!value.trim()) return '';
  return props.inline ? markdown.renderInline(value) : markdown.render(value);
});

function handleClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null;
  if (!target) return;
  const button = target.closest<HTMLButtonElement>('button.copy-button');
  if (!button) return;
  const encoded = button.getAttribute('data-code');
  if (!encoded) return;
  const decoded = decodeURIComponent(encoded);

  if (!navigator.clipboard) {
    button.textContent = 'Unavailable';
    setTimeout(() => {
      button.textContent = 'Copy';
    }, 1500);
    return;
  }

  navigator.clipboard
    .writeText(decoded)
    .then(() => {
      button.dataset.state = 'copied';
      button.textContent = 'Copied';
      setTimeout(() => {
        delete button.dataset.state;
        button.textContent = 'Copy';
      }, 1500);
    })
    .catch(() => {
      button.textContent = 'Failed';
      setTimeout(() => {
        button.textContent = 'Copy';
      }, 1500);
    });
}

onMounted(() => {
  rootEl.value?.addEventListener('click', handleClick);
});

onBeforeUnmount(() => {
  rootEl.value?.removeEventListener('click', handleClick);
});
</script>
