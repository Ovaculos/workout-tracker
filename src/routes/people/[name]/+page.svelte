<script>
  import { enhance } from '$app/forms';
  import DeleteButton from '$lib/DeleteButton.svelte';
  import DeleteWorkout from '$lib/DeleteWorkout.svelte';
  import { displayName, nameColor } from '$lib/names.js';

  let { data, form } = $props();
  let fileInput = $state();
  let uploading = $state(false);
  let rows = $derived(Array.from({ length: Math.max(data.prs.length, data.workouts.length, 1) }));

  function upload() {
    uploading = true;
    return async ({ update }) => {
      try {
        await update();
      } finally {
        uploading = false;
      }
    };
  }
</script>

<svelte:head>
  <title>{displayName(data.name)} — Workout tracker</title>
</svelte:head>

<main>
  <a href="/">Dashboard</a>
  <div class="page-heading">
    <h1 title={data.name} style:color={nameColor(data.name)}>{displayName(data.name)}</h1>
    <DeleteButton
      action="/?/deletePerson"
      fields={{ person: data.name }}
      label="Delete person"
      message={`Delete “${data.name}”, their profile picture, and all of their recorded workouts? This cannot be undone.`}
    />
  </div>
  <form method="POST" action="?/uploadPicture" enctype="multipart/form-data" use:enhance={upload}>
    <input
      bind:this={fileInput}
      type="file"
      name="picture"
      accept=".png,.jpeg,.jpg,.webp"
      hidden
      onchange={(event) => {
        if (event.currentTarget.files.length) event.currentTarget.form.requestSubmit();
      }}
    />
    <button
      type="button"
      onclick={() => fileInput.click()}
      disabled={uploading}
      aria-label={data.pictureVersion === null ? 'Upload profile picture' : 'Replace profile picture'}
      style="width: 128px; height: 128px; padding: 0"
    >
      {#if data.pictureVersion !== null}
        <img
          src={`/people/${encodeURIComponent(data.name)}/picture?v=${data.pictureVersion}`}
          alt={data.name}
          style="width: 100%; height: 100%; object-fit: cover; display: block"
        />
      {:else}
        {uploading ? 'Uploading…' : 'Upload picture'}
      {/if}
    </button>
  </form>
  {#if form?.error}
    <p role="alert">{form.error}</p>
  {/if}
  <table>
    <thead>
      <tr>
        <th scope="col">PRs</th>
        <th scope="col">Recent Workouts</th>
      </tr>
    </thead>
    <tbody>
      {#each rows as _, index}
        <tr>
          <td>
            {#if data.prs[index]}
              <a href={`/workouts/${encodeURIComponent(data.prs[index].workoutName)}`} title={data.prs[index].workoutName} style:color={nameColor(data.prs[index].workoutName)}>{displayName(data.prs[index].workoutName)}</a>: <span class:workout-value={typeof data.prs[index].value === 'number'}>{data.prs[index].value}</span>
              {data.workoutTypes.find((workout) => workout.name === data.prs[index].workoutName)?.description ?? ''}
              <DeleteWorkout
                person={data.name}
                entry={data.prs[index]}
                description={data.workoutTypes.find((workout) => workout.name === data.prs[index].workoutName)?.description ?? ''}
              />
            {:else if index === 0}
              No PRs yet.
            {/if}
          </td>
          <td>
            {#if data.workouts[index]}
              <a href={`/workouts/${encodeURIComponent(data.workouts[index].workoutName)}`} title={data.workouts[index].workoutName} style:color={nameColor(data.workouts[index].workoutName)}>{displayName(data.workouts[index].workoutName)}</a>: <span class:workout-value={typeof data.workouts[index].value === 'number'}>{data.workouts[index].value}</span>
              {data.workoutTypes.find((workout) => workout.name === data.workouts[index].workoutName)?.description ?? ''}
              <DeleteWorkout
                person={data.name}
                entry={data.workouts[index]}
                description={data.workoutTypes.find((workout) => workout.name === data.workouts[index].workoutName)?.description ?? ''}
              />
            {:else if index === 0}
              No workouts yet.
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</main>
