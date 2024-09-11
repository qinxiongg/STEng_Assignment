<script>
	import GroupModal from './GroupModal.svelte';
	let showGroupModal = false;
</script>

<nav>
	<ul>
		<li class="nav-left">Hello, User</li>
		<div class="nav-center">
			<li>
				<a href="/applications">Applications</a>
			</li>
			<li>
				<a href="/user-management">User Management</a>
			</li>
		</div>
		<li class="nav-right">
			<a href="/editprofile">Edit Profile</a>
		</li>
	</ul>
</nav>
<div class="middle-container">
	<h1 class="middle-left">User Management</h1>
	<button class="middle-right" on:click={() => (showGroupModal = true)}>+ Group</button>
</div>

<!-- KIV: revisit this later -->
<GroupModal bind:showGroupModal>
	<div>
		<h2>Add Group</h2>
		<form>
			<div class="form-group">
				<label for="groupName">Group Name:</label>
				<input type="text" id="groupName" name="groupName" placeholder="Name" />
			</div>
			<div class="modal-buttons">
				<button type="button">ADD</button>
				<button type="submit" on:click={() => (showGroupModal = false)}>CANCEL</button>
			</div>
		</form>
	</div>
</GroupModal>

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
			<td><input type="text" placeholder="Username" required /></td>
			<td><input type="email" placeholder="Email" required /></td>
			<td>
				<select name="group" id="group">
					<!-- change hardcoded group to values retrieved from db -->
					<option value="PL_G1">Admin</option>
					<option value="PM_G1">User</option>
					<option value="PM_G1">PL</option>
					<option value="PM_G1">PM</option>
					<option value="PM_G1">Dev</option>
				</select>
			</td>
			<td><input type="password" placeholder="Password" required /></td>
			<td>
				<select name="accountStatus" id="accountStatus">
					<option value="PL_G1">Active</option>
					<option value="PM_G1">Disabled</option>
				</select>
			</td>
			<td>
				<button class="submit_button">SUBMIT</button>
			</td>
		</tr>
	<tr>
		<td> </td>
		<td>Peter Lee</td>
		<td>peter_lee@example.com</td>
		<td><button class="superadmin">Super Admin</button></td>
		<td>passwordhere</td>
		<td> Active </td>
		<td> edit </td>
	</tr>
</table>

<style>
	/* .modal h2 {
		margin-bottom: 20px;
		text-align: center;
	} */

	.form-group {
		display: flex;
		align-items: center;
		margin-bottom: 15px;
	}

	.form-group label {
		width: 30%; /* Adjust the width based on your design */
		margin-right: 10px;
	}

	.form-group input {
		width: 70%; /* Adjust the width based on your design */
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
</style>
