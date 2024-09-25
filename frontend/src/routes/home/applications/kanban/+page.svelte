<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import axios from 'axios';
	import { authStore, userStore, selectedAppToShowKanban } from '$lib/stores';
	import { customError, handleError, customAlert } from '$lib/errorHandler';
	import Modal from '$lib/Modal.svelte';

	const API_URL = import.meta.env.VITE_API_URL;

	let showModal = false;
	let modalType = null;

	let createPlanStartDate = null;
	let createPlanEndDate = null;

	let newPlan = {
		planMVPName: null,
		planAppAcronym: null,
		planStartDate: null,
		planEndDate: null,
		planColor: '#000000'
	};

	newPlan.planAppAcronym = $selectedAppToShowKanban;

	async function createPlan() {
		try {
			// convert date to epoch timestamp
			const startDate = new Date(createPlanStartDate);
			newPlan.planStartDate = Math.floor(startDate.getTime() / 1000);

			const endDate = new Date(createPlanEndDate);
			newPlan.planEndDate = Math.floor(endDate.getTime() / 1000);

			const response = await axios.post(`${API_URL}/createPlan`, newPlan, {
				withCredentials: true
			});

			console.log('newplan', newPlan);
			if (response.status === 201) {
				// reset object values back to null
				for (let key in newPlan) {
					newPlan[key] = null;
				}
				createPlanStartDate = null;
				createPlanEndDate = null;
				planColor = '#000000';
				customAlert(response.data.success);
			}
		} catch (error) {
			if (error instanceof axios.AxiosError) {
				handleError(error.response.data);
			} else {
				customError('An error occurred at create plan.');
			}
		}
	}

	async function createTask() {}

	onMount(async () => {
		if ($selectedAppToShowKanban === '') {
			goto('/home/applications');
		}
	});
</script>

<Modal bind:showModal>
	{#if modalType === 'createPlan'}
		<form on:submit|preventDefault={createPlan}>
			<div>
				<h2>Create Plan</h2>
				<div class="form-group">
					<label for="appAcronym">App Acronym</label>
					<input type="text" bind:value={newPlan.planAppAcronym} placeholder="Name" />
				</div>
				<div class="form-group">
					<label for="planName">Plan Name</label>
					<input type="text" bind:value={newPlan.planMVPName} placeholder="Name" />
				</div>
				<div class="form-group">
					<label for="appStartDate">Start Date</label>
					<input type="date" bind:value={createPlanStartDate} />
				</div>
				<div class="form-group">
					<label for="appEndDate">End Date</label>
					<input type="date" bind:value={createPlanEndDate} />
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
	{:else if modalType === 'createTask'}
		<form on:submit|preventDefault={createTask}>
			<div>
				<h2>app_AcronymXapp_RNumber</h2>
				<div class="createTaskDetails">
					<div class="form-group">
						<label for="appAcronym">Task ID</label>
						<input type="text" bind:value={newPlan.planAppAcronym} readonly />
					</div>
					<div class="form-group">
						<label for="planName">Task Name</label>
						<input type="text" bind:value={newPlan.planMVPName} />
					</div>
					<div class="form-group">
						<label for="appStartDate">Task Description</label>
						<input type="date" bind:value={createPlanStartDate} />
					</div>
					<div class="form-group">
						<label for="appEndDate">Plan Name</label>
						<input type="date" bind:value={createPlanEndDate} />
					</div>
					<div class="form-group">
						<label for="planColor">Task Creator</label>
						<input type="color" bind:value={newPlan.planColor} />
					</div>
					<div class="form-group">
						<label for="planColor">Task Owner</label>
						<input type="color" bind:value={newPlan.planColor} />
					</div>
					<div class="form-group">
						<label for="planColor">Task Create Date</label>
						<input type="color" bind:value={newPlan.planColor} />
					</div>
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
	{/if}
</Modal>

<div class="middle-container">
	<h1 class="middle-left">Task Management Board: {$selectedAppToShowKanban}</h1>
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
			<button
				class="createTaskButton"
				on:click={() => {
					showModal = true;
					modalType = 'createTask';
				}}>+ CREATE TASK</button
			>
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
		min-height: calc(100vh - 170px);
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
	.modal-buttons {
		display: flex;
		cursor: pointer;
		justify-content: center;
		gap: 20px;
		margin-top: 10px;
		margin-bottom: 20px;
	}
	.modal-buttons button {
		background-color: #000000;
		color: #ffffff;
		width: 195px;
		height: 40px;
		cursor: pointer;
	}
</style>
