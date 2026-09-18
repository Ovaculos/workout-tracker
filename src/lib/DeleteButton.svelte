<script lang="ts">
  import { enhance } from '$app/forms';
  import { onMount } from 'svelte';

  import type { SubmitFunction } from '@sveltejs/kit';
  import type { FormResult } from '$lib/types';

  let { action, fields, message, label = 'Delete' }: {
    action: string;
    fields: Record<string, string>;
    message: string;
    label?: string;
  } = $props();
  let deleting = $state(false);
  let error = $state('');
  let ready = $state(false);

  onMount(() => {
    ready = true;
  });

  const submit: SubmitFunction<FormResult, FormResult> = ({ cancel }) => {
    if (deleting || !window.confirm(message)) {
      cancel();
      return;
    }
    deleting = true;
    error = '';
    return async ({ result, update }) => {
      try {
        if (result.type === 'failure') error = result.data?.error ?? '';
        await update();
      } finally {
        deleting = false;
      }
    };
  };
</script>

<form method="POST" {action} use:enhance={submit}>
  {#each Object.entries(fields) as [name, value]}
    <input type="hidden" {name} {value} />
  {/each}
  <button type="submit" aria-label={label} title={label} disabled={!ready || deleting}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />
    </svg>
  </button>
</form>
{#if error}
  <p role="alert">{error}</p>
{/if}

<style>
  form {
    display: inline;
  }

  button {
    padding: 0.35rem;
    border: 0;
    background: none;
    color: var(--muted);
    box-shadow: none;
    vertical-align: middle;
    cursor: pointer;
  }

  button:hover:not(:disabled) {
    color: var(--text);
    background: none;
    box-shadow: none;
  }
</style>
