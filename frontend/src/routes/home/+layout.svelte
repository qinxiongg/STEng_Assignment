<script>
	import axios from 'axios';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Modal from '$lib/Modal.svelte';
	import { authStore, showKanban, userStore } from '$lib/stores';
	import { alertSuccess, handleError, customError } from '$lib/errorHandler';

	const API_URL = import.meta.env.VITE_API_URL;

	export let globalUsername = '';

	let isAdmin = false;
	let showModal = false;
	let globalEmail = '';

	let userProfile = {
		username: '',
		email: '',
		password: ''
	};

	let currentProfile = {
		username: globalUsername,
		email: '',
		password: ''
	};

	function handleCancel() {
		showModal = false;
	}

	function handleClickEditProfile() {
		showModal = true;
	}

	function handleClickApplications() {
		showKanban.set(false);
	}

	function handleUpdateProfile() {
		const updatedFields = {};

		updatedFields.username = globalUsername;

		if (currentProfile.email !== userProfile.email) {
			updatedFields.email = userProfile.email;
		}

		if (!userProfile.password) {
			updatedFields.password = userProfile.password;
		}

		return updatedFields;
	}

	const getCurrentUser = async () => {
		try {
			const response = await axios.get(`${API_URL}/getCurrentUser`, {
				withCredentials: true
			});

			globalUsername = response.data.username;
			globalEmail = response.data.email;
		} catch (error) {
			handleError(error.response.data);
			console.error('Failed to fetch current user', error);
		}
	};

	const checkIsAdmin = async () => {
		try {
			const response = await axios.get(`${API_URL}/checkIsAdmin`, { withCredentials: true });

			if (response.status === 200) {
				isAdmin = response.data.isAdmin;
				authStore.set(response.data.isAdmin);
			}
		} catch (error) {
			handleError(error.response.data);
			console.error('unable to check if user is admin', error);
		}
	};

	const logout = async () => {
		try {
			const response = await axios.post(
				`${API_URL}/logout`,
				{},
				{
					withCredentials: true
				}
			);

			if (response.status === 200) {
				goto('/login');
				alertSuccess(response.data.success);
			}
		} catch (error) {
			handleError(error.response.data);
			console.error('Unable to log out:', error);
		}
	};

	const getUserProfile = async () => {
		try {
			const response = await axios.get(`${API_URL}/profile`, { withCredentials: true });

			if (response.status === 200) {
				currentProfile = response.data;
				userProfile = { ...currentProfile };
			}
		} catch (error) {
			console.error('Error fetching user profile:', error);
			handleError(error.response.data);
		}
	};

	const updateUserProfile = async () => {
		const updatedFields = handleUpdateProfile();

		console.log('updatedFields', updatedFields);

		try {
			const response = await axios.patch(`${API_URL}/updateUserProfile`, updatedFields, {
				withCredentials: true
			});
			if (response.status === 200) {
				alertSuccess(response.data.success);
				getUserProfile();
			}
		} catch (error) {
			handleError(error.response.data);
			console.error('Unable to update user profile.', error);
		}
	};

	onMount(async () => {
		await getCurrentUser();
		await checkIsAdmin();
		await getUserProfile();
	});
</script>

<Modal bind:showModal>
	<form on:submit|preventDefault={updateUserProfile}>
		<div>
			<h2>Edit Profile</h2>
			<div class="form-group">
				<label for="username">Username:</label>
				<input type="text" bind:value={userProfile.username} readonly />
			</div>
			<div class="form-group">
				<label for="email">Email:</label>
				<input type="text" bind:value={userProfile.email} />
			</div>
			<div class="form-group">
				<label for="password">Password:</label>
				<input
					type="password"
					bind:value={userProfile.password}
					name="password"
					placeholder="Enter your new password"
				/>
			</div>
		</div>
		<div class="modal-buttons">
			<button type="submit">SAVE CHANGES</button>
			<button type="button" on:click={handleCancel}>CANCEL</button>
		</div>
	</form>
</Modal>

<nav>
	<ul>
		<li class="nav-left">Hello, {globalUsername}</li>
		<div class="nav-center">
			<li>
				<a href="/home/applications" on:click={handleClickApplications}>Applications</a>
			</li>
			{#if $authStore}
				<li>
					<a href="/home/user-management">User Management</a>
				</li>
			{/if}
		</div>
		<li class="nav-right">
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-missing-attribute -->
			<a on:click={handleClickEditProfile}>Edit Profile</a>

			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<!-- svelte-ignore a11y-missing-attribute -->
			<a on:click={logout}>Log Out</a>
		</li>
	</ul>
</nav>

<slot {globalUsername}></slot>

<style>
	form h2 {
		text-align: center;
		font-size: 1.5em;
	}
	.form-group {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 700px;
	}

	.form-group label {
		margin: 10px 20px;
		font-weight: bold;
		width: 190px;
		font-size: 1.1em;
	}

	.form-group input {
		margin: 10px 20px;
		background-color: #dadada;
		border: transparent;
		height: 38px;
		width: 100%;
		padding-left: 10px;
		padding-right: 10px;
		outline: none;
		border-radius: 4px;
	}

	.modal-buttons {
		display: flex;
		justify-content: center;
		margin-top: 20px;
		gap: 20px;
	}

	.modal-buttons button {
		padding: 10px 40px 10px 40px;
		width: 200px;
		height: 40px;
		cursor: pointer;
		background-color: black;
		color: #ffffff;
		border: none;
		margin-bottom: 20px;
	}

	nav {
		display: flex;
		background-color: black;
		margin: 0;
		color: #ffffff;
		height: 70px;
		align-items: center;
		font-size: 1.4em;
	}
	nav ul {
		display: flex;
		list-style: none;
		color: #ffffff;
		flex-grow: 1;
		justify-content: space-between;
		margin: 0;
	}
	a {
		text-decoration: none;
		margin-left: 10px;
		color: #ffffff;
	}
	.nav-left {
		margin-left: 60px;
	}
	.nav-center {
		display: flex;
		justify-content: center;
		gap: 20px;
	}
	.nav-right {
		margin-right: 60px;
		cursor: pointer;
	}
	input[readonly] {
		background-color: #ffffff;
	}
</style>
