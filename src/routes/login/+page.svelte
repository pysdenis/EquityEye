<script lang="ts">
	import RegisterForm from "../../lib/components/RegisterForm.svelte";
	import LoginFormAdmin from "../../lib/components/LoginForm.svelte";

	let showRegisterForm = false;
</script>

{#if showRegisterForm}
	<RegisterForm />
	<button class="absolute text-2xs right-3 bottom-2 hover:text-slate-800" on:click={() => showRegisterForm = false}>Máte už účet? Přihlaste se</button>
{:else}
	<LoginFormAdmin />
	<button class="absolute text-2xs right-3 bottom-2 hover:text-slate-800" on:click={() => showRegisterForm = true}>Zaregistrujte se</button>
{/if}

