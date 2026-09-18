<script>
  import { getContext } from 'svelte';
  import { goto } from '$app/navigation';
  import SearchSelect from '$lib/SearchSelect.svelte';
  import { displayName, nameColor } from '$lib/names.js';

  let { data } = $props();
  const actions = getContext('workout-actions');
  let peopleOptions = $derived(data.people.map((name) => ({
    name,
    picture: data.pictureVersions[name] === null ? null : `/people/${encodeURIComponent(name)}/picture?v=${data.pictureVersions[name]}`
  })));
</script>

<svelte:head>
  <title>Workout tracker</title>
</svelte:head>

{#snippet personLink(name)}
  <a class="person-link" href={`/people/${encodeURIComponent(name)}`} title={name}>
    {#if data.pictureVersions[name] !== null}
      <img
        src={`/people/${encodeURIComponent(name)}/picture?v=${data.pictureVersions[name]}`}
        alt=""
        width="48"
        height="48"
      />
    {:else}
      <span class="avatar" aria-hidden="true">{name.slice(0, 1)}</span>
    {/if}
    <span style:color={nameColor(name)}>{displayName(name)}</span>
  </a>
{/snippet}

<main class="dashboard">
  <section class="recent-prs" aria-labelledby="recent-title">
    <h1 id="recent-title">Recent PRs</h1>
    <ul class="pr-list">
      {#each data.prs as pr}
        <li class="pr-entry">
          {@render personLink(pr.person)}
          <a class="pr-workout" href={`/workouts/${encodeURIComponent(pr.workoutName)}`} title={pr.workoutName} style:color={nameColor(pr.workoutName)}>{displayName(pr.workoutName)}</a>
          <div class="pr-score">
            <strong class="workout-value">{pr.value}</strong>
            <span>{data.workoutTypes.find((workout) => workout.name === pr.workoutName)?.description ?? ''}</span>
          </div>
        </li>
      {:else}
        <li class="empty-state">No PRs yet.</li>
      {/each}
    </ul>
  </section>
  <aside class="people-panel" aria-label="People and workout search">
    <div class="workout-search">
      <SearchSelect
        name="find-workout"
        label="Workouts"
        options={data.workoutTypes}
        onselect={(name) => goto(`/workouts/${encodeURIComponent(name)}`)}
      />
    </div>
    <div class="people-heading">
      <h2>People</h2>
      <button class="add-person" aria-label="Add person" aria-keyshortcuts="N" onclick={() => actions.open('person')}>
        <kbd>N</kbd><span>Add person</span>
      </button>
    </div>
    <SearchSelect
      name="find-person"
      label="Find person"
      options={peopleOptions}
      onselect={(name) => goto(`/people/${encodeURIComponent(name)}`)}
    />
    <ul class="people-list" aria-label="People">
      {#each data.people as name}
        <li>{@render personLink(name)}</li>
      {:else}
        <li class="empty-state">No people yet.</li>
      {/each}
    </ul>
  </aside>
</main>
