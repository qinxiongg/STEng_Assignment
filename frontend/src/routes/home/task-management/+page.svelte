<script>
	import { onMount } from 'svelte';
	import axios from 'axios';
	import { goto } from '$app/navigation';
	import { authStore, userStore } from '$lib/stores';
	import Modal from '$lib/Modal.svelte';

	const API_URL = import.meta.env.VITE_API_URL;

	let showModal = false;

	let newApp = {
		appAcronym : null,
		appRNumber : null,
		appDesc : null,
		appStartDate: null,
		appEndDate: null,
		appPermitCreate: null,
		appPermitOpen: null,
		appPermitToDo: null,
		appPermitDoing: null,
		appPermitDone: null
	}

	const createNewApplication = (req, res) => {
		
	}


	function showCreateAppModal() {
		showModal = true;
	}

	function closeCreateAppModal() {
		showModal = false;
	}

	// Set authStore to true if user is admin
	async function checkIsAdmin() {
		try {
			const response = await axios.get(`${API_URL}/checkIsAdmin`, { withCredentials: true });
			let isAdmin = false;

			if (response.status === 200) {
				isAdmin = response.data.isAdmin;
				authStore.set(response.data.isAdmin);
			}

			if (!isAdmin) {
				goto('/home/task-management');
			}
		} catch (error) {
			console.error('Error at checkIsAdmin:', error);
		}
	}

	onMount(async () => {
		await checkIsAdmin();
	});
</script>

<Modal bind:showModal>
	<form on:submit|preventDefault={createNewApplication}>
		<h2>Create Application</h2>
		<label for="appAcronym">
			<input type="text" bind:value={newApp.appAcronym} placeholder="Name">
		</label>
		
	</form>
</Modal>

<div class="middle-container">
	<h1 class="middle-left">Applications</h1>
	<button
		class="middle-right"
		on:click={() => {
			showModal = true;
		}}>CREATE APP</button
	>
</div>

<style>
	.middle-container {
		align-items: center;
		display: flex;
		justify-content: space-between;
		margin-top: 40px;
	}
	.middle-left {
		margin-left: 70px;
	}
	.middle-right {
		margin-right: 70px;
		background-color: black;
		color: #ffffff;
		width: 140px;
		height: 40px;
	}
</style>
