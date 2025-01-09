import jwt from 'jsonwebtoken';

export const POST = async ({ request }) => {
	const { token } = await request.json();

	if (!token) {
		return new Response(JSON.stringify({ message: 'Token is required' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
		const secret = process.env.JWT_SECRET;
		if (!secret) {
			return new Response(JSON.stringify({ message: 'JWT secret is not defined' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Ověření tokenu
		const decoded = jwt.verify(token, secret);
		if (!decoded) {
			return new Response(JSON.stringify({ message: 'Invalid token' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}
		return new Response(JSON.stringify({ valid: true, decoded }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Invalid or expired token' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
