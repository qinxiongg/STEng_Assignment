<script>
	import { Toaster, toast } from 'svelte-sonner';
	import Modal from '../lib/Modal.svelte';
	import axios from 'axios';
	import { page } from '$app/stores';
    import { goto } from '$app/navigation';


	const API_URL = import.meta.env.VITE_API_URL;

	// Check if user is admin
	let isAdmin = false;
	let loggedinUser = '';

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

	function editProfileModal() {
		modalType = 'editProfile';
		showModal = true;
	}

	async function checkAdmin() {
		console.log('123');
		try {
			console.log('1234');
			const response = await axios.get(`${API_URL}/isAdmin`, { withCredentials: true });
			console.log(response);
			if (response.status === 200) {
				console.log('after status 200');
				isAdmin = response.data.isAdmin;
			}
			// console.log('isAdmin:', isAdmin);
			if (!isAdmin) {
				goto('/login');
			}
		} catch (error) {
			console.log('Error at checkadmin', error);
		}
	}

	async function fetchUserInfo() {
		try {
			const response = await axios.get(`${API_URL}/userinfo`, { withCredentials: true });
			if (response.status === 200) {
				loggedinUser = response.data.username;
			}
		} catch (error) {
			console.error('Error fetching user info:', error);
		}
	}

	async function fetchUserProfile() {
		try {
			const response = await axios.get(`${API_URL}/profile`, { withCredentials: true });
			console.log('user profile:', response.data);
			if (response.status === 200) {
				userProfile = response.data.profile;
				originalProfile = { ...userProfile };
			}
		} catch (error) {
			console.log('Error fetching user profile:', error);
		}
	}

	import { onMount } from 'svelte';
	onMount(async () => {
		await checkAdmin();
		await fetchUserInfo();
		await fetchUserProfile();
	});
</script>

<Toaster />

{#if !$page.url.pathname.endsWith('/login')}
	<Modal bind:showModal>
		{#if modalType === 'editProfile'}
			<div>
				<h2>Edit Profile</h2>
				<div class="form-group">
					<label for="username">Username:</label>
					<input type="text" bind:value={loggedinUser} readonly name="groupName" />

					<label for="email">Email:</label>
					<input type="text" bind:value={userProfile.email} name="email" />

					<label for="groupName">Password:</label>
					<input type="password" bind:value={userProfile.password} name="password" />
				</div>
				<div class="modal-buttons">
					<button type="submit" on:click={editProfile}>SAVE CHANGES</button>
					<button
						type="button"
						on:click={() => {
							showModal = false;
						}}>CANCEL</button
					>
				</div>
			</div>
		{/if}
	</Modal>

	<nav>
		<ul>
			<li class="nav-left">Hello, {loggedinUser}</li>
			<div class="nav-center">
				<li>
					<a href="/applications">Applications</a>
				</li>
				{#if isAdmin }
					<li>
						<a href="/user-management">User Management</a>
					</li>
				{/if}
			</div>
			<li class="nav-right">
				<a on:click={editProfileModal}>Edit Profile</a>
			</li>
		</ul>
	</nav>
{/if}

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
		height: 100px;
		align-items: center;
		font-size: 1.5em;
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
	}
</style>
