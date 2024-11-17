import jwt from 'jsonwebtoken';

export async function handle({ event, resolve }) {
	const authHeader = event.request.headers.get('Authorization');
	if (authHeader) {
		const token = authHeader.split(' ')[1];
		try {
			const user = jwt.verify(token, process.env.JWT_SECRET || '');
			event.locals.user = user;
		} catch {
			return new Response('Unauthorized', { status: 401 });
		}
	}
	return resolve(event);
}
