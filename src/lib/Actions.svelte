<script lang="ts">
  import { enhance } from '$app/forms';
  import { tick } from 'svelte';
  import SearchSelect from '$lib/SearchSelect.svelte';

  import type { SubmitFunction } from '@sveltejs/kit';
  import type { ActionMode, FormResult, WorkoutOptions } from '$lib/types';

  let { data, dashboard = false, person = '', workout = '' }: {
    data: WorkoutOptions;
    dashboard?: boolean;
    person?: string;
    workout?: string;
  } = $props();
  let form = $state<FormResult | null>(null);
  let dialog = $state<HTMLDialogElement>();
  let dialogVersion = $state(0);
  let mode = $state<ActionMode | ''>('');
  let fieldType = $state('number');
  let workoutName = $state('');
  let personName = $state('');
  let workoutSearch = $state<{ focus: () => void }>();
  let valueInput = $state<HTMLInputElement>();
  let submitting = $state(false);
  let rememberedWorkout = '';
  let selectedWorkout = $derived(data.workoutTypes.find((workout) => workout.name === workoutName));
  let peopleOptions = $derived(data.people.map((name) => ({
    name,
    picture: data.pictureVersions[name] === null ? null : `/people/${encodeURIComponent(name)}/picture?v=${data.pictureVersions[name]}`
  })));

  export async function open(nextMode: ActionMode) {
    if (submitting) return;
    mode = nextMode;
    form = null;
    fieldType = 'number';
    personName = data.people.includes(person) ? person : '';
    try {
      rememberedWorkout = sessionStorage.getItem('lastWorkout') ?? rememberedWorkout;
    } catch {}
    const nextWorkout = workout || (dashboard ? rememberedWorkout : '');
    workoutName = data.workoutTypes.some((type) => type.name === nextWorkout) ? nextWorkout : '';
    dialogVersion += 1;
    await tick();
    if (dialog && !dialog.open) dialog.showModal();
    if (nextMode === 'workout' && personName && workoutSearch) {
      if (selectedWorkout) valueInput?.focus();
      else workoutSearch?.focus();
    }
  }

  function shortcut(event: KeyboardEvent) {
    if (!dashboard && !person && !workout) return;
    if (dialog?.open || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.repeat || event.isComposing) return;
    if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable]')) return;
    if (event.key === ' ' && event.target instanceof HTMLElement && event.target.closest('button, a')) return;
    const key = event.key.toLowerCase();
    const nextMode = key === ' ' ? 'workout' : dashboard && key === 'n' ? 'person' : dashboard && key === 'l' ? 'type' : undefined;
    if (nextMode) {
      event.preventDefault();
      open(nextMode);
    }
  }

  function dismiss(event: KeyboardEvent) {
    if (event.key !== 'Escape' || event.isComposing) return;
    event.preventDefault();
    event.stopPropagation();
    if (!event.repeat && !submitting) dialog?.close();
  }

  const submit: SubmitFunction<FormResult, FormResult> = ({ formData, cancel }) => {
    if (mode === 'workout' && (!data.people.includes(personName) || !selectedWorkout)) {
      cancel();
      form = { error: 'Select a person and a workout type.' };
      return;
    }
    const loggedWorkout = formData.get('workoutName');
    submitting = true;
    return async ({ result, update }) => {
      try {
        await update();
        if (result.type === 'failure') form = result.data ?? null;
        if (result.type === 'success') {
          if (typeof loggedWorkout === 'string') {
            rememberedWorkout = loggedWorkout;
            try {
              sessionStorage.setItem('lastWorkout', loggedWorkout);
            } catch {}
          }
          dialog?.close();
        }
      } finally {
        submitting = false;
      }
    };
  };
</script>

<svelte:window onkeydown={shortcut} />

<footer class="bottom-actions">
  {#if dashboard}
    <button class="shortcut-button" aria-label="Add workout type" aria-keyshortcuts="L" onclick={() => open('type')}>
      <kbd>L</kbd><span>Add workout type</span>
    </button>
  {:else}
    <a class="shortcut-button" href="/" aria-label="Dashboard" aria-keyshortcuts="Escape">
      <kbd>Esc</kbd><span>Dashboard</span>
    </a>
  {/if}
  <button class="shortcut-button" aria-label="Log workout" aria-keyshortcuts="Space" onclick={() => open('workout')}>
    <kbd>Space</kbd><span>Log workout</span>
  </button>
</footer>

<dialog bind:this={dialog} aria-labelledby="dialog-title" onkeydowncapture={dismiss} style="overflow: visible">
  {#key dialogVersion}
    {#if mode === 'person'}
      <h2 id="dialog-title">Add person</h2>
      <form method="POST" action="/?/addPerson" use:enhance={submit}>
        <label>Name <input name="name" required /></label>
        <button disabled={submitting}>Add person</button>
      </form>
    {:else if mode === 'type'}
      <h2 id="dialog-title">Add workout type</h2>
      <form method="POST" action="/?/addWorkoutType" use:enhance={submit}>
        <p><label>Name <input name="name" required /></label></p>
        <p><label>Field description <input name="description" required /></label></p>
        <p>
          <label>
            Field type
            <select name="type" bind:value={fieldType}>
              <option value="number">Number</option>
              <option value="string">String</option>
            </select>
          </label>
        </p>
        {#if fieldType === 'number'}
          <p>
            <label>
              PR ranking
              <select name="ranking">
                <option value="higher">Higher is better</option>
                <option value="lower">Lower is better</option>
              </select>
            </label>
          </p>
        {:else}
          <p>String values are logged without PR ranking.</p>
        {/if}
        <button disabled={submitting}>Add workout type</button>
      </form>
    {:else if mode === 'workout'}
      <h2 id="dialog-title">Log workout</h2>
      {#if data.people.length && data.workoutTypes.length}
        <form method="POST" action="/?/logWorkout" use:enhance={submit}>
          <div>
            <SearchSelect
              name="person"
              label="Person"
              options={peopleOptions}
              bind:value={personName}
              onselect={() => workoutSearch?.focus()}
            />
          </div>
          <div>
            <SearchSelect
              bind:this={workoutSearch}
              name="workoutName"
              label="Workout type"
              options={data.workoutTypes}
              bind:value={workoutName}
              onselect={() => valueInput?.focus()}
            />
          </div>
          <p>
            <label>
              {selectedWorkout?.description ?? 'Value'}
              <input bind:this={valueInput} name="value" type={selectedWorkout?.type === 'number' ? 'number' : 'text'} step="any" required />
            </label>
          </p>
          <button onpointerdown={(event) => event.preventDefault()} disabled={submitting || !personName || !selectedWorkout}>Log workout</button>
        </form>
      {:else}
        <p>Add a person and a workout type first.</p>
      {/if}
    {/if}
  {/key}
  {#if form?.error}
    <p role="alert">{form.error}</p>
  {/if}
  <button class="cancel" onpointerdown={(event) => event.preventDefault()} onclick={() => dialog?.close()} disabled={submitting}>Cancel</button>
</dialog>
