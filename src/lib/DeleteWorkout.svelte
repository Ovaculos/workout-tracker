<script>
  import DeleteButton from '$lib/DeleteButton.svelte';

  let { person, entry, description = '' } = $props();
</script>

<DeleteButton
  action="/?/deleteWorkout"
  fields={{ person, entryId: entry.id }}
  label="Delete entry"
  message={`Delete ${person}'s log for ${entry.workoutName} (${entry.value}${description ? ` ${description}` : ''}) on ${new Date(entry.createdAt).toLocaleString()}?`}
/>
