<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import axios from 'axios';
	import { authStore, userStore, kanbanAppAcronym } from '$lib/stores';
	import {
		customError,
		handleError,
		alertSuccess,
		handleUnauthorizedError
	} from '$lib/errorHandler';
	import Modal from '$lib/Modal.svelte';

	const API_URL = import.meta.env.VITE_API_URL;

	let globalUsername;

	let showModal = false;
	let modalType = null;

	let createPlanStartDate = null;
	let createPlanEndDate = null;

	let currentRNumber = null;
	let plansByAppAcronym = [];
	let createTaskDateDisplay = null;

	let selectedTask = {};
	let tempTask;
	let newTaskNote = '';

	let FormattedEpochToDate = null;

	let trackTaskPlanChange = false;
	let originalTaskPlan;

	let statechangeaction;
	let stateBeforeStateChange = null;
	let stateAfterStateChange = null;

	let newPlan = {
		Plan_MVP_name: null,
		Plan_app_Acronym: $kanbanAppAcronym,
		Plan_startDate: null,
		Plan_endDate: null,
		Plan_color: '#000000'
	};

	let newTask = {};

	let tasks = [];
	let openTasks = [];
	let toDoTasks = [];
	let doingTasks = [];
	let doneTasks = [];
	let closedTasks = [];

	let appPermits = {};
	let userGroupForCheckingPermit = [];

	// $: {
	// 	console.log('user', userGroupForCheckingPermit);
	// 	console.log('permit', appPermits.App_permit_Open);
	// }

	const handleDisableNoteInput = (taskstate) => {
		if (taskstate === 'open') {
			return userGroupForCheckingPermit.includes(appPermits.App_permit_Open);
		} else if (taskstate === 'todo') {
			return userGroupForCheckingPermit.includes(appPermits.App_permit_toDoList);
		} else if (taskstate === 'doing') {
			return userGroupForCheckingPermit.includes(appPermits.App_permit_Doing);
		} else if (taskstate === 'done') {
			return userGroupForCheckingPermit.includes(appPermits.App_permit_Done);
		} else if (taskstate === 'closed') {
			return false;
		}
	};

	// Disable save changes and close task button if plan is changed for tasks at "Done"
	const handleTaskPlanChange = () => {
		trackTaskPlanChange =
			originalTaskPlan !== selectedTask.Task_plan && selectedTask.Task_state === 'done';
	};

	function getCurrentDate() {
		const currentDate = new Date();

		// Get current date to assign to Task_createDate
		const startDate = currentDate;
		newTask.Task_createDate = Math.floor(startDate.getTime() / 1000);

		// convert current date to date string for display at create task modal
		let dateDisplay = {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		};

		createTaskDateDisplay = currentDate.toLocaleDateString('en-GB', dateDisplay);
	}

	// when task is clicked
	const handleClickOnTask = (task) => {
		showModal = true;
		selectedTask = task;
		modalType = 'updateTask';
	};

	// convert selectedtask create date to date string for display
	const convertEpochToDate = () => {
		let TaskCreateDateDisplay = new Date(selectedTask.Task_createDate * 1000);

		// convert current date to date string for display at create task modal
		let dateDisplay = {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		};

		FormattedEpochToDate = TaskCreateDateDisplay.toLocaleDateString('en-GB', dateDisplay);
	};

	const appendNewTaskNotes = (input) => {
		const currentDate = new Date();

		const day = String(currentDate.getDate()).padStart(2, '0');
		const month = String(currentDate.getMonth() + 1).padStart(2, '0');
		const year = currentDate.getFullYear();

		let timestampDate = `${day}/${month}/${year}`;

		// if true then append state change notes
		if (input === 'state change') {
			// append task notes when task state changes
			selectedTask.Task_notes =
				`Date: ${timestampDate} \nCommented By: ${globalUsername}\n${newTaskNote}\n\n[Task State changed from ${stateBeforeStateChange} to ${selectedTask.Task_state}]\n\n###################################\n` +
				selectedTask.Task_notes;
			newTaskNote = '';
		} else if (input === 'new notes') {
			selectedTask.Task_notes =
				`Date: ${timestampDate} \nCommented By: ${globalUsername}\n${newTaskNote}\n\n [Task State: ${selectedTask.Task_state}]\n\n###################################\n\n` +
				selectedTask.Task_notes;
			newTaskNote = '';
		}
	};

	// task change state and owner logic when task is promoted/demoted
	const updateTaskOwnerAndState = (statechangeaction) => {
		if (selectedTask.Task_state === 'open' && statechangeaction === 'Release') {
			stateBeforeStateChange = 'open';
			selectedTask.Task_owner = globalUsername;
			selectedTask.Task_state = 'todo';
		} else if (selectedTask.Task_state === 'todo' && statechangeaction === 'Take On') {
			stateBeforeStateChange = 'todo';
			selectedTask.Task_owner = globalUsername;
			selectedTask.Task_state = 'doing';
		} else if (selectedTask.Task_state === 'doing' && statechangeaction === 'To Review') {
			stateBeforeStateChange = 'doing';
			stateAfterStateChange = 'done';

			selectedTask.Task_owner = globalUsername;
			selectedTask.Task_state = 'done';
		} else if (selectedTask.Task_state === 'doing' && statechangeaction === 'Forfeit Task') {
			stateBeforeStateChange = 'doing';
			selectedTask.Task_state = 'todo';
		} else if (selectedTask.Task_state === 'done' && statechangeaction === 'Close Task') {
			stateBeforeStateChange = 'done';
			selectedTask.Task_owner = globalUsername;
			selectedTask.Task_state = 'closed';
		} else if (selectedTask.Task_state === 'done' && statechangeaction === 'Reject Task') {
			stateBeforeStateChange = 'done';
			selectedTask.Task_state = 'doing';
		}
	};

	const createPlan = async () => {
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

				// fetch application plans
				getApplicationPlans();

				alertSuccess(response.data.success);
			}
		} catch (error) {
			if (error instanceof axios.AxiosError) {
				handleError(error.response.data);
			} else {
				console.error(error);
				customError('An error occurred at create plan.');
			}
		}
	};

	const getApplicationPlans = async () => {
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
	};

	const createTask = async () => {
		try {
			// check usergroup verification with app permit before executing
			// if(!userGroupForCheckingPermit.includes(appPermits.App_permit_Create)) {
			// 	// handleUnauthorizedError();

			// }

			const response = await axios.post(`${API_URL}/createTask`, newTask, {
				withCredentials: true
			});

			if (response.status === 200) {
				showModal = false;
				alertSuccess(response.data.success);
				await getAllAppTasks();
				getAppRNumber();

				newTask = {
					Task_id: `${$kanbanAppAcronym}_${currentRNumber}`,
					Task_plan: null,
					Task_app_Acronym: $kanbanAppAcronym,
					Task_name: null,
					Task_description: null,
					Task_notes: '',
					Task_state: 'open',
					Task_creator: globalUsername,
					Task_owner: globalUsername,
					Task_createDate: null
				};
			}
		} catch (error) {
			if (error instanceof axios.AxiosError) {
				handleError(error.response.data);
			} else {
				console.error(error);
				customError('An error occurred when creating task.');
			}
		}
	};

	const getAppRNumber = async () => {
		try {
			const response = await axios.get(`${API_URL}/getAppRNumber/${$kanbanAppAcronym}`, {
				withCredentials: true
			});

			if (response.status === 200) {
				currentRNumber = response.data;

				// assign task id Rnumber
				newTask.Task_id = `${$kanbanAppAcronym}_${currentRNumber}`;
			}
		} catch (error) {
			if (error instanceof axios.AxiosError) {
				handleError(error.response.data);
			} else {
				console.error(error);
				customError('An error occurred when retrieving current RNumber.');
			}
		}
	};

	const getAllAppTasks = async () => {
		try {
			const response = await axios.post(
				`${API_URL}/getAllAppTasks`,
				{ App_Acronym: $kanbanAppAcronym },
				{
					withCredentials: true
				}
			);
			if (response.status === 200) {
				tasks = response.data;

				//Filter tasks based on state
				openTasks = tasks.filter((task) => task.Task_state === 'open');
				toDoTasks = tasks.filter((task) => task.Task_state === 'todo');
				doingTasks = tasks.filter((task) => task.Task_state === 'doing');
				doneTasks = tasks.filter((task) => task.Task_state === 'done');
				closedTasks = tasks.filter((task) => task.Task_state === 'closed');
			}
		} catch (error) {
			if (error instanceof axios.AxiosError) {
				handleError(error.response.data);
			} else {
				console.error(error);
				customError('An error occurred when retrieving all tasks.');
			}
		}
	};

	const updateTask = async () => {
		try {
			// if input field is empty then task notes is not updated
			if (!newTaskNote) {
				// customError('Task notes input field is empty');
				return;
			}
			appendNewTaskNotes('new notes');

			const response = await axios.put(
				`${API_URL}/updateTask`,
				{
					Task_id: selectedTask.Task_id,
					Task_plan: selectedTask.Task_plan,
					Task_notes: selectedTask.Task_notes,
					Task_state: selectedTask.Task_state,
					Task_app_Acronym: selectedTask.Task_app_Acronym,
					username: globalUsername
				},
				{ withCredentials: true }
			);

			if (response.status === 200) {
				alertSuccess(response.data.success);
				getAllAppTasks();
				selectedTask.task_plan = null;
			}
		} catch (error) {
			if (error instanceof axios.AxiosError) {
				handleError(error.response.data);
			} else {
				console.error(error);
				customError('An error occurred when updating task.');
			}
		}
	};

	const changeTaskState = async (statechangeaction) => {
		try {
			// Append new task notes when state change occurs
			updateTaskOwnerAndState(statechangeaction);
			appendNewTaskNotes('state change');

			const response = await axios.put(
				`${API_URL}/changeTaskState`,
				{
					Task_id: selectedTask.Task_id,
					Task_state: selectedTask.Task_state,
					Task_plan: selectedTask.Task_plan,
					Task_notes: selectedTask.Task_notes,
					Task_owner: selectedTask.Task_owner,
					Task_app_Acronym: selectedTask.Task_app_Acronym,
					username: globalUsername,
					stateBeforeStateChange: stateBeforeStateChange,
					stateAfterStateChange: stateAfterStateChange
				},
				{ withCredentials: true }
			);

			if (response.status === 200) {
				showModal = false;
				alertSuccess(response.data.success);
				stateBeforeStateChange = null;
				getAllAppTasks();
			}
		} catch (error) {
			if (error instanceof axios.AxiosError) {
				handleError(error.response.data);
			} else {
				console.error(error);
				customError('An error occurred when changing task state.');
			}
		}
	};

	const getAppPermitsAndUserGroup = async () => {
		try {
			const response = await axios.post(
				`${API_URL}/getAppPermitsAndUserGroup`,
				{
					App_Acronym: $kanbanAppAcronym,
					username: globalUsername
				},
				{ withCredentials: true }
			);

			if (response.status === 200) {
				appPermits = response.data.appPermits;
				userGroupForCheckingPermit = response.data.userGroup;
			}
		} catch (error) {
			if (error instanceof axios.AxiosError) {
				handleError(error.response.data);
			} else {
				console.error(error);
				customError('An error occurred when getting app permits and user group.');
			}
		}
	};

	const getCurrentUser = async () => {
		try {
			const response = await axios.get(`${API_URL}/getCurrentUser`, {
				withCredentials: true
			});

			globalUsername = response.data.username;
		} catch (error) {
			handleError(error.response.data);
			console.error('Failed to fetch current user', error);
		}
	};

	onMount(async () => {
		if ($kanbanAppAcronym === '') {
			goto('/home/applications');
		}

		await getCurrentUser();

		newTask = {
			Task_id: `${$kanbanAppAcronym}_${currentRNumber}`,
			Task_plan: null,
			Task_app_Acronym: $kanbanAppAcronym,
			Task_name: null,
			Task_description: null,
			Task_notes: '',
			Task_state: 'open',
			Task_creator: globalUsername,
			Task_owner: globalUsername,
			Task_createDate: null
		};

		await getAppPermitsAndUserGroup();
		console.log(userGroupForCheckingPermit);
		await getAllAppTasks();
		await getApplicationPlans();
		await getAppRNumber();
	});
