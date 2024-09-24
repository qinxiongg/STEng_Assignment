<script>
	import { onMount } from 'svelte';
	import axios from 'axios';
	import { authStore, userStore } from '$lib/stores';
	import Modal from '$lib/Modal.svelte';

	const API_URL = import.meta.env.VITE_API_URL;

	let showModal = false;
	let modalType = null;

	let newPlan = {
		planMVPName: null,
		planAppAcronym: null,
		planStartDate: null,
		planEndDate: null,
		planColor: null
	};

	async function createPlan() {}

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

	onMount(async () => {
		await checkIsAdmin();
	});
</script>

<Modal bind:showModal>
	{#if modalType === 'createPlan'}
		<form on:submit|preventDefault={createPlan}>
			<div>
				<h2>Create Plan</h2>
				<div class="form-group">
					<label for="appAcronym">App Acronym</label>
					<p>Task12</p>
				</div>
				<div class="form-group">
					<label for="planName">Plan Name</label>
					<input type="text" bind:value={newPlan.planMVPName} placeholder="Name" />
				</div>
				<div class="form-group">
					<label for="appStartDate">Start Date</label>
					<input type="date" bind:value={newPlan.planStartDate} />
				</div>
				<div class="form-group">
					<label for="appEndDate">End Date</label>
					<input type="date" bind:value={newPlan.planEndDate} />
				</div>
				<div class="form-group">
					<label for="planColor">Color</label>
					<input type="color" bind:value={newPlan.planColor} />
				</div>
			</div>
			<div class="modal-buttons">
				<button type="submit">Create Plan</button>
				<button
					type="button"
					on:click={() => {
						showModal = false;
					}}>Cancel</button
				>
			</div>
		</form>
		<!-- {:else if modalType === 'createTask'} -->
	{/if}
</Modal>

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
	<div class="kanban">
		<div class="kanban-header">
			<h2>Open</h2>
			<button class="createTaskButton">+ CREATE TASK</button>
		</div>
	</div>
	<div class="kanban">
		<h2>To do</h2>
	</div>
	<div class="kanban">
		<h2>Doing</h2>
	</div>
	<div class="kanban">
		<h2>Done</h2>
	</div>
	<div class="kanban">
		<h2>Closed</h2>
	</div>
</div>

<style>
	.middle-container {
		align-items: center;
		display: flex;
		justify-content: space-between;
		margin-top: 20px;
	}
	.middle-left {
		margin-left: 70px;
		font-size: 1.7em;
	}
	.middle-right {
		margin-right: 70px;
		background-color: black;
		color: #ffffff;
		width: 140px;
		height: 40px;
		cursor: pointer;
	}
	.kanban-container {
		margin-top: 10px;
		display: flex;
		justify-content: space-evenly;
		min-height: calc(100vh - 190px);
	}
	.kanban {
		background-color: #d8d8d8;
		width: 260px;
		border-radius: 5px;
		font-size: 0.7em;
		margin-left: 10px;
		margin-right: 10px;
		margin-bottom: 20px;
	}
	.kanban-header {
		display: flex;
		justify-content: space-between;
	}
	.kanban h2 {
		margin-left: 20px;
	}
	.createTaskButton {
		width: 120px;
		height: 30px;
		align-self: center;
		margin-right: 10px;
		background-color: #000000;
		color: #ffffff;
	}
	form h2 {
		text-align: center;
	}
	.form-group {
		display: flex;
		justify-content: space-between;
	}
	.form-group label {
		margin: 10px 20px;
		width: 120px;
		font-weight: bold;
	}
	.form-group input {
		margin: 10px 20px;
		background-color: #dadada;
		border: transparent;
		height: 38px;
		width: 100%;
		padding-left: 10px;
		outline: none;
		border-radius: 4px;
	}
</style>
