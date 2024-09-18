import { writable } from 'svelte/store';

export const authStore = writable();

export const userStore = writable('');
