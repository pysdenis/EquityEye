import { writable } from 'svelte/store';

export const unreadCount = writable(0);

export async function refreshUnreadCount() {
	const res = await fetch('/api/notifications?userId=' + localStorage.getItem('id'));
	if (!res.ok) return;

	const data = await res.json();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const unread = data.filter((n: any) => !n.seen);
	unreadCount.set(unread.length);
}
