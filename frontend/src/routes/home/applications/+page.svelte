<script>
	import { onMount } from 'svelte';
	import axios from 'axios';
	import { goto } from '$app/navigation';
	import { authStore, userStore } from '$lib/stores';
	import Modal from '$lib/Modal.svelte';

	const API_URL = import.meta.env.VITE_API_URL;

	let showModal = false;

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
				goto('/home/applications');
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
	<div class="modal-title">
		<h2>Create Application</h2>
		
	</div>
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
