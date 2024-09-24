<script>
	import Modal from '$lib/Modal.svelte';
	import { customError, handleError, customAlert } from '$lib/errorHandler';
	import { authStore } from '$lib/stores';
	import { goto } from '$app/navigation';
	import axios from 'axios';

	const API_URL = import.meta.env.VITE_API_URL;

	let showModal = false;
	let modalType = '';

	let selectedGroups = [];

	// Set isAdmin to false by default
	let isAdmin = false;

	let users_list = [];
	let newPassword = '';

	// Add new groups
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

	let loggedinUser = '';

	let userProfile = {
		username: '',
		email: '',
		password: ''
	};

	let originalProfile = {
		username: '',
		email: '',
		password: ''
	};

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
				customAlert(response.data.success);
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
				customAlert(response.data.success);
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
				allUserGroups = response.data.userGroups;
			}
		} catch (error) {
			console.error('Error:', error);
		}
	}



	async function updateUserProfile() {
		try {
			const response = await axios.get(`${API_URL}/profile`, { withCredentials: true });
			console.log('user profile:', response.data);
			if (response.status === 200) {
				userProfile = response.data.profile;
				originalProfile = { ...userProfile };
			}
		} catch (error) {
			console.log('Error fetching user profile:', error);
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
				console.log('edit user:', response);
				// Exit edit mode
				editingUserId = null;
				await getAllUsers();

				customAlert(response.data.success);
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

	import { onMount } from 'svelte';
	onMount(async () => {
		await checkIsAdmin();
		// await fetchUserInfo();
		await getAllUsers();
		await getAllGroups();
		await updateUserProfile();
	});
</script>

<div class="middle-container">
	<h1 class="middle-left">User Management</h1>
	<button class="middle-right" on:click={addGroupModal}>+ Group</button>
</div>

<Modal bind:showModal>
	<!-- {#if modalType === 'editProfile'}
		<div>
			<h2>Edit Profile</h2>
			<div class="form-group">
				<label for="username">Username:</label>
				<input type="text" bind:value={loggedinUser} readonly name="username" />

				<label for="email">Email:</label>
				<input type="text" bind:value={userProfile.email} name="email" />

				<label for="password">Password:</label>
				<input type="password" bind:value={userProfile.password} name="password" />
			</div>
			<div class="modal-buttons">
				<button type="submit" on:click={editProfile}>SAVE CHANGES</button>
				<button
					type="button"
					on:click={() => {
						showModal = false;
					}}>CANCEL</button
				>
			</div>
		</div>
	{/if} -->
	{#if modalType === 'addGroup'}
		<div class="modal-title">
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
				<button type="submit" on:click={addNewGroups}>ADD</button>
				<button
					type="button"
					on:click={() => {
						showModal = false;
					}}>CANCEL</button
				>
			</div>
		</div>
	{/if}
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
				<td> <button on:click={() => editUser(user)}>Edit</button> </td>
			{/if}
			<td></td>
		</tr>
	{/each}
</table>

<style>
	.modal-title {
		text-align: center;
	}
	.form-group {
		display: flex;
		align-items: center;
		margin: 15px 15px 15px 15px;
	}

	.form-group label {
		width: 30%;
		margin-right: 10px;
	}

	.form-group input {
		width: 70%;
		padding: 8px;
		background-color: #f0f0f0;
		border-radius: 5px;
	}

	.modal-buttons {
		display: flex;
		justify-content: center;
		margin-top: 20px;
		margin-bottom: 20px;
		gap: 20px;
	}

	.modal-buttons button {
		padding: 10px 40px 10px 40px;
		cursor: pointer;
		background-color: black;
		color: #ffffff;
		border: none;
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
		padding: 5px;
		margin-right: 5px;
		border-radius: 5px;
		display: inline-block;
	}
</style>
