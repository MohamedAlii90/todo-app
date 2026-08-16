import { onMount } from 'svelte'

/**
 * Tracks whether the component has hydrated on the client.
 *
 * Every interactive control in this app is driven by a client-side handler
 * (onclick, onsubmit), and those handlers are only attached once Svelte
 * hydrates. Between the server-rendered HTML arriving and hydration finishing,
 * a button looks perfectly clickable but does nothing at all.
 *
 * Gating `disabled` on this closes that gap honestly: the control is disabled
 * for exactly as long as it is inert, and enables itself the moment it works.
 *
 * `onMount` never runs on the server, and does not run during the client's
 * first render either — so the server and client agree on the initial markup
 * and hydration stays mismatch-free.
 *
 *   const ready = hydrated()
 *   <button onclick={save} disabled={busy || !ready.current}>Save</button>
 */
export function hydrated() {
  let value = $state(false)

  onMount(() => {
    value = true
  })

  return {
    get current() {
      return value
    },
  }
}
