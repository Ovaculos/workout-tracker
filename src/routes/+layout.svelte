<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import Actions from '$lib/Actions.svelte';
  import '$lib/theme.css';
  import { setContext } from 'svelte';

  let { data, children } = $props();
  let actions = $state();
  setContext('workout-actions', { open: (mode) => actions.open(mode) });

  function escape(event) {
    if (event.key !== 'Escape' || event.defaultPrevented || event.repeat || event.isComposing) return;
    if (document.querySelector('dialog[open]')) return;
    if (page.url.pathname !== '/') {
      event.preventDefault();
      goto('/');
    }
  }
</script>

<svelte:window onkeydown={escape} />

<div class="app-shell">
  <div class="screen" class:dashboard-screen={page.url.pathname === '/'}>
    {@render children()}
  </div>
  <Actions
    bind:this={actions}
    {data}
    dashboard={page.url.pathname === '/'}
    person={page.route.id === '/people/[name]' ? page.params.name : ''}
    workout={page.route.id === '/workouts/[name]' ? page.params.name : ''}
  />
</div>
