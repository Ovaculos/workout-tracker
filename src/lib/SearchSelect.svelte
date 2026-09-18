<script>
  import { tick } from 'svelte';
  import { displayName } from '$lib/names.js';

  let { name, label, options, value = $bindable(''), onselect } = $props();
  let input = $state();
  let query = $state('');
  let expanded = $state(false);
  let active = $state(0);
  let matches = $derived(options.filter((option) => option.name.toLowerCase().includes(query.trim().toLowerCase())));

  $effect(() => {
    input?.setCustomValidity(value ? '' : 'Select an option from the list.');
  });

  export function focus() {
    input.focus();
    input.select();
  }

  function show() {
    active = Math.max(0, matches.findIndex((option) => option.name === value));
    expanded = true;
  }

  function choose(option) {
    value = option.name;
    query = '';
    expanded = false;
    onselect?.(option.name);
  }

  async function keydown(event) {
    if (event.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!expanded) show();
      else if (matches.length) active = (active + (event.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length;
      await tick();
      document.getElementById(`${name}-option-${active}`)?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (matches[active]) choose(matches[active]);
    } else if (event.key === 'Escape') {
      expanded = false;
    }
  }
</script>

<div>
  <label for={`${name}-search`}>{label}</label>
  <input type="hidden" {name} {value} />
  <div class="search">
    <input
      bind:this={input}
      id={`${name}-search`}
      value={value || query}
      role="combobox"
      aria-autocomplete="list"
      aria-expanded={expanded}
      aria-controls={`${name}-options`}
      aria-activedescendant={expanded && matches[active] ? `${name}-option-${active}` : undefined}
      autocomplete="off"
      required
      onfocus={show}
      onblur={() => expanded = false}
      oninput={(event) => {
        query = event.currentTarget.value;
        value = '';
        active = 0;
        expanded = true;
      }}
      onkeydown={keydown}
    />
    <div id={`${name}-options`} role="listbox" aria-label={label} hidden={!expanded}>
      {#each matches as option, index}
        <button
          id={`${name}-option-${index}`}
          type="button"
          role="option"
          title={option.name}
          aria-selected={index === active}
          tabindex="-1"
          onpointerdown={(event) => event.preventDefault()}
          onpointermove={() => active = index}
          onclick={() => choose(option)}
        >
          {#if option.picture}
            <img src={option.picture} alt="" width="64" height="64" style="object-fit: cover; vertical-align: middle" />
          {/if}
          {displayName(option.name)}
        </button>
      {:else}
        <p role="status">No matches.</p>
      {/each}
    </div>
  </div>
</div>

<style>
  .search {
    position: relative;
    display: inline-block;
  }

  [role='listbox'] {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1;
    min-width: 100%;
    max-height: 16rem;
    overflow-y: auto;
    background: Canvas;
    color: CanvasText;
  }

  [role='option'] {
    display: block;
    width: 100%;
    text-align: left;
  }

  [aria-selected='true'] {
    background: Highlight;
    color: HighlightText;
  }
</style>
