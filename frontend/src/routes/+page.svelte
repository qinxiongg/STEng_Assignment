<script>
	import axios from 'axios';
	import { goto } from '$app/navigation';

	let username = '';
	let password = '';
	let errorMessage = '';

	const handleSubmit = async (event) => {
		event.preventDefault(); // Prevent default form submission

		try {
			const response = await axios.post(
				'/api/login',
				{
					uname: username,
					psw: password
				},
				{
					withCredentials: true
				}
			);

			// Redirect on successful login
			if (response.status === 200) {
				goto('/tms'); // Redirect to a new page
			} else {
				errorMessage = 'Login failed';
			}
		} catch (error) {
			console.error('Login error:', error);
			errorMessage = 'An error occurred during login';
		}
	};
</script>

<div class="login-container">
	<h1>LOGIN</h1>
	<div class="login">
		<form on:submit={handleSubmit}>
			<label for="uname"></label>
			<input type="text" bind:value={username} placeholder="Username" name="uname" required />

			<label for="psw"></label>
			<input
				type="password"
				bind:value={password}
				placeholder="Password"
				name="psw"
				required
			/>

			<button type="submit"><b>LOGIN</b></button>
		</form>
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
