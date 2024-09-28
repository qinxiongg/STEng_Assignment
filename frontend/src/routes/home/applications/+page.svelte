<script>
	import { onMount } from 'svelte';
	import axios from 'axios';
	import { goto } from '$app/navigation';
	import { authStore, userStore, kanbanAppAcronym, kanbanAppRNumber } from '$lib/stores';
	import Modal from '$lib/Modal.svelte';
	import FaEdit from 'svelte-icons/fa/FaEdit.svelte';
	import { customError, handleError, customAlert } from '$lib/errorHandler';

	const API_URL = import.meta.env.VITE_API_URL;

	let showModal = false;
	let modalType = null;

	let applications = [];
	let allUserGroups = [];
	let selectedAppToEdit = null;
	let createAppStartDate = null;
	let createAppEndDate = null;

	let newApplication = {
		App_Acronym: null,
		App_Rnumber: null,
		App_Description: null,
		App_startDate: null,
		App_endDate: null,
		App_permit_Create: null,
		App_permit_Open: null,
		App_permit_toDoList: null,
		App_permit_Doing: null,
		App_permit_Done: null
	};

	function editApplicationModal(app) {
		selectedAppToEdit = { ...app }; // clone the app object clicked
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
		} catch (error) {
			console.error('Error at checkIsAdmin:', error);
		}
	}

	async function getAllGroups() {
		try {
			const response = await axios.get(`${API_URL}/getAllGroups`, { withCredentials: true });

			if (response.status === 200) {
				allUserGroups = response.data;
			}
		} catch (error) {
			if (error instanceof axios.AxiosError) {
				handleError(error.response.data);
			} else {
				customError('An error occurred when retrieving all user groups');
			}
		}
	}

	async function createApplication() {
		try {
			// convert date to epoch timestamp
			const startDate = new Date(createAppStartDate);
			newApplication.App_startDate = Math.floor(startDate.getTime() / 1000);

			const endDate = new Date(createAppEndDate);
			newApplication.App_endDate = Math.floor(endDate.getTime() / 1000);

			console.log(newApplication);
			const response = await axios.post(`${API_URL}/createApplication`, newApplication, {
				withCredentials: true
			});

			if (response.status === 201) {
				// reset object values back to null
				for (let key in newApplication) {
					newApplication[key] = null;
				}
				createAppStartDate = null;
				createAppEndDate = null;

				showModal = false;
				getUserApplicationByPermit();
				customAlert(response.data.success);
			}
		} catch (error) {
			if (error instanceof axios.AxiosError) {
				handleError(error.response.data);
			} else {
				customError('An error occurred when creating application.');
			}
		}
	}

	async function editApplication() {
		// convert date to epoch timestamp
		const startDate = new Date(selectedAppToEdit.App_startDate);
		selectedAppToEdit.App_startDate = Math.floor(startDate.getTime() / 1000);

		const endDate = new Date(selectedAppToEdit.App_endDate);
		selectedAppToEdit.App_endDate = Math.floor(endDate.getTime() / 1000);

		console.log(selectedAppToEdit);

		try {
			const response = await axios.put(`${API_URL}/editApplication`, selectedAppToEdit, {
				withCredentials: true
			});

			if (response.status === 200) {
				customAlert(response.data.success);
				editApplicationModal(app);
				getUserApplicationByPermit();
			}
		} catch (error) {
			if (error instanceof axios.AxiosError) {
				handleError(error.response.data);
			} else {
				customError('An error occurred when creating application.');
			}
		}
	}

	async function getUserApplicationByPermit() {
		try {
			const response = await axios.post(
				`${API_URL}/getUserApplicationByPermit`,
				{ username: $userStore },
				{ withCredentials: true }
			);

			if (response.status === 200) {
				applications = response.data;

				for (let i = 0; i < applications.length; i++) {
					const app = applications[i];

					// Convert from epoch to yyyy-mm-dd
					app.App_startDate = new Date(app.App_startDate * 1000);
					const startYear = app.App_startDate.getFullYear();
					const startMonth = String(app.App_startDate.getMonth() + 1).padStart(2, '0');
					const startDay = String(app.App_startDate.getDate()).padStart(2, '0');
					app.App_startDate = `${startYear}-${startMonth}-${startDay}`;

					app.App_endDate = new Date(app.App_endDate * 1000);
					const endYear = app.App_endDate.getFullYear();
					const endMonth = String(app.App_endDate.getMonth() + 1).padStart(2, '0');
					const endDay = String(app.App_endDate.getDate()).padStart(2, '0');

					app.App_endDate = `${endYear}-${endMonth}-${endDay}`;
				}
			}
		} catch (error) {
			if (error instanceof axios.AxiosError) {
				handleError(error.response);
			} else {
				customError('An error occurred when showing applications.');
			}
		}
	}

	onMount(async () => {
		await checkIsAdmin();
		await getUserApplicationByPermit();
		await getAllGroups();
	});
