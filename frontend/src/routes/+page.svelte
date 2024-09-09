<script>
</script>

<div class="login-container">
	<h1>LOGIN</h1>
	<div class="login">
		<form  action="/auth" method="POST">
			<label for="uname"></label>
			<input type="text" placeholder="Username" name="uname" required />

			<label for="psw"></label>
			<input type="password" placeholder="Password" name="psw" required />

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