</script>

<Modal bind:showModal>
	{#if modalType === 'createPlan'}
		<div>
			<form on:submit|preventDefault={createPlan}>
				<div class="createPlan-container">
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
				<h3>{$kanbanAppAcronym}</h3>
				<div class="task-container">
					<div class="createTask-left">
						<div class="task-formgroup">
							<label for="Task_id">Task ID</label>
							<input type="text" bind:value={$kanbanAppAcronym} readonly />
						</div>
						<div class="task-formgroup">
							<label for="Task_name">Task Name</label>
							<input type="text" bind:value={newTask.Task_name} />
						</div>
						<div class="task-formgroup">
							<label for="Task_description">Task Description</label>
							<textarea bind:value={newTask.Task_description} />
						</div>
						<div class="task-formgroup">
							<label for="Task_plan">Plan Name</label>
							<select bind:value={newTask.Task_plan}>
								{#each plansByAppAcronym as plan}
									<option value={plan.Plan_MVP_name}>{plan.Plan_MVP_name}</option>
								{/each}
							</select>
						</div>
						<div class="task-formgroup">
							<label for="Task_state">Task State</label>
							<input type="text" bind:value={newTask.Task_state} readonly />
						</div>
						<div class="task-formgroup">
							<label for="Task_creator">Task Creator</label>
							<input type="text" bind:value={newTask.Task_creator} readonly />
						</div>
						<div class="task-formgroup">
							<label for="Task_owner">Task Owner</label>
							<input type="text" bind:value={newTask.Task_owner} readonly />
						</div>
						<div class="task-formgroup">
							<label for="Task_createDate">Task Create Date</label>
							<input type="text" bind:value={createTaskDateDisplay} readonly />
						</div>
					</div>
					<div class="createTask-right">
						<div class="createTask-notes"><h2>Notes</h2></div>
						<textarea
							class="notes-input"
							bind:value={newTask.Task_notes}
							placeholder="Comments"
						/>
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
	{:else if modalType === 'updateTask'}
		<div>
			<form on:submit|preventDefault={updateTask}>
				<h3>{selectedTask.Task_id}</h3>
				<div class="task-container">
					<div class="createTask-left">
						<div class="task-formgroup">
							<label for="Task_id">Task ID</label>
							<input type="text" bind:value={selectedTask.Task_id} disabled />
						</div>
						<div class="task-formgroup">
							<label for="Task_name">Task Name</label>
							<input type="text" bind:value={selectedTask.Task_name} disabled />
						</div>
						<div class="task-formgroup">
							<label for="Task_description">Task Description</label>
							<textarea bind:value={selectedTask.Task_description} disabled />
						</div>
						<div class="task-formgroup">
							<label for="Task_plan">Plan Name</label>
							{#if (selectedTask.Task_state === 'open' && userGroupForCheckingPermit.includes(appPermits.App_permit_Open)) || (selectedTask.Task_state === 'done' && userGroupForCheckingPermit.includes(appPermits.App_permit_Done))}
								<select
									bind:value={selectedTask.Task_plan}
									on:change={handleTaskPlanChange}
								>
									{#each plansByAppAcronym as plan}
										<option value={plan.Plan_MVP_name}
											>{plan.Plan_MVP_name}</option
										>
									{/each}
								</select>
							{:else}
								<input bind:value={selectedTask.Task_plan} disabled />
							{/if}
						</div>
						<div class="task-formgroup">
							<label for="Task_state">Task State</label>
							<input type="text" bind:value={selectedTask.Task_state} disabled />
						</div>
						<div class="task-formgroup">
							<label for="Task_creator">Task Creator</label>
							<input type="text" bind:value={selectedTask.Task_creator} disabled />
						</div>
						<div class="task-formgroup">
							<label for="Task_owner">Task Owner</label>
							<input type="text" bind:value={selectedTask.Task_owner} disabled />
						</div>
						<div class="task-formgroup">
							<label for="Task_createDate">Task Create Date</label>
							<input type="text" bind:value={FormattedEpochToDate} disabled />
						</div>
					</div>
					<div class="createTask-right">
						<b>Notes</b>
						<div class="createTask-notes">{selectedTask.Task_notes}</div>
						<textarea
							class="notes-input"
							bind:value={newTaskNote}
							placeholder="Comments"
							disabled={!handleDisableNoteInput(selectedTask.Task_state)}
						/>
					</div>
				</div>

				<div class="modal-buttons">
					{#if selectedTask.Task_state == 'open' && userGroupForCheckingPermit.includes(appPermits.App_permit_Open)}
						<button
							type="button"
							style="background-color:#00A400; border:solid #00A400;"
							on:click={() => {
								statechangeaction = 'Release';
								changeTaskState(statechangeaction);
								showModal = false;
							}}>Release Task</button
						>
						<button
							type="submit"
							style="background-color:{trackTaskPlanChange
								? 'grey'
								: '#000000'}; border: solid {trackTaskPlanChange
								? 'grey'
								: '#000000'};">Save Changes</button
						>
					{:else if selectedTask.Task_state == 'todo' && userGroupForCheckingPermit.includes(appPermits.App_permit_toDoList)}
						<button
							type="button"
							style="background-color:#00A400; border:solid #00A400;"
							on:click={async () => {
								statechangeaction = 'Take On';
								changeTaskState(statechangeaction);
								showModal = false;
							}}>Take On</button
						>
						<button
							type="submit"
							style="background-color:{trackTaskPlanChange
								? 'grey'
								: '#000000'}; border: solid {trackTaskPlanChange
								? 'grey'
								: '#000000'};">Save Changes</button
						>
					{:else if selectedTask.Task_state == 'doing' && userGroupForCheckingPermit.includes(appPermits.App_permit_Doing)}
						<button
							type="submit"
							style="background-color:#00A400; border:solid #00A400;"
							on:click={() => {
								statechangeaction = 'To Review';
								changeTaskState(statechangeaction);
								showModal = false;
							}}>To Review</button
						>
						<button
							type="submit"
							style="background-color:#D02929; border:solid #D02929;"
							on:click={() => {
								statechangeaction = 'Forfeit Task';
								changeTaskState(statechangeaction);
							}}>Forfeit Task</button
						>
						<button
							type="submit"
							style="background-color:{trackTaskPlanChange
								? 'grey'
								: '#000000'}; border: solid {trackTaskPlanChange
								? 'grey'
								: '#000000'};">Save Changes</button
						>
					{:else if selectedTask.Task_state == 'done' && userGroupForCheckingPermit.includes(appPermits.App_permit_Done)}
						<button
							type="submit"
							style="background-color:{trackTaskPlanChange ? 'grey' : '#00A400'}; 
								border:solid {trackTaskPlanChange ? 'grey' : '#00A400'};"
							disabled={trackTaskPlanChange}
							on:click={() => {
								statechangeaction = 'Close Task';
								changeTaskState(statechangeaction);
								showModal = false;
							}}>Close Task</button
						>
						<button
							type="submit"
							style="background-color:#D02929; border:solid #D02929;"
							on:click={() => {
								statechangeaction = 'Reject Task';
								changeTaskState(statechangeaction);
							}}>Reject Task</button
						>
						<button
							type="submit"
							style="background-color:{trackTaskPlanChange
								? 'grey'
								: '#000000'}; border: solid {trackTaskPlanChange
								? 'grey'
								: '#000000'};">Save Changes</button
						>
					{/if}
					<!-- <button
						type="submit"
						style="background-color:{trackTaskPlanChange
							? 'grey'
							: '#000000'}; border: solid {trackTaskPlanChange ? 'grey' : '#000000'};"
						>Save Changes</button
					> -->
					<button
						type="button"
						on:click={() => {
							showModal = false;
							selectedTask.Task_plan = originalTaskPlan;
							trackTaskPlanChange = false;
						}}>Cancel</button
					>
				</div>
			</form>
		</div>
	{/if}
