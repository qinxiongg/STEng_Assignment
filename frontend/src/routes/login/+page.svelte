<script>
	import axios from 'axios';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { customError, handleError } from '../../lib/errorHandler';

	const API_URL = import.meta.env.VITE_API_URL;
	console.log(API_URL);

	let username = '';
	let password = '';
	let errorMessage = ''; // TODO: error message using toast

	async function handleSubmit() {
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
			// Redirect on successful login
			if (response.status === 200) {
				goto('/applications'); // Redirect to a new page
			}
		} catch (error) {
			// console.error('Login error:', error);
			if (error instanceof axios.AxiosError) {
				handleError(error.response.data);
			} else {
				customError('An error occurred during login');
			}
		}
	}

	// onMount(async () => {
	// 	await handleSubmit;
	// });

	
</script>

<div class="login-container">
	<h1>LOGIN</h1>
	<div class="login">
		<!-- <form on:submit={handleSubmit}> -->
		<label for="username"></label>
		<input type="text" bind:value={username} placeholder="Username" name="username" required />

		<label for="password"></label>
		<input
			type="password"
			bind:value={password}
			placeholder="Password"
			name="password"
			required
		/>

		<button type="submit" on:click={handleSubmit}><b>LOGIN</b></button>
		<!-- </form> -->
	</div>
</div>

<style>
	.login-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		flex-direction: column;
		margin: 0;
	}

	.login {
		text-align: center;
		width: 25%;
	}

	input {
		display: block;
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
	}
</style>
