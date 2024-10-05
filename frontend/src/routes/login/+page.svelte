<script>
	import axios from 'axios';
	import { goto } from '$app/navigation';
	// import { onMount } from 'svelte';
	import { customError, handleError, alertSuccess } from '$lib/errorHandler';
	import { userStore } from '$lib/stores';

	const API_URL = import.meta.env.VITE_API_URL;

	let username = '';
	let password = '';

	async function login() {
		try {
			const response = await axios.post(
				`${API_URL}/login`,
				{
					username: username,
					password: password
				},
				{
					withCredentials: true
				}
			);

			if (response.status === 200) {
				userStore.set(username);
				alertSuccess(response.data.success);
				goto('/home/applications');
				
			}
		} catch (error) {
			console.log('Unable to log in:', error.response.data.message);
			handleError(error.response.data);
		}
	}
</script>

<body>
	<div class="login-container">
		<h1>LOGIN</h1>
		<form class="login-form" on:submit|preventDefault={login}>
			<input type="text" bind:value={username} placeholder="Username" />
			<input type="password" bind:value={password} placeholder="Password" />
			<button type="submit">LOGIN</button>
		</form>
	</div>
</body>

<style>
	.login-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		flex-direction: column;
	}

	.login-form {
		text-align: center;
		width: 25%;
	}

	input {
		width: 100%;
		margin-bottom: 20px;
		padding: 15px;
		box-sizing: border-box;
		border: lightgray;
		border-radius: 5px;
		background-color: lightgray;
	}

	button {
		padding: 15px;
		border-radius: 5px;
		border: none;
		color: white;
		cursor: pointer;
		background-color: black;
		width: 100%;
		font-weight: bold;
	}
</style>
