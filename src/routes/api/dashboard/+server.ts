import { json } from '@sveltejs/kit';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import User from '../../../lib/models/User';

export async function GET({ request }) {
	try {
		const authHeader = request.headers.get('authorization');
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const token = authHeader.slice(7);

		const decoded = jwt.verify(token, process.env.VITE_JWT_SECRET || '') as JwtPayload;

		// Ověření  ID
		if (!decoded.id) {
			return json({ error: 'Invalid token' }, { status: 400 });
		}

		const userId = decoded.id;

		// Načtení uživatele
		const user = await User.findById(userId).populate('portfolioId');
		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		return json(user);
	} catch (error) {
		console.error(error);
		return json({ error: 'Failed to fetch user data' }, { status: 500 });
	}
}