</script>

<Modal bind:showModal>
	{#if modalType === 'createApplication'}
		<form on:submit|preventDefault={createApplication}>
			<div>
				<h2>Create Application</h2>
				<div class="form-group">
					<label for="App_Acronym">App Acronym</label>
					<input type="text" bind:value={newApplication.App_Acronym} placeholder="Name" />
				</div>
				<div class="form-group">
					<label for="App_Rnumber">App R-Number</label>
					<input
						type="text"
						bind:value={newApplication.App_Rnumber}
						placeholder="Number"
					/>
				</div>
				<div class="form-group">
					<label for="App_Description">App Description</label>
					<textarea
						bind:value={newApplication.App_Description}
						placeholder="Description"
					/>
				</div>
				<div class="form-group">
					<label for="App_startDate">Start Date</label>
					<input type="date" bind:value={createAppStartDate} />
				</div>
				<div class="form-group">
					<label for="App_endDate">End Date</label>
					<input type="date" bind:value={createAppEndDate} />
				</div>
				<div class="form-group">
					<label for="App_permit_Create">App Permit Create</label>
					<select bind:value={newApplication.App_permit_Create}>
						{#each allUserGroups as group}
							<option value={group.usergroup}>{group.usergroup}</option>
						{/each}
					</select>
				</div>
				<div class="form-group">
					<label for="App_permit_Open">App Permit Open</label>
					<select bind:value={newApplication.App_permit_Open}>
						{#each allUserGroups as group}
							<option value={group.usergroup}>{group.usergroup}</option>
						{/each}
					</select>
				</div>
				<div class="form-group">
					<label for="App_permit_toDoList">App Permit ToDo</label>
					<select bind:value={newApplication.App_permit_toDoList}>
						{#each allUserGroups as group}
							<option value={group.usergroup}>{group.usergroup}</option>
						{/each}
					</select>
				</div>
				<div class="form-group">
					<label for="App_permit_Doing">App Permit Doing</label>
					<select bind:value={newApplication.App_permit_Doing}>
						{#each allUserGroups as group}
							<option value={group.usergroup}>{group.usergroup}</option>
						{/each}
					</select>
				</div>
				<div class="form-group">
					<label for="App_permit_Done">App Permit Done</label>
					<select bind:value={newApplication.App_permit_Done}>
						{#each allUserGroups as group}
							<option value={group.usergroup}>{group.usergroup}</option>
						{/each}
					</select>
				</div>
				<div class="modal-buttons">
					<button type="submit">Create Application</button>
					<button
						type="button"
						on:click={() => {
							showModal = false;
						}}>Cancel</button
					>
				</div>
			</div>
		</form>
	{:else if modalType === 'editApplication'}
		<form on:submit|preventDefault={editApplication}>
			<div>
				<h2>Edit Application</h2>
				<div class="form-group">
					<label for="App_Acronym">App Acronym</label>
					<input bind:value={selectedAppToEdit.App_Acronym} placeholder="Name" readonly />
				</div>
				<div class="form-group">
					<label for="App_Rnumber">App R-Number</label>
					<input
						type="text"
						bind:value={selectedAppToEdit.App_Rnumber}
						placeholder="Number"
					/>
				</div>
				<div class="form-group">
					<label for="App_Description">App Description</label>
					<textarea
						bind:value={selectedAppToEdit.App_Description}
						placeholder="Description"
					/>
				</div>
				<div class="form-group">
					<label for="App_startDate">Start Date</label>
					<input type="date" bind:value={selectedAppToEdit.App_startDate} />
				</div>
				<div class="form-group">
					<label for="App_endDate">End Date</label>
					<input type="date" bind:value={selectedAppToEdit.App_endDate} />
				</div>
				<div class="form-group">
					<label for="App_permit_Create">App Permit Create</label>
					<select bind:value={selectedAppToEdit.App_permit_Create}>
						{#each allUserGroups as group}
							<option value={group.usergroup}>{group.usergroup}</option>
						{/each}
					</select>
				</div>
				<div class="form-group">
					<label for="App_permit_Open">App Permit Open</label>
					<select bind:value={selectedAppToEdit.App_permit_Open}>
						{#each allUserGroups as group}
							<option value={group.usergroup}>{group.usergroup}</option>
						{/each}
					</select>
				</div>
				<div class="form-group">
					<label for="App_permit_toDoList">App Permit ToDo</label>
					<select bind:value={selectedAppToEdit.App_permit_toDoList}>
						{#each allUserGroups as group}
							<option value={group.usergroup}>{group.usergroup}</option>
						{/each}
					</select>
				</div>
				<div class="form-group">
					<label for="App_permit_Doing">App Permit Doing</label>
					<select bind:value={selectedAppToEdit.App_permit_Doing}>
						{#each allUserGroups as group}
							<option value={group.usergroup}>{group.usergroup}</option>
						{/each}
					</select>
				</div>
				<div class="form-group">
					<label for="App_permit_Done">App Permit Done</label>
					<select bind:value={selectedAppToEdit.App_permit_Done}>
						{#each allUserGroups as group}
							<option value={group.usergroup}>{group.usergroup}</option>
						{/each}
					</select>
				</div>
				<div class="modal-buttons">
					<button type="submit">Edit Application</button>
					<button
						type="button"
						on:click={() => {
							showModal = false;
						}}>Cancel</button
					>
				</div>
			</div>
		</form>
	{/if}
</Modal>

<div class="middle-container">
	<h1 class="middle-left">Applications</h1>
	<button
		class="middle-right"
		on:click={() => {
			showModal = true;
			modalType = 'createApplication';
			for (let key in newApplication) {
				newApplication[key] = null;
			}
		}}>+ CREATE APP</button
	>
</div>
<div class="application-container">
	{#each applications as app}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="application-card"
			on:click={() => {
				kanbanAppAcronym.set(app.App_Acronym);
				kanbanAppRNumber.set(app.App_Acronym);
				goto('applications/kanban');
			}}
		>
			<button
				class="editApplication-Button"
				on:click|stopPropagation={() => {
					showModal = true;
					modalType = 'editApplication';
					for (let key in newApplication) {
						newApplication[key] = null;
					}
					editApplicationModal(app);
				}}><FaEdit /></button
			>
			<div class="application-card-content">
				<h3>App Name</h3>
				<p>{app.App_Acronym}</p>
			</div>
			<div class="application-card-content">
				<h3>App Description</h3>
				<p class="card-text">
					{app.App_Description}
				</p>
			</div>
			<div class="application-card-content">
				<h3>Start Date</h3>
				<p>{app.App_startDate}</p>
			</div>
			<div class="application-card-content">
				<h3>End Date</h3>
				<p>{app.App_endDate}</p>
			</div>
		</div>
	{/each}
</div>

<!-- {/if} -->

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
	form h2 {
		text-align: center;
		font-size: 1.3em;
	}
	.form-group {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.form-group label {
		margin: 10px 20px;
		font-weight: bold;
		width: 190px;
		font-size: 0.9em;
	}
	.form-group input,
	select {
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
	.form-group textarea {
		margin: 10px 20px;
		background-color: #dadada;
		border: transparent;
		height: 80px;
		width: 100%;
		padding-top: 10px;
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
	.application-container {
		display: flex;
		/* justify-content: space-evenly; */
		justify-content: center;
		margin-top: 10px;
		flex-wrap: wrap;
		gap: 3rem;
	}
	.application-card {
		background-color: #d8d8d8;
		/* width: 650px; */
		width: 40%;
		height: 200px;
		padding: 20px;
		position: relative;
		border-radius: 5px;
		cursor: pointer;
	}
	.application-card:hover {
		box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
	}
	.application-card-content {
		display: flex;
		font-size: 0.7em;
	}
	.application-card-content h3 {
		width: 120px;
	}
	.card-text {
		max-width: 80%;
		overflow-wrap: break-word;
		overflow-y: auto;
		max-height: 70px;
	}
	.editApplication-Button {
		width: 25px;
		height: 25px;
		padding: 0px;
		background-color: transparent;
		border: none;
		cursor: pointer;
		position: absolute;
		top: 20px;
		right: 20px;
	}
</style>
