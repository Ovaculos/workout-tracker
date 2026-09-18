<script>
  import { goto } from '$app/navigation';
  import SearchSelect from '$lib/SearchSelect.svelte';
  import { displayName } from '$lib/names.js';

  let { data } = $props();
  let rows = $derived(Array.from({ length: Math.max(data.prs.length, data.people.length, 1) }));
  let peopleOptions = $derived(data.people.map((name) => ({
    name,
    picture: data.pictureVersions[name] === null ? null : `/people/${encodeURIComponent(name)}/picture?v=${data.pictureVersions[name]}`
  })));
</script>

<svelte:head>
  <title>Workout tracker</title>
</svelte:head>

{#snippet personLink(name)}
  <a href={`/people/${encodeURIComponent(name)}`} title={name}>
    {#if data.pictureVersions[name] !== null}
      <img
        src={`/people/${encodeURIComponent(name)}/picture?v=${data.pictureVersions[name]}`}
        alt=""
        width="64"
        height="64"
        style="object-fit: cover; vertical-align: middle"
      />
    {/if}
    {displayName(name)}
  </a>
{/snippet}

<main>
  <SearchSelect
    name="find-workout"
    label="Workouts"
    options={data.workoutTypes}
    onselect={(name) => goto(`/workouts/${encodeURIComponent(name)}`)}
  />
  <table>
    <thead>
      <tr>
        <th scope="col">5 most recent PRs</th>
        <th scope="col">
          <SearchSelect
            name="find-person"
            label="People"
            options={peopleOptions}
            onselect={(name) => goto(`/people/${encodeURIComponent(name)}`)}
          />
        </th>
      </tr>
    </thead>
    <tbody>
      {#each rows as _, index}
        <tr>
          <td>
            {#if data.prs[index]}
              {@render personLink(data.prs[index].person)}
              — <a href={`/workouts/${encodeURIComponent(data.prs[index].workoutName)}`} title={data.prs[index].workoutName}>{displayName(data.prs[index].workoutName)}</a>: {data.prs[index].value}
              {data.workoutTypes.find((workout) => workout.name === data.prs[index].workoutName)?.description ?? ''}
            {:else if index === 0}
              No PRs yet.
            {/if}
          </td>
          <td>
            {#if data.people[index]}
              {@render personLink(data.people[index])}
            {:else if index === 0}
              No people yet.
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</main>
