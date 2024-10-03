<script>
	import Modal from '$lib/Modal.svelte';
	import { customError, handleError, alertSuccess } from '$lib/errorHandler';
	import { authStore } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import axios from 'axios';
	import FaEdit from 'svelte-icons/fa/FaEdit.svelte';

	const API_URL = import.meta.env.VITE_API_URL;

	let showModal = false;
	let modalType = '';

	let selectedGroups = [];

	// Set isAdmin to false by default
	let isAdmin = false;

	let users_list = [];
	let newPassword = '';
	let newGroupName = '';

	let newUser = {
		username: '',
		email: '',
		group: '',
		password: '',
		active: 'Active'
	};

	let allUserGroups = [];

	let editingUserId = null; // To track the user being edited

	async function checkIsAdmin() {
		try {
			const response = await axios.get(`${API_URL}/checkIsAdmin`, { withCredentials: true });

			if (response.status === 200) {
				isAdmin = response.data.isAdmin;
				authStore.set(response.data.isAdmin);
			}
			if (!isAdmin) {
				goto('/home/applications');
			}
		} catch (error) {
			console.error('Error:', error);
		}
	}

	function addGroupModal() {
		modalType = 'addGroup';
		showModal = true;
	}

	function handleCancel() {
		showModal = false;
	}

	function addGroupToSelected(group) {
		if (!selectedGroups.includes(group)) {
			selectedGroups = [...selectedGroups, group];
		}
		newUser.group = '';
	}

	function removeGroupFromSelected(group) {
		selectedGroups = selectedGroups.filter((g) => g !== group);
	}

	function EditUserGroup(group, index) {
		if (!users_list[index].usergroupConcat.includes(group)) {
			users_list[index].usergroupConcat = [...users_list[index].usergroupConcat, group];
		}
	}

	function removeUserGroup(group, index) {
		users_list[index].usergroupConcat = users_list[index].usergroupConcat.filter(
			(g) => g !== group
		);
	}

	///////////////////////////////////////////////////////////////
	async function getAllUsers() {
		try {
			const response = await axios.get(`${API_URL}/users`, { withCredentials: true });

			if (response.status === 200) {
				users_list = response.data.users_list;
			}
		} catch (error) {
			console.error('Error :', error);
		}
	}

	async function createUser() {
		try {
			const response = await axios.post(
				`${API_URL}/createUser`,
				{ ...newUser, groups: selectedGroups },
				{
					withCredentials: true
				}
			);

			if (response.status === 201) {
				await getAllUsers();

				// Clear form fields
				newUser = {
					username: '',
					email: '',
					group: '',
					password: '',
					active: 'Active'
				};

				selectedGroups = []; // Clear selected groups
				alertSuccess(response.data.success);
			}
		} catch (error) {
			if (error instanceof axios.AxiosError) {
				handleError(error.response.data);
			} else {
				customError('An error occurred during registration');
			}
		}
	}

	async function addNewGroups() {
		try {
			const response = await axios.post(
				`${API_URL}/addNewGroups`,
				{ newGroupName },
				{
					withCredentials: true
				}
			);

			if (response.status === 201) {
				newGroupName = '';
				alertSuccess(response.data.success);
			}
		} catch (error) {
			if (error instanceof axios.AxiosError) {
				handleError(error.response.data);
			} else {
				customError('An error occurred during adding group');
			}
		}
	}

	async function getAllGroups() {
		try {
			const response = await axios.get(`${API_URL}/getAllGroups`, { withCredentials: true });

			if (response.status === 200) {
				allUserGroups = response.data;
			}
		} catch (error) {
			console.error('Error:', error);
		}
	}

	// Enter edit mode for the selected user
	function editUser(user) {
		newPassword = '';
		editingUserId = user.username;
	}

	// Save the changes made to the user
	async function saveChanges(user, newPassword) {
		if (newPassword) {
			user.password = newPassword;
		} else {
			user.password = null;
		}

		try {
			const response = await axios.post(`${API_URL}/editUser`, user, {
				withCredentials: true
			});

			if (response.status === 200) {
				// Exit edit mode
				editingUserId = null;
				await getAllUsers();

				alertSuccess(response.data.success);
			}
		} catch (error) {
			if (error instanceof axios.AxiosError) {
				handleError(error.response.data);
			} else {
				customError('An error occurred during adding group');
			}
		}
	}

	// Cancel the editing process
	async function cancelEdit() {
		editingUserId = null; // Exit edit mode without saving
		await getAllUsers();
		newPassword = '';
	}

	/////////////////////////////////////////////////////////////

	onMount(async () => {
		await checkIsAdmin();
		await getAllUsers();
		await getAllGroups();
	});
</script>

<div class="middle-container">
	<h1 class="middle-left">User Management</h1>
	<button class="middle-right" on:click={addGroupModal}>+ Group</button>
</div>

<Modal bind:showModal>
	<form on:submit|preventDefault={addNewGroups}>
		<h2>Add Group</h2>
		<div class="form-group">
			<label for="newGroupName">Group Name:</label>
			<input
				type="text"
				bind:value={newGroupName}
				id="newGroupName"
				name="newGroupName"
				placeholder="Name"
			/>
		</div>
		<div class="modal-buttons">
			<button type="submit">ADD</button>
			<button type="button" on:click={handleCancel}>CANCEL</button>
		</div>
	</form>
