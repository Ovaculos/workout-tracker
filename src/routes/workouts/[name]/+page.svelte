<script>
  import DeleteButton from '$lib/DeleteButton.svelte';
  import DeleteWorkout from '$lib/DeleteWorkout.svelte';
  import { displayName, nameColor } from '$lib/names.js';

  let { data } = $props();
  let rows = $derived(Array.from({ length: Math.max(data.prs.length, data.recent.length, 1) }));
</script>

<svelte:head>
  <title>{displayName(data.workout.name)} — Workout tracker</title>
</svelte:head>

{#snippet entry(result)}
  <a href={`/people/${encodeURIComponent(result.person)}`} title={result.person}>
    {#if result.pictureVersion !== null}
      <img
        src={`/people/${encodeURIComponent(result.person)}/picture?v=${result.pictureVersion}`}
        alt=""
        width="48"
        height="48"
        style="object-fit: cover; vertical-align: middle"
      />
    {/if}
    <span style:color={nameColor(result.person)}>{displayName(result.person)}</span>
  </a>: <span class:workout-value={typeof result.value === 'number'}>{result.value}</span> {data.workout.description}
  <DeleteWorkout person={result.person} entry={result} description={data.workout.description} />
{/snippet}

<main>
  <a href="/">Dashboard</a>
  <div class="page-heading">
    <h1 title={data.workout.name} style:color={nameColor(data.workout.name)}>{displayName(data.workout.name)}</h1>
    <DeleteButton
      action="/?/deleteWorkoutType"
      fields={{ workoutName: data.workout.name }}
      label="Delete workout type"
      message={`Delete the “${data.workout.name}” workout type and all of its recorded workouts for everyone? This cannot be undone.`}
    />
  </div>
  <table>
    <thead>
      <tr>
        <th scope="col">PRs</th>
        <th scope="col">Recent Logs</th>
      </tr>
    </thead>
    <tbody>
      {#each rows as _, index}
        <tr>
          <td>
            {#if data.prs[index]}
              {index + 1}. {@render entry(data.prs[index])}
            {:else if index === 0}
              {data.workout.type === 'string' ? 'String values are logged without PR ranking.' : 'No PRs yet.'}
            {/if}
          </td>
          <td>
            {#if data.recent[index]}
              {@render entry(data.recent[index])}
            {:else if index === 0}
              No workouts yet.
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</main>
