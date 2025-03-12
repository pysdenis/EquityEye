import type { RequestHandler } from '@sveltejs/kit';
import User from '$lib/models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.VITE_JWT_SECRET || 'test';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email, password } = await request.json();
		const user = await User.findOne({ email });

		if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
			return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
		}

		const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

		return new Response(JSON.stringify({ token, id: user._id }), { status: 200 });
	} catch (error) {
		console.error(error);
		return new Response(JSON.stringify({ error: 'Failed to login' }), { status: 500 });
	}
};
