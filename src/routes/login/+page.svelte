<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation'
  import { hydrated } from '$lib/hydrated.svelte'

  const ready = hydrated()

  let email = $state('')
  let password = $state('')
  let emailError = $state('')
  let passwordError = $state('')
  let submitError = $state('')
  let loading = $state(false)

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/

  async function submit(event: SubmitEvent) {
    event.preventDefault()
    emailError = ''
    passwordError = ''
    submitError = ''

    if (!EMAIL_RE.test(email)) {
      emailError = 'Please Insert a correct Email format'
      return
    }

    if (!password) {
      passwordError = 'Password is required'
      return
    }

    loading = true
    try {
      const response = await fetch('/api/v1/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const body = await response.json()

      if (!response.ok) {
        // Clear the password on a failed attempt.
        password = ''
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
  <title>QAcart Todo App - Login page</title>
</svelte:head>

<div class="w-full max-w-md">
  <form class="surface login-container space-y-4 p-8" onsubmit={submit} novalidate>
    <div>
      <span class="eyebrow">Welcome back</span>
      <h1 class="header font-display text-3xl font-bold text-foreground">Login to Application</h1>
      <p class="mt-2 text-sm text-muted-foreground">
        Ready to mark some Todos as completed?
      </p>
    </div>

    <div>
      <label for="email" class="mb-2 block text-sm font-medium text-muted-foreground">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        autocomplete="email"
        bind:value={email}
        data-testid="email"
        aria-invalid={emailError ? 'true' : undefined}
        class="field {emailError ? 'field-invalid' : ''}"
      />
      {#if emailError}
        <p data-testid="email-error" class="mt-2 text-sm text-destructive">{emailError}</p>
      {/if}
    </div>

    <div>
      <label for="password" class="mb-2 block text-sm font-medium text-muted-foreground">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autocomplete="current-password"
        bind:value={password}
        data-testid="password"
        aria-invalid={passwordError ? 'true' : undefined}
        class="field {passwordError ? 'field-invalid' : ''}"
      />
      {#if passwordError}
        <p data-testid="password-error" class="mt-2 text-sm text-destructive">{passwordError}</p>
      {/if}
    </div>

    <button
      type="submit"
      id="submit"
      name="submit"
      data-testid="submit"
      disabled={loading || !ready.current}
      class="btn btn-primary w-full"
    >
      {loading ? 'Logging in…' : 'Login'}
    </button>

    {#if submitError}
      <p role="alert" data-testid="error-alert" class="rounded-card border border-destructive bg-destructive/15 px-4 py-3 text-sm text-destructive">
        {submitError}
      </p>
    {/if}

    <hr class="border-border" />

    <p class="text-center text-sm text-muted-foreground">
      <a href="/signup" data-testid="signup" class="text-primary hover:text-primary-hover">
        Create a new Account?
      </a>
    </p>
  </form>
</div>
