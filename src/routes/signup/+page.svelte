<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation'
  import { hydrated } from '$lib/hydrated.svelte'

  const ready = hydrated()

  let firstName = $state('')
  let lastName = $state('')
  let email = $state('')
  let password = $state('')
  let confirmPassword = $state('')

  let firstNameError = $state('')
  let lastNameError = $state('')
  let emailError = $state('')
  let passwordError = $state('')
  let confirmPasswordError = $state('')
  let submitError = $state('')
  let loading = $state(false)

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/

  // The same bounds the API enforces — see src/lib/server/validators/schemas.ts.
  const NAME_MIN = 2
  const NAME_MAX = 30
  const PASSWORD_MIN = 8

  function validate(): boolean {
    firstNameError = ''
    lastNameError = ''
    emailError = ''
    passwordError = ''
    confirmPasswordError = ''
    submitError = ''

    if (firstName.trim().length < NAME_MIN || firstName.trim().length > NAME_MAX) {
      firstNameError = `First name must be between ${NAME_MIN} and ${NAME_MAX} characters`
      return false
    }

    if (lastName.trim().length < NAME_MIN || lastName.trim().length > NAME_MAX) {
      lastNameError = `Last name must be between ${NAME_MIN} and ${NAME_MAX} characters`
      return false
    }

    if (!EMAIL_RE.test(email)) {
      emailError = 'Please Insert a correct Email format'
      return false
    }

    if (password.length < PASSWORD_MIN) {
      passwordError = `Password must be at least ${PASSWORD_MIN} characters`
      return false
    }

    if (password !== confirmPassword) {
      confirmPasswordError = 'Second password does not match the first Password'
      return false
    }

    return true
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault()
    if (!validate()) return

    loading = true
    try {
      const response = await fetch('/api/v1/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      })
      const body = await response.json()

      if (!response.ok) {
        password = ''
        confirmPassword = ''
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
  <title>QAcart Todo App - Signup page</title>
</svelte:head>

<div class="w-full max-w-md">
  <form class="surface space-y-4 p-8" onsubmit={submit} novalidate>
    <div>
      <span class="eyebrow">Get started</span>
      <h1 data-testid="header" class="font-display text-3xl font-bold text-foreground">
        Register to Application
      </h1>
      <p class="mt-2 text-sm text-muted-foreground">Ready to mark some Todos as completed?</p>
    </div>

    <div>
      <label for="first-name" class="mb-2 block text-sm font-medium text-muted-foreground">
        First Name
      </label>
      <input
        id="first-name"
        name="firstName"
        type="text"
        autocomplete="given-name"
        bind:value={firstName}
        data-testid="first-name"
        aria-invalid={firstNameError ? 'true' : undefined}
        class="field {firstNameError ? 'field-invalid' : ''}"
      />
      {#if firstNameError}
        <p data-testid="first-name-error" class="mt-2 text-sm text-destructive">{firstNameError}</p>
      {/if}
    </div>

    <div>
      <label for="last-name" class="mb-2 block text-sm font-medium text-muted-foreground">
        Last Name
      </label>
      <input
        id="last-name"
        name="lastName"
        type="text"
        autocomplete="family-name"
        bind:value={lastName}
        data-testid="last-name"
        aria-invalid={lastNameError ? 'true' : undefined}
        class="field {lastNameError ? 'field-invalid' : ''}"
      />
      {#if lastNameError}
        <p data-testid="last-name-error" class="mt-2 text-sm text-destructive">{lastNameError}</p>
      {/if}
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
        autocomplete="new-password"
        bind:value={password}
        data-testid="password"
        aria-invalid={passwordError ? 'true' : undefined}
        class="field {passwordError ? 'field-invalid' : ''}"
      />
      {#if passwordError}
        <p data-testid="password-error" class="mt-2 text-sm text-destructive">{passwordError}</p>
      {/if}
    </div>

    <div>
      <label for="confirm-password" class="mb-2 block text-sm font-medium text-muted-foreground">
        Confirm Password
      </label>
      <input
        id="confirm-password"
        name="confirmPassword"
        type="password"
        autocomplete="new-password"
        bind:value={confirmPassword}
        data-testid="confirm-password"
        aria-invalid={confirmPasswordError ? 'true' : undefined}
        class="field {confirmPasswordError ? 'field-invalid' : ''}"
      />
      {#if confirmPasswordError}
        <p data-testid="confirm-password-error" class="mt-2 text-sm text-destructive">
          {confirmPasswordError}
        </p>
      {/if}
    </div>

    <button type="submit" data-testid="submit" disabled={loading || !ready.current} class="btn btn-primary w-full">
      {loading ? 'Creating account…' : 'Signup'}
    </button>

    {#if submitError}
      <p role="alert" data-testid="error" class="rounded-card border border-destructive bg-destructive/15 px-4 py-3 text-sm text-destructive">
        {submitError}
      </p>
    {/if}

    <hr class="border-border" />

    <p class="text-center text-sm text-muted-foreground">
      <a href="/login" data-testid="go-login" class="text-primary hover:text-primary-hover">
        Do you have an Account?
      </a>
    </p>
  </form>
</div>
