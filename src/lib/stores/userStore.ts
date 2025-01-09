import { writable } from 'svelte/store';
import type { User } from '../models/User';

export const userStore = writable<{ token: string | null; user: User | null }>({
	token: null,
	user: null
});

export const setUser = (token: string, user: User) => {
	userStore.set({ token, user }); // TODO save users data
};

export const logoutUser = () => {
	localStorage.removeItem('token');
	userStore.set({ token: null, user: null });
};
