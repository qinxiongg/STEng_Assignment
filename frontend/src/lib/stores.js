import { writable } from 'svelte/store';

export const authStore = writable();

export const userStore = writable('');

export const showKanban = writable(false);

export const selectedAppToShowKanban = writable('');
