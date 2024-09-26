<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import axios from 'axios';
	import { authStore, userStore, kanbanAppAcronym, kanbanAppRNumber } from '$lib/stores';
	import { customError, handleError, customAlert } from '$lib/errorHandler';
	import Modal from '$lib/Modal.svelte';

	const API_URL = import.meta.env.VITE_API_URL;

	let showModal = false;
	let modalType = null;

	let createPlanStartDate = null;
	let createPlanEndDate = null;

	let newPlan = {
		Plan_MVP_name: null,
		Plan_app_Acronym: $kanbanAppAcronym,
		Plan_startDate: null,
		Plan_endDate: null,
		Plan_color: '#000000'
	};

	let newTask = {
		Task_id: `${$kanbanAppAcronym}_${$kanbanAppRNumber}`,
		Task_plan: null,
		Task_app_Acronym: null,
		Task_name: null,
		Task_description: null,
		Task_notes: null,
		Task_state: "Open",
		Task_creator: `${$userStore}`,
		Task_owner: `${$userStore}`,
		Task_createDate: null
	};

	let plansByAppAcronym = [];

	function getCurrentDate() {
		let currentDate = new Date();

		let dateDisplay = {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		};

		let formattedDate = currentDate.toLocaleDateString('en-GB', dateDisplay);
		newTask.Task_createDate = formattedDate;
	}

	async function createPlan() {
		try {
			// convert date to epoch timestamp
			const startDate = new Date(createPlanStartDate);
			newPlan.Plan_startDate = Math.floor(startDate.getTime() / 1000);

			const endDate = new Date(createPlanEndDate);
			newPlan.Plan_endDate = Math.floor(endDate.getTime() / 1000);

			const response = await axios.post(`${API_URL}/createPlan`, newPlan, {
				withCredentials: true
			});

			if (response.status === 201) {
				// reset object values back to default
				for (let key in newPlan) {
					if (key !== ('Plan_app_Acronym' || 'Plan_color')) {
						newPlan[key] = null;
					}
					newPlan['Plan_color'] = '#000000';
				}
				createPlanStartDate = null;
				createPlanEndDate = null;
				customAlert(response.data.success);
			}
		} catch (error) {
			if (error instanceof axios.AxiosError) {
				handleError(error.response.data);
			} else {
				console.error(error);
				customError('An error occurred at create plan.');
			}
		}
	}

	async function getApplicationPlans() {
		try {
			const response = await axios.get(
				`${API_URL}/getApplicationPlans/${$kanbanAppAcronym}`,
				{ withCredentials: true }
			);
			if (response.status === 200) {
				plansByAppAcronym = response.data;
			}
		} catch (error) {
			if (error instanceof axios.AxiosError) {
				handleError(error.response.data);
			} else {
				console.error(error);
				customError('An error occurred at showing plans by app acronym.');
			}
		}
	}

	async function createTask() {}

	onMount(async () => {
		if ($kanbanAppAcronym === '' || $kanbanAppRNumber === '') {
			goto('/home/applications');
		}
	});
</script>

<Modal bind:showModal>
	{#if modalType === 'createPlan'}
		<div>
			<form on:submit|preventDefault={createPlan}>
				<div>
					<h2>Create Plan</h2>
					<div class="form-group">
						<label for="Plan_app_Acronym">App Acronym</label>
						<input
							type="text"
							bind:value={newPlan.Plan_app_Acronym}
							placeholder="Name"
							readonly
						/>
					</div>
					<div class="form-group">
						<label for="Plan_MVP_name">Plan Name</label>
						<input type="text" bind:value={newPlan.Plan_MVP_name} placeholder="Name" />
					</div>
					<div class="form-group">
						<label for="createPlanStartDate">Start Date</label>
						<input type="date" bind:value={createPlanStartDate} />
					</div>
					<div class="form-group">
						<label for="createPlanEndDate">End Date</label>
						<input type="date" bind:value={createPlanEndDate} />
					</div>
					<div class="form-group">
						<label for="Plan_color">Color</label>
						<input type="color" bind:value={newPlan.Plan_color} />
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
		</div>
	{:else if modalType === 'createTask'}
		<div>
			<form on:submit|preventDefault={createTask}>
				<h3>{$kanbanAppAcronym}_{$kanbanAppRNumber}</h3>
				<div class="createTask-container">
					<div class="createTask-left">
						<div class="form-group">
							<label for="Task_id">Task ID</label>
							<input type="text" bind:value={newTask.Task_id} readonly />
						</div>
						<div class="form-group">
							<label for="Task_name">Task Name</label>
							<input type="text" bind:value={newTask.Task_name} />
						</div>
						<div class="form-group">
							<label for="Task_description">Task Description</label>
							<input type="text" bind:value={newTask.Task_description} />
						</div>
						<div class="form-group">
							<label for="Task_plan">Plan Name</label>
							<select bind:value={newTask.Task_plan}>
								{#each plansByAppAcronym as plan}
									<option value={plan.Plan_MVP_name}>{plan.Plan_MVP_name}</option>
								{/each}
							</select>
							<input type="text" bind:value={newTask.Task_plan} readonly />
						</div>
						<div class="form-group">
							<label for="Task_state">Task State</label>
							<input type="text" bind:value={newTask.Task_state} readonly />
						</div>
						<div class="form-group">
							<label for="Task_creator">Task Creator</label>
							<input type="text" bind:value={newTask.Task_creator} readonly />
						</div>
						<div class="form-group">
							<label for="Task_owner">Task Owner</label>
							<input type="text" bind:value={newTask.Task_owner} readonly />
						</div>
						<div class="form-group">
							<label for="Task_createDate">Task Create Date</label>
							<input type="text" bind:value={newTask.Task_createDate} readonly />
						</div>
					</div>
					<div class="createTask-right">
						<div class="createTask-notes"><b>Notes</b></div>
						<textarea bind:value={newTask.Task_notes} placeholder="Comments" />
					</div>
				</div>

				<div class="modal-buttons">
					<button type="submit">Create Task</button>
					<button
						type="button"
						on:click={() => {
							showModal = false;
						}}>Cancel</button
					>
				</div>
			</form>
		</div>
	{/if}
</Modal>

<div class="middle-container">
	<h1 class="middle-left">Task Management Board: {$kanbanAppAcronym}</h1>
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
					getCurrentDate();
					getApplicationPlans();
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
	.createTask-container {
		display: flex;
		justify-content: center;
		width: 1000px;
	}
	h3 {
		text-align: center;
		font-size: 1em;
		background-color: #000000;
		color: #ffffff;
	}
	.createTask-right textarea {
		width: 500px;
		height: 100px;
	}
	.createTask-notes {
		width: 500px;
		height: 300px;
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
		font-size: 1em;
	}
	.form-group {
		display: flex;
		justify-content: space-between;
	}
	.form-group label {
		margin: 10px 20px;
		width: 120px;
		font-weight: bold;
		font-size: 0.8em;
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
	input[readonly] {
		background-color: #ffffff;
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