</Modal>

<div class="middle-container">
	<h1 class="middle-left">Task Management Board: {$kanbanAppAcronym}</h1>
	{#if userGroupForCheckingPermit.includes('PM')}
		<button
			class="middle-right"
			on:click={() => {
				showModal = true;
				modalType = 'createPlan';
			}}>+ CREATE PLAN</button
		>
	{/if}
</div>
<div class="kanban-container">
	<div class="kanban-column">
		<div class="kanban-header">
			<h2>Open</h2>
			{#if userGroupForCheckingPermit.includes('PL')}
				<button
					class="createTaskButton"
					on:click={() => {
						showModal = true;
						modalType = 'createTask';
						getCurrentDate();
					}}>+ CREATE TASK</button
				>
			{/if}
		</div>
		<div class="task-card-container">
			{#each openTasks as task}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					class="task-card"
					style="border-left-color:{task.Plan_color ? task.Plan_color : '#D8D8D8'};"
					on:click={() => {
						handleClickOnTask(task);
						convertEpochToDate();
						handleTaskPlanChange();
					}}
				>
					<div class="task-card-contents">
						<h4>{task.Task_id}</h4>
						<p>{task.Task_name}</p>
						<span class="task-owner">{task.Task_owner}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
	<div class="kanban-column">
		<div class="kanban-header">
			<h2>To do</h2>
		</div>
		<div class="task-card-container">
			{#each toDoTasks as task}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					class="task-card"
					style="border-left-color:{task.Plan_color};"
					on:click={() => {
						handleClickOnTask(task);
						convertEpochToDate();
					}}
				>
					<div class="task-card-contents">
						<h4>{task.Task_id}</h4>
						<p>{task.Task_name}</p>
						<span class="task-owner">{task.Task_owner}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
	<div class="kanban-column">
		<div class="kanban-header">
			<h2>Doing</h2>
		</div>
		<div class="task-card-container">
			{#each doingTasks as task}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					class="task-card"
					style="border-left-color:{task.Plan_color};"
					on:click={() => {
						handleClickOnTask(task);
						convertEpochToDate();
					}}
				>
					<div class="task-card-contents">
						<h4>{task.Task_id}</h4>
						<p>{task.Task_name}</p>
						<span class="task-owner">{task.Task_owner}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
	<div class="kanban-column">
		<div class="kanban-header">
			<h2>Done</h2>
		</div>
		<div class="task-card-container">
			{#each doneTasks as task}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					class="task-card"
					style="border-left-color:{task.Plan_color};"
					on:click={() => {
						handleClickOnTask(task);
						convertEpochToDate();
						originalTaskPlan = selectedTask.Task_plan;
					}}
				>
					<div class="task-card-contents">
						<h4>{task.Task_id}</h4>
						<p>{task.Task_name}</p>
						<span class="task-owner">{task.Task_owner}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
	<div class="kanban-column">
		<div class="kanban-header">
			<h2>Closed</h2>
		</div>
		<div class="task-card-container">
			{#each closedTasks as task}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					class="task-card"
					style="border-left-color:{task.Plan_color};"
					on:click={() => {
						handleClickOnTask(task);
						convertEpochToDate();
					}}
				>
					<div class="task-card-contents">
						<h4>{task.Task_id}</h4>
						<p>{task.Task_name}</p>
						<span class="task-owner">{task.Task_owner}</span>
					</div>
				</div>
			{/each}
		</div>
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
	}
	.kanban-column {
		background-color: #d8d8d8;
		width: 260px;
		border-radius: 5px;
		font-size: 0.7em;
		margin-left: 10px;
		margin-right: 10px;
		margin-bottom: 20px;
		display: flex;
		flex-direction: column;
		height: calc(100vh - 190px);
	}
	.kanban-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 10px;
	}
	.kanban-column h2 {
		margin-left: 20px;
	}
	.task-card-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		overflow-y: auto;
	}
	.task-container {
		display: flex;
		justify-content: space-between;
		width: 1100px;
	}

	.task-formgroup {
		display: flex;
		justify-content: space-between;
	}
	.task-formgroup label {
		margin: 10px 20px;
		width: 150px;
		font-weight: bold;
		font-size: 1em;
		align-self: center;
	}
	.task-formgroup input,
	select {
		margin: 10px 20px;
		background-color: #dadada;
		border: transparent;
		height: 38px;
		width: 100%;
		padding-left: 10px;
		outline: none;
		border-radius: 4px;
		font-size: 1.1em;
	}

	h3 {
		text-align: center;
		font-size: 1.5em;
		background-color: #000000;
		color: #ffffff;
		padding: 5px 0px 5px 0px;
		margin-top: 1px;
	}
	.createTask-right {
		border-left: 1px solid black;
		padding-left: 40px;
		padding-right: 20px;
	}
	.createTask-right textarea {
		width: 500px;
		height: 100px;
		resize: none;
		background-color: lightgrey;
		margin-left: 0px;
		margin-top: 30px;
		height: 100px;
	}
	.createTask-notes {
		width: 500px;
		height: 350px;
		white-space: pre-wrap;
		overflow-y: auto;
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
		font-size: 1.5em;
	}
	.form-group {
		display: flex;
		justify-content: space-between;
	}
	.form-group label {
		margin: 10px 20px;
		width: 120px;
		font-weight: bold;
		font-size: 1em;
		align-self: center;
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
	input[disabled] {
		background-color: #ffffff;
	}
	.createPlan-container {
		width: 700px;
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
	.task-card {
		width: 90%;
		/* height: 100px; */
		background-color: #ffffff;
		border-radius: 7px;
		margin-top: 10px;
		display: flex;
		border-left: 5px solid;
	}
	.task-card:hover {
		border-left: 10px solid;
		cursor: pointer;
	}
	.task-card-contents {
		margin-left: 20px;
		padding-top: 10px;
		padding-bottom: 10px;
	}
	.task-card-contents p {
		font-size: 1.2em;
	}
	h4 {
		font-size: 1.5em;
		margin: 0px;
	}
	.task-owner {
		font-size: 1.4em;
		padding: 5px;
		background-color: #0095ff;
		color: #ffffff;
		border-radius: 5px;
		display: inline-block;
		width: 50px;
		text-align: center;
	}
	textarea {
		width: 100%;
		height: 100px;
		resize: none;
		margin-left: 10px;
	}
	textarea[disabled] {
		background-color: #ffffff;
	}
</style>
