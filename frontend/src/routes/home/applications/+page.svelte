<script>
	import { onMount } from 'svelte';
	import axios from 'axios';
	// import { goto } from '$app/navigation';
	import { authStore, userStore } from '$lib/stores';
	import Modal from '$lib/Modal.svelte';
	import FaEdit from 'svelte-icons/fa/FaEdit.svelte';
	import { customError, handleError, customAlert } from '$lib/errorHandler';

	const API_URL = import.meta.env.VITE_API_URL;

	let showModal = false;
	let modalType = null;

	let applications = [];
	let selectedAppToEdit = null;
	let createAppStartDate = null;
	let createAppEndDate = null;

	let newApplication = {
		appAcronym: null,
		appRNumber: null,
		appDescription: null,
		appStartDate: null,
		appEndDate: null,
		appPermitCreate: null,
		appPermitOpen: null,
		appPermitToDo: null,
		appPermitDoing: null,
		appPermitDone: null
	};


	function editApplicationModal(app) {
		selectedAppToEdit = { ...app }; // clone the app object clicked
		console.log("selectedapp", selectedAppToEdit);

		// Convert to YYYY/MM/DD for use as a placeholder in date input
		// const startDateString = selectedAppToEdit.appStartDate;
		const [startDay, startMonth, startYear] = selectedAppToEdit.appStartDate.split('/');
		selectedAppToEdit.appStartDate = `${startYear}-${startMonth}-${startDay}`;

		// const EndDateString = selectedAppToEdit.appEndDate;
		const [endDay, endMonth, endYear] = selectedAppToEdit.appEndDate.split('/');
		selectedAppToEdit.appEndDate = `${endYear}-${endMonth}-${endDay}`;
		console.log("selectedapp2", selectedAppToEdit);

		
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

	async function createApplication() {
		try {
			// convert date object to yyyy-mm-dd
			const startDate = new Date(createAppStartDate);
			const startYear = startDate.getFullYear();
			const startMonth = String(startDate.getMonth() + 1).padStart(2, '0');
			const startDay = String(startDate.getDate()).padStart(2,'0');

			create
			
			// convert date to epoch timestamp
			// const startDate = new Date(createAppStartDate);
			// newApplication.appStartDate = Math.floor(startDate.getTime() / 1000);

			// const endDate = new Date(createAppEndDate);
			// newApplication.appEndDate = Math.floor(endDate.getTime() / 1000);

			const response = await axios.post(`${API_URL}/createApplication`, newApplication, {
				withCredentials: true
			});

			if (response.status === 201) {
				// reset object values back to null
				for (let key in newApplication) {
					newApplication[key] = null;
				}
				showAllApplications();
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

	// async function editApplication(){
	// 	try{
	// 		const response = await axios.put(`${API_URL}/editApplication`, selectedAppToEdit)
	// 	}
	// }

	async function editApplication() {}

	async function showAllApplications() {
		try {
			const response = await axios.get(`${API_URL}/applications`, { withCredentials: true });

			if (response.status === 200) {
				applications = response.data;

				for (let i = 0; i < applications.length; i++) {
					const app = applications[i];

					app.appStartDate = new Date(app.appStartDate * 1000);
					app.appStartDate = app.appStartDate.toLocaleDateString();

					app.appEndDate = new Date(app.appEndDate * 1000);
					app.appEndDate = app.appEndDate.toLocaleDateString();

					// Convert the input date to DD/MM/YYYY format
					const [startMonth, startDay, startYear] = app.appStartDate.split('/');
					app.appStartDate = `${startDay}/${startMonth}/${startYear}`;

					const [endMonth, endDay, endYear] = app.appEndDate.split('/');
					app.appEndDate = `${endDay}/${endMonth}/${endYear}`;

					
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
		await showAllApplications();
	});
</script>

<Modal bind:showModal>
	{#if modalType === 'createApplication'}
		<form on:submit|preventDefault={createApplication}>
			<div>
				<h2>Create Application</h2>
				<div class="form-group">
					<label for="appAcronym">App Acronym</label>
					<input type="text" bind:value={newApplication.appAcronym} placeholder="Name" />
				</div>
				<div class="form-group">
					<label for="appRNumber">App R-Number</label>
					<input
						type="text"
						bind:value={newApplication.appRNumber}
						placeholder="Number"
					/>
				</div>
				<div class="form-group">
					<label for="appDescription">App Description</label>
					<textarea
						bind:value={newApplication.appDescription}
						placeholder="Description"
					/>
				</div>
				<div class="form-group">
					<label for="appStartDate">Start Date</label>
					<input type="date" bind:value={createAppStartDate} />
				</div>
				<div class="form-group">
					<label for="appEndDate">End Date</label>
					<input type="date" bind:value={createAppEndDate} />
				</div>
				<div class="form-group">
					<label for="appPermitCreate">App Permit Create</label>
					<input
						type="text"
						bind:value={newApplication.appPermitCreate}
						placeholder="Group"
					/>
				</div>
				<div class="form-group">
					<label for="appPermitOpen">App Permit Open</label>
					<input
						type="text"
						bind:value={newApplication.appPermitOpen}
						placeholder="Group"
					/>
				</div>
				<div class="form-group">
					<label for="appPermitToDo">App Permit ToDo</label>
					<input
						type="text"
						bind:value={newApplication.appPermitToDo}
						placeholder="Group"
					/>
				</div>
				<div class="form-group">
					<label for="appPermitDoing">App Permit Doing</label>
					<input
						type="text"
						bind:value={newApplication.appPermitDoing}
						placeholder="Group"
					/>
				</div>
				<div class="form-group">
					<label for="appPermitDone">App Permit Done</label>
					<input
						type="text"
						bind:value={newApplication.appPermitDone}
						placeholder="Group"
					/>
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
					<label for="appAcronym">App Acronym</label>
					<input bind:value={selectedAppToEdit.appAcronym} placeholder="Name" readonly />
				</div>
				<div class="form-group">
					<label for="appRNumber">App R-Number</label>
					<input
						type="text"
						bind:value={selectedAppToEdit.appRNumber}
						placeholder="Number"
					/>
				</div>
				<div class="form-group">
					<label for="appDescription">App Description</label>
					<textarea
						bind:value={selectedAppToEdit.appDescription}
						placeholder="Description"
					/>
				</div>
				<div class="form-group">
					<label for="appStartDate">Start Date</label>
					<input type="date" bind:value={selectedAppToEdit.appStartDate} />
				</div>
				<div class="form-group">
					<label for="appEndDate">End Date</label>
					<input type="date" bind:value={selectedAppToEdit.appEndDate} />
				</div>
				<div class="form-group">
					<label for="appPermitCreate">App Permit Create</label>
					<input
						type="text"
						bind:value={selectedAppToEdit.appPermitCreate}
						placeholder="Group"
					/>
				</div>
				<div class="form-group">
					<label for="appPermitOpen">App Permit Open</label>
					<input
						type="text"
						bind:value={selectedAppToEdit.appPermitOpen}
						placeholder="Group"
					/>
				</div>
				<div class="form-group">
					<label for="appPermitToDo">App Permit ToDo</label>
					<input
						type="text"
						bind:value={selectedAppToEdit.appPermitToDo}
						placeholder="Group"
					/>
				</div>
				<div class="form-group">
					<label for="appPermitDoing">App Permit Doing</label>
					<input
						type="text"
						bind:value={selectedAppToEdit.appPermitDoing}
						placeholder="Group"
					/>
				</div>
				<div class="form-group">
					<label for="appPermitDone">App Permit Done</label>
					<input
						type="text"
						bind:value={selectedAppToEdit.appPermitDone}
						placeholder="Group"
					/>
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
		<div class="application-card">
			<button
				class="editApplication-Button"
				on:click={() => {
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
				<p>{app.appAcronym}</p>
			</div>
			<div class="application-card-content">
				<h3>App Description</h3>
				<p class="card-text">
					{app.appDescription}
				</p>
			</div>
			<div class="application-card-content">
				<h3>Start Date</h3>
				<p>{app.appStartDate}</p>
			</div>
			<div class="application-card-content">
				<h3>End Date</h3>
				<p>{app.appEndDate}</p>
			</div>
		</div>
	{/each}
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
	form h2 {
		text-align: center;
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
