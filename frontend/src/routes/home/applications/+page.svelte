<script>
	import { onMount } from 'svelte';
	import axios from 'axios';
	import { goto } from '$app/navigation';
	const API_URL = import.meta.env.VITE_API_URL;
	import { authStore, userStore } from '$lib/stores';

	// Set authStore to true if user is admin 
	async function checkIsAdmin() {
		try {
			const response = await axios.get(`${API_URL}/isAdmin`, { withCredentials: true });
			let isAdmin = false;

			if (response.status === 200) {
				isAdmin = response.data.isAdmin;
				authStore.set(response.data.isAdmin);
			}

			if (!isAdmin) {
				goto('/home/applications');
			}
		} catch (error) {
			console.error('Error at checkIsAdmin:', error);
		}
	}

	async function fetchUserInfo() {
		try {
			const response = await axios.get(`${API_URL}/userinfo`, { withCredentials: true });
			console.log('response:', response);
			if (response.status === 200) {
				userStore.set(response.data.username);
				// console.log("userstore:",$userStore);
			}
		} catch (error) {
			console.error('Error fetching user info:', error);
		}
	}

	onMount(async () => {
		await checkIsAdmin();
		await fetchUserInfo();
	});
</script>
