<script></script>

<nav>
	<ul>
		<li class="nav-left">Hello, User</li>
		<div class="nav-center">
			<li>
				<a href="/applications">Applications</a>
			</li>
			<li>
				<a href="/usermanagement">User Management</a>
			</li>
		</div>
		<li class="nav-right">
			<a href="/editprofile">Edit Profile</a>
		</li>
	</ul>
</nav>
<div class="middle-container">
	<h1 class="middle-left">User Management</h1>
	<button class="middle-right">+ Group</button>
</div>

<style>
	nav {
		display: flex;
		background-color: black;
		margin: 0;
		color: #ffffff;
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
        margin-top: 20px;
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
</style>
