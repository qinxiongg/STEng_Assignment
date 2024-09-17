<script>
	import Modal from '../../lib/Modal.svelte';

	let showModal = false;
	let modalType = '';

	import { goto } from '$app/navigation';
	import axios from 'axios';

	const API_URL = import.meta.env.VITE_API_URL;

	let users_list = [];
	let errorMessage = '';

	let newUser = {
		username: '',
		email: '',
		group: '',
		password: '',
		active: 'Active'
	};

	let selectedGroups = []; // Array to keep track of selected groups
	let showDropdown = false;
	let selectedGroupsEditUser = [];

	function addGroupModal() {
		modalType = 'addGroup';
		showModal = true;
	}

	function editProfileModal() {
		modalType = 'editProfile';
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
		console.log(users_list[index].usergroupConcat);
		console.log(group);
		console.log(index, users_list);
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
	// Fetch users
	async function fetchUsers() {
		try {
			const response = await axios.get(`${API_URL}/users`, { withCredentials: true });

			if (response.status === 200) {
				users_list = response.data.users_list;
			}
		} catch (error) {
			console.error('Error :', error);
			errorMessage = 'An error occurred during login';
		}
	}

	// Add new users functions

	async function registerUser() {
		try {
			const response = await axios.post(
				`${API_URL}/users`,
				{ ...newUser, groups: selectedGroups },
				{
					withCredentials: true
				}
			);

			if (response.status === 201) {
				users_list = response.data.users_list;

				// Clear form fields
				newUser = {
					username: '',
					email: '',
					group: '',
					password: '',
					active: 'Active'
				};
				selectedGroups = []; // Clear selected groups
				await fetchUsers();
			} else {
				console.error('Failed to add user');
			}
		} catch (error) {
			console.error('Error adding user:', error);
		}
	}

	// Add group
	let groupName = '';

	async function addNewGroup() {
		try {
			const response = await axios.post(
				`${API_URL}/groups`,
				{ groupName },
				{
					withCredentials: true
				}
			);

			if (response.status === 201) {
				groupName = '';
			}
		} catch (error) {
			console.log(error);
		}
	}

	let allUserGroups = [];

	async function getAllGroups() {
		try {
			const response = await axios.get(`${API_URL}/groups`, { withCredentials: true });

			if (response.status === 200) {
				allUserGroups = response.data.userGroups;
				console.log(allUserGroups);
			}
		} catch (error) {
			console.error('Error:', error);
		}
	}

	let loggedinUser = '';

	async function fetchUserInfo() {
		try {
			const response = await axios.get(`${API_URL}/userinfo`, { withCredentials: true });
			if (response.status === 200) {
				loggedinUser = response.data.username;
			}
		} catch (error) {
			console.error('Error fetching user info:', error);
		}
	}

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

	async function fetchUserProfile() {
		try {
			const response = await axios.get(`${API_URL}/profile`, { withCredentials: true });
			if (response.status === 200) {
				userProfile = response.data.profile;
				originalProfile = { ...userProfile };
			}
		} catch (error) {
			console.log('Error fetching user profile:', error);
		}
	}

	async function editProfile() {
		const updatedFields = {};

		if (userProfile.email !== originalProfile.email) {
			updatedFields.email = userProfile.email;
		}

		if (userProfile.password !== '') {
			updatedFields.password = userProfile.password;
		}

		if (Object.keys(updatedFields).length > 0)
			try {
				const response = await axios.patch(`${API_URL}/profile`, updatedFields, {
					withCredentials: true
				});
				if (response.status === 200) {
					originalProfile = { ...userProfile };
				}
			} catch (error) {
				console.error('Error updating profile:', error);
			}
	}

	let editingUserId = null; // To track the user being edited

	// Enter edit mode for the selected user
	function editUser(user) {
		editingUserId = user.username;
	}
	// Save the changes made to the user
	async function saveChanges(user) {
		try {
			const response = await axios.post(`${API_URL}/editprofile`, user, {
				withCredentials: true
			});

			if (response.status === 200) {
				// Exit edit mode
				editingUserId = null;
			}
		} catch (error) {
			console.error('Error updating user:', error);
		}
	}

	// Cancel the editing process
	async function cancelEdit() {
		editingUserId = null; // Exit edit mode without saving
		await fetchUsers();
	}

	/////////////////////////////////////////////////////////////

	import { onMount } from 'svelte';
	onMount(async () => {
		await fetchUserInfo();
		await fetchUsers();

		await getAllGroups();
		await fetchUserProfile();
	});
</script>

<!-- Maybe move the navbar to layout???-->
<nav>
	<ul>
		<li class="nav-left">Hello, {loggedinUser}</li>
		<!-- TODO: use JWT token to show user's name-->
		<div class="nav-center">
			<li>
				<a href="/applications">Applications</a>
			</li>
			<li>
				<a href="/user-management">User Management</a>
			</li>
		</div>
		<li class="nav-right">
			<a on:click={editProfileModal}>Edit Profile</a>
		</li>
	</ul>
</nav>
<div class="middle-container">
	<h1 class="middle-left">User Management</h1>
	<button class="middle-right" on:click={addGroupModal}>+ Group</button>
</div>

<Modal bind:showModal>
	{#if modalType === 'editProfile'}
		<div>
			<h2>Edit Profile</h2>
			<div class="form-group">
				<label for="username">Username:</label>
				<input type="text" bind:value={loggedinUser} readonly name="groupName" />

				<label for="email">Email:</label>
				<input type="text" bind:value={userProfile.email} name="email" />

				<label for="groupName">Password:</label>
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
	{/if}
	{#if modalType === 'addGroup'}
		<div>
			<h2>Add Group</h2>
			<div class="form-group">
				<label for="groupName">Group Name:</label>
				<input
					type="text"
					bind:value={groupName}
					id="groupName"
					name="groupName"
					placeholder="Name"
				/>
			</div>
			<div class="modal-buttons">
				<button type="submit" on:click={addNewGroup}>ADD</button>
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
			<button type="submit" class="submit_button" on:click={registerUser}>SUBMIT</button>
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
							on:change={(e) => EditUserGroup(e.target.value, index)}
							name="group"
							id="group"
						>
							{#each allUserGroups as group}
								<option value={group.usergroup}>{group.usergroup}</option>
							{/each}
						</select>
						<div>
							{#each user.usergroupConcat as group}
								<span class="selected-group">
									{group}
									<button
										type="button"
										on:click={() => removeUserGroup(group, index)}>X</button
									>
								</span>
							{/each}
						</div>
					</div>
				</td>
				<td> <input type="password" bind:value={user.password} /> </td>
				<td>
					<select bind:value={user.accountStatus}>
						<option value="Active">Active</option>
						<option value="Disabled">Disabled</option>
					</select>
				</td>
				<td>
					<button on:click={() => saveChanges(user)}>Save Changes</button>
					<button on:click={cancelEdit}>Cancel</button>
				</td>
			{:else}
				<td>{user.email}</td>
				<td>
					{#each user.usergroupConcat as group}
						<span>{group}</span>
					{/each}
				</td>
				<td> {user.password} </td>
				<td> {user.accountStatus}</td>
				<td> <button on:click={() => editUser(user)}>Edit</button> </td>
			{/if}
			<td></td>
		</tr>
	{/each}
</table>

<style>
	.form-group {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 15px;
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
		gap: 20px;
	}

	.modal-buttons button {
		padding: 10px 40px 10px 40px;
		cursor: pointer;
		background-color: black;
		color: #ffffff;
		border: none;
	}

	nav {
		display: flex;
		background-color: black;
		margin: 0;
		color: #ffffff;
		height: 100px;
		align-items: center;
		font-size: 1.5em;
	}
	nav ul {
		display: flex;
		list-style: none;
		color: #ffffff;
		padding: 10px;
		flex-grow: 1;
		justify-content: space-between;
	}
	a {
		text-decoration: none;
		color: #ffffff;
	}
	.nav-left {
		margin-left: 60px;
	}
	.nav-center {
		display: flex;
		justify-content: center;
		gap: 20px;
	}
	.nav-right {
		margin-right: 60px;
	}
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
		/* height: 30px;
		width: 193px; */
		padding: 10px 15px;
	}
	#users select {
		/* width: 128px;
		height: 30px; */
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
	.superadmin {
		background-color: #0095ff;
		color: #ffffff;
		border: none;
		border-radius: 10px;
		padding: 10px 30px;
	}
	#users tr td:not(:first-child):not(:last-child) {
		border-bottom: 1px solid lightgrey; /* Add grey border to the bottom */
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
