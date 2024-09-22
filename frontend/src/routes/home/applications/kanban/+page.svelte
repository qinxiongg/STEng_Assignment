<script>
	import { onMount } from 'svelte';
	import axios from 'axios';
	import { goto } from '$app/navigation';
	import { authStore, userStore } from '$lib/stores';
	import Modal from '$lib/Modal.svelte';
	import FaEdit from 'svelte-icons/fa/FaEdit.svelte';

	const API_URL = import.meta.env.VITE_API_URL;

	let showModal = false;
	let modalType = null;

	let newApp = {
		appAcronym: null,
		appRNumber: null,
		appDesc: null,
		appStartDate: null,
		appEndDate: null,
		appPermitCreate: null,
		appPermitOpen: null,
		appPermitToDo: null,
		appPermitDoing: null,
		appPermitDone: null
	};

	// Set authStore to true if user is admin
	async function checkIsAdmin() {
		try {
			const response = await axios.get(`${API_URL}/checkIsAdmin`, { withCredentials: true });
			let isAdmin = false;

			if (response.status === 200) {
				isAdmin = response.data.isAdmin;
				authStore.set(response.data.isAdmin);
			}

		} catch (error) {
			console.error('Error at checkIsAdmin:', error);
		}
	}

	async function createApplication() {}

	async function editApplication() {}

	onMount(async () => {
		await checkIsAdmin();
	});
</script>

<div class="middle-container">
	<h1 class="middle-left">Task Management Board</h1>
	<button
		class="middle-right"
		on:click={() => {
			showModal = true;
			modalType = 'createPlan';
		}}>+ CREATE PLAN</button
	>
</div>
<div class="kanban-container">

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
		cursor: pointer;
	}
</style>
