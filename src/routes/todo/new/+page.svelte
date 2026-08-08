<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation'

  const ITEM_MIN = 3
  const ITEM_MAX = 120

  let newTodo = $state('')
  let newTodoError = $state('')
  let submitError = $state('')
  let loading = $state(false)

  async function submit(event: SubmitEvent) {
    event.preventDefault()
    newTodoError = ''
    submitError = ''

    const item = newTodo.trim()

    if (item.length < ITEM_MIN) {
      newTodoError = `New todo is required, and it should be at least ${ITEM_MIN} characters`
      return
    }

    if (item.length > ITEM_MAX) {
      newTodoError = `New todo must be at most ${ITEM_MAX} characters`
      return
    }

    loading = true
    try {
      const response = await fetch('/api/v1/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item, isCompleted: false }),
      })
      const body = await response.json()

      if (!response.ok) {
        submitError = body.message ?? 'Something Went Wrong please try again'
        return
      }

      await invalidateAll()
      await goto('/todo')
    } catch {
      submitError = 'Something Went Wrong please try again'
    } finally {
      loading = false
    }
  }
</script>

<svelte:head>
  <title>QAcart Todo App - New Todo Page</title>
</svelte:head>

<div class="w-full max-w-md">
  <form class="surface space-y-4 p-8" onsubmit={submit} novalidate>
    <div>
      <span class="eyebrow">New item</span>
      <h1 data-testid="header" class="font-display text-3xl font-bold text-foreground">
        Create a new Todo
      </h1>
      <p data-testid="sub-header" class="mt-2 text-sm text-muted-foreground">
        Ready to mark some Todos as completed?
      </p>
    </div>

    <div>
      <label for="new-todo" class="mb-2 block text-sm font-medium text-muted-foreground">
        Todo Item
      </label>
      <input
        id="new-todo"
        name="item"
        type="text"
        bind:value={newTodo}
        data-testid="new-todo"
        aria-invalid={newTodoError ? 'true' : undefined}
        class="field {newTodoError ? 'field-invalid' : ''}"
      />
      {#if newTodoError}
        <p data-testid="new-todo-error" class="mt-2 text-sm text-destructive">{newTodoError}</p>
      {/if}
    </div>

    <button
      type="submit"
      data-testid="submit-newTask"
      disabled={loading}
      class="btn btn-primary w-full"
    >
      {loading ? 'Creating…' : 'Create Todo'}
    </button>

    {#if submitError}
      <p role="alert" data-testid="error-message" class="rounded-card border border-destructive bg-destructive/15 px-4 py-3 text-sm text-destructive">
        {submitError}
      </p>
    {/if}

    <hr class="border-border" />

    <p class="text-center text-sm text-muted-foreground">
      <a href="/todo" data-testid="back" class="text-primary hover:text-primary-hover">
        Go back to your Todos
      </a>
    </p>
  </form>
</div>
