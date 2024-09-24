<script>
	import axios from 'axios';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Toaster, toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import Modal from '$lib/Modal.svelte';
	import { authStore, userStore } from '$lib/stores';
	import { customAlert, handleError, customError } from '$lib/errorHandler';

	const API_URL = import.meta.env.VITE_API_URL;

	let isAdmin = false;
	let loggedinUsername;

	let showModal = false;
	let modalType = '';

	let userProfile = {
		username: '',
		email: '',
		password: ''
	};

	let originalProfile = {
		username: '',
		email: '',
		password: ''
	};

	let newPassword;

	function editProfileModal() {
		modalType = 'editProfile';
		showModal = true;
	}

	async function checkIsAdmin() {
		try {
			const response = await axios.get(`${API_URL}/checkIsAdmin`, { withCredentials: true });

			if (response.status === 200) {
				isAdmin = response.data.isAdmin;
				authStore.set(response.data.isAdmin);
			}
		} catch (error) {
			console.log('Error at checkIsAdmin', error);
		}
	}

	async function getUsername() {
		try {
			const response = await axios.get(`${API_URL}/getUsername`, { withCredentials: true });
			if (response.status === 200) {
				// save retrieved username
				userStore.set(response.data.username);

				// save value from userStore to loggedinUsername
				loggedinUsername = $userStore;
			}
		} catch (error) {
			console.error('Error fetching user info:', error);
		}
	}

	async function logout() {
		try {
			const response = await axios.post(
				`${API_URL}/logout`,
				{},
				{
					withCredentials: true
				}
			);

			if (response.status === 200) {
				userStore.set('');
				loggedinUsername = '';
				goto('/login');
				customAlert(response.data.success);
			}
		} catch (error) {
			if (error instanceof axios.AxiosError) {
				handleError(error.response.data);
			} else {
				customError('An error occurred during logout');
			}
		}
	}

	async function getUserProfile() {
		try {
			const response = await axios.get(`${API_URL}/profile`, { withCredentials: true });

			if (response.status === 200) {
				userProfile = response.data.profile;
				originalProfile = { ...userProfile };
			}
		} catch (error) {
			console.log('Error fetching user profile:', error);
		}
	}

	async function updateUserProfile() {
		if (newPassword) {
			userProfile.password = newPassword;
		} else {
			userProfile.password = null;
		}

		const updatedFields = {};

		if (userProfile.email !== originalProfile.email) {
			updatedFields.email = userProfile.email;
		}

		updatedFields.password = userProfile.password;

		if (Object.keys(updatedFields).length > 0)
			try {
				const response = await axios.patch(`${API_URL}/updateUserProfile`, updatedFields, {
					withCredentials: true
				});
				if (response.status === 200) {
					originalProfile = { ...userProfile };

					customAlert(response.data.success);
					newPassword = '';
				}
			} catch (error) {
				if (error instanceof axios.AxiosError) {
					handleError(error.response.data);
				} else {
					customError('An error occurred during adding group');
				}
			}
	}

	onMount(async () => {
		await checkIsAdmin();
		await getUsername();
		await getUserProfile();
	});
</script>

<Toaster style="z-index: 12;" richColors />

<!-- {#if !$page.url.pathname.endsWith('/login')} -->
<Modal bind:showModal>
	<!-- {#if modalType === 'editProfile'} -->
	<div>
		<h2>Edit Profile</h2>
		<div class="form-group">
			<label for="username">Username:</label>
			<input type="text" bind:value={loggedinUsername} readonly name="groupName" />

			<label for="email">Email:</label>
			<input type="text" bind:value={userProfile.email} name="email" />

			<label for="groupName">Password:</label>
			<input
				type="password"
				bind:value={newPassword}
				name="password"
				placeholder="Enter your new password"
			/>
		</div>
		<div class="modal-buttons">
			<button type="submit" on:click={updateUserProfile}>SAVE CHANGES</button>
			<button
				type="button"
				on:click={() => {
					showModal = false;
				}}>CANCEL</button
			>
		</div>
	</div>
	<!-- {/if} -->
</Modal>

<nav>
	<ul>
		<li class="nav-left">Hello, {$userStore}</li>
		<div class="nav-center">
			<li>
				<a href="/home/applications">Applications</a>
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
			<a on:click={editProfileModal}>Edit Profile</a>

			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<!-- svelte-ignore a11y-missing-attribute -->
			<a on:click={logout}>Log Out</a>
		</li>
	</ul>
</nav>
<!-- {/if} -->

<slot></slot>

<style>
	.form-group {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 15px;
	}

	.form-group label {
		width: 30%;
		margin-right: 10px;
	}

	.form-group input {
		width: 70%;
		padding: 8px;
		background-color: #f0f0f0;
		border-radius: 5px;
	}

	.modal-buttons {
		display: flex;
		justify-content: center;
		margin-top: 20px;
		gap: 20px;
	}

	.modal-buttons button {
		padding: 10px 40px 10px 40px;
		cursor: pointer;
		background-color: black;
		color: #ffffff;
		border: none;
	}

	nav {
		display: flex;
		background-color: black;
		margin: 0;
		color: #ffffff;
		height: 80px;
		align-items: center;
		font-size: 1.4em;
	}
	nav ul {
		display: flex;
		list-style: none;
		color: #ffffff;
		padding: 10px;
		flex-grow: 1;
		justify-content: space-between;
	}
	a {
		text-decoration: none;
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
</style>
