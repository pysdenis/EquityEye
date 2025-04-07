import Notification from '$lib/models/NotificationsSchema';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	const userId = url.searchParams.get('userId');

	if (!userId) {
		return json({ error: 'Neautorizováno' }, { status: 401 });
	}

	const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

	return json(notifications);
}

export async function POST({ request, url }) {
	const userId = url.searchParams.get('userId');
	if (!userId) return json({ error: 'Neautorizováno' }, { status: 401 });

	const { notificationId } = await request.json();

	await Notification.updateOne({ _id: notificationId, userId }, { $set: { seen: true } });

	return json({ success: true });
}