</Modal>

<table id="users">
	<tr>
		<th> </th>
		<th>Name</th>
		<th>Email</th>
		<th>Group</th>
		<th>Password</th>
		<th>Active</th>
		<th>Action</th>
		<th> </th>
	</tr>

	<tr>
		<td> </td>
		<td><input type="text" bind:value={newUser.username} placeholder="Username" required /></td>
		<td><input type="email" bind:value={newUser.email} placeholder="Email" required /></td>
		<td>
			<select
				bind:value={newUser.group}
				on:click={getAllGroups}
				on:change={(e) => addGroupToSelected(e.target.value)}
				name="group"
				id="group"
			>
				{#each allUserGroups as group}
					<option value={group.usergroup}>{group.usergroup}</option>
				{/each}
			</select>
			<div>
				{#each selectedGroups as group}
					<span class="selected-group">
						{group}
						<button type="button" on:click={() => removeGroupFromSelected(group)}
							>X</button
						>
					</span>
				{/each}
			</div>
		</td>
		<td
			><input
				type="password"
				bind:value={newUser.password}
				placeholder="Password"
				required
			/></td
		>
		<td>
			<select bind:value={newUser.active} name="accountStatus" id="accountStatus">
				<option value="Active">Active</option>
				<option value="Disabled">Disabled</option>
			</select>
		</td>
		<td>
			<button type="submit" class="submit_button" on:click={createUser}>SUBMIT</button>
		</td>
		<td> </td>
	</tr>

	{#each users_list as user, index}
		<tr>
			<td></td>
			<td>{user.username}</td>

			{#if editingUserId === user.username}
				<td><input type="email" bind:value={user.email} /></td>
				<td>
					<div>
						<select
							bind:value={user.usergroupSelected}
							on:change={(e) => {
								EditUserGroup(e.target.value, index);
								user.usergroupSelected = '';
							}}
							name="group"
							id="group"
						>
							<option value="" disabled selected hidden></option>
							{#each allUserGroups as group}
								<option value={group.usergroup}>{group.usergroup}</option>
							{/each}
						</select>
						<div>
							{#each user.usergroupConcat as group}
								<span class="selected-group">
									<span class="group-tag"
										>{group}<button
											type="button"
											on:click={() => removeUserGroup(group, index)}>X</button
										>
									</span>
								</span>
							{/each}
						</div>
					</div>
				</td>
				<td>
					<input
						type="password"
						bind:value={newPassword}
						placeholder="Enter new password"
					/>
				</td>
				<td>
					<select bind:value={user.accountStatus}>
						<option value="Active">Active</option>
						<option value="Disabled">Disabled</option>
					</select>
				</td>
				<td>
					<button on:click={() => saveChanges(user, newPassword)}>Save Changes</button>
					<button on:click={cancelEdit}>Cancel</button>
				</td>
			{:else}
				<td>{user.email}</td>
				<td>
					{#each user.usergroupConcat as group}
						<span class="group-tag">{group}</span>
					{/each}
				</td>
				<td> <input type="password" bind:value={user.password} readonly /></td>
				<td> {user.accountStatus}</td>
				<td> <button class="editUser-Btn" on:click={() => editUser(user)}><FaEdit /></button> </td>
			{/if}
			<td></td>
		</tr>
	{/each}
</table>

<style>
	form h2 {
		text-align: center;
		font-size: 1.5em;
	}
	.form-group {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 700px;
	}

	.form-group label {
		margin: 10px 20px;
		font-weight: bold;
		width: 190px;
		font-size: 1.1em;
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

	.modal-buttons {
		display: flex;
		justify-content: center;
		margin-top: 20px;
		gap: 20px;
	}

	.modal-buttons button {
		padding: 10px 40px 10px 40px;
		width: 200px;
		height: 40px;
		cursor: pointer;
		background-color: black;
		color: #ffffff;
		border: none;
		margin-bottom: 20px;
	}
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
	}
	#users {
		margin: auto;
		width: 100%;
		border-collapse: collapse;
		text-align: center;
	}
	#users th {
		background: #eff4fa;
		color: #8f9bb3;
		padding: 30px 20px 30px 20px;

	}
	#users td {
		padding-top: 20px;
		padding-bottom: 20px;
	}
	#users input {
		background-color: #f0f0f0;
		border: none;

		padding: 10px 15px;
	}
	#users select {
		background-color: #f0f0f0;
		padding: 10px 30px;
		border: none;
	}
	.submit_button {
		background-color: black;
		color: #ffffff;
		height: 35px;
		width: 116px;
	}

	#users tr td:not(:first-child):not(:last-child) {
		border-bottom: 1px solid lightgrey;
		padding-bottom: 20px;
	}

	.group-tag {
		background-color: #e0e0e0;
		width: 40px;
		padding: 5px;
		margin-right: 8px;
		border-radius: 5px;
		display: inline-block;
	}
	.editUser-Btn {
		width: 25;
		height: 25px;
		padding: 0px;
		background-color: transparent;
		border: none;
		cursor: pointer;

	}
</style>
