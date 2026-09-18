<script lang="ts">
  import DeleteButton from '$lib/DeleteButton.svelte';

  import type { WorkoutEntry } from '$lib/types';

  let { person, entry, description = '' }: {
    person: string;
    entry: WorkoutEntry;
    description?: string;
  } = $props();
</script>

<DeleteButton
  action="/?/deleteWorkout"
  fields={{ person, entryId: entry.id }}
  label="Delete entry"
  message={`Delete ${person}'s log for ${entry.workoutName} (${entry.value}${description ? ` ${description}` : ''}) on ${new Date(entry.createdAt).toLocaleString()}?`}
/>
