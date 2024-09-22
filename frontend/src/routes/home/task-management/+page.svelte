<script>
	import { onMount } from 'svelte';
	import axios from 'axios';
	import { goto } from '$app/navigation';
	import { authStore, userStore } from '$lib/stores';
	import Modal from '$lib/Modal.svelte';

	const API_URL = import.meta.env.VITE_API_URL;

	let showModal = false;

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

	const createNewApplication = (req, res) => {};

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
		<div>
			<h2>Create Application</h2>
			<div class="form-group">
				<label for="appAcronym">App Acronym</label>
				<input type="text" bind:value={newApp.appAcronym} placeholder="Name" />
			</div>
			<div class="form-group">
				<label for="appRNumber">App R-Number</label>
				<input type="text" bind:value={newApp.appRNumber} placeholder="Number" />
			</div>
			<div class="form-group">
				<label for="appDesc">App Description</label>
				<textarea bind:value={newApp.appDesc} placeholder="Description" />
			</div>
			<div class="form-group">
				<label for="appStartDate">Start Date</label>
				<input type="date" bind:value={newApp.appStartDate} />
			</div>
			<div class="form-group">
				<label for="appEndDate">End Date</label>
				<input type="date" bind:value={newApp.appEndDate} />
			</div>
			<div class="form-group">
				<label for="appPermitCreate">App Permit Create</label>
				<input type="text" bind:value={newApp.appPermitCreate} placeholder="Group" />
			</div>
			<div class="form-group">
				<label for="appPermitOpen">App Permit Open</label>
				<input type="text" bind:value={newApp.appPermitOpen} placeholder="Group" />
			</div>
			<div class="form-group">
				<label for="appPermitToDo">App Permit ToDo</label>
				<input type="text" bind:value={newApp.appPermitToDo} placeholder="Group" />
			</div>
			<div class="form-group">
				<label for="appPermitDoing">App Permit Doing</label>
				<input type="text" bind:value={newApp.appPermitDoing} placeholder="Group" />
			</div>
			<div class="form-group">
				<label for="appPermitDone">App Permit Done</label>
				<input type="text" bind:value={newApp.appPermitDone} placeholder="Group" />
			</div>
			<div class="createApp-buttons">
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
<div class="applications-board">
	<div class="applications-card">
		<div class="applications-card-content">
			<h3>App Name</h3>
			<p>Task flow</p>
		</div>
		<div class="applications-card-content">
			<h3>App Description</h3>
			<p>
				fdsfjknsfjnsfnsknfksnfksnfksnkfnskfnsknfksnfksnfksnfksnkfsn
				fdsfjknsfjnsfnsknfksnfksnfksnkfnskfnsknfksnfksnfksnfksnkfsn
				fdsfjknsfjnsfnsknfksnfksnfksnkfnskfnsknfksnfksnfksnfksnkfsn
				fdsfjknsfjnsfnsknfksnfksnfksnkfnskfnsknfksnfksnfksnfksnkfsn
			</p>
		</div>
		<div class="applications-card-content">
			<h3>Start Date</h3>
			<p>05/07/2024</p>
		</div>
		<div class="applications-card-content">
			<h3>End Date</h3>
			<p>11/07/2024</p>
		</div>
	</div>
	<div class="applications-card">
		<div class="applications-card-content">
			<h3>App Name</h3>
			<p>Task flow</p>
		</div>
		<div class="applications-card-content">
			<h3>App Description</h3>
			<p>
				fdsfjknsfjnsfnsknfksnfksnfksnkfnskfnsknfksnfksnfksnfksnkfsn
				fdsfjknsfjnsfnsknfksnfksnfksnkfnskfnsknfksnfksnfkseeeeeeeeeeeeeeeddddeeeeeeeeeeeeenfksnkfsn
				fdsfjknsfjnsfnsknfksnfksnfksnkfnskfnsknfksnfksnfksnfksnkfsn
				fdsfjknsfjnsfnsknfksnfksnfksnkfnskfnsknfksnfksnfksnfksnkfsn
			</p>
		</div>
		<div class="applications-card-content">
			<h3>Start Date</h3>
			<p>05/07/2024</p>
		</div>
		<div class="applications-card-content">
			<h3>End Date</h3>
			<p>11/07/2024</p>
		</div>
	</div>
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
	form h2 {
		text-align: center;
	}
	.form-group {
		display: flex;
		/* align-items: center; */
		/* flex-direction: column; */
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
	.createApp-buttons {
		display: flex;
		cursor: pointer;
		justify-content: center;
		gap: 20px;
		margin-top: 10px;
		margin-bottom: 20px;
	}
	.createApp-buttons button {
		background-color: #000000;
		color: #ffffff;
		width: 195px;
		height: 40px;
	}
	.applications-board {
		display: flex;
		justify-content: space-evenly;
		margin-top: 20px;
	}
	.applications-card {
		background-color: #d8d8d8;
		width: 600px;
		height: 200px;
		padding: 10px;
		overflow: hidden;
	}
	.applications-card:hover {
		box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}
	.applications-card-content {
		display: flex;
		font-size: 0.7em;
	}
	.applications-card-content h3 {
		width: 111px;
	}
	.applications-card-content p {
		width: 440px;
		overflow-wrap: break-word;
	}
</style>
