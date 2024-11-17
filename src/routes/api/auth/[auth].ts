import { connectToDB } from '$lib/db';
import jwt from 'jsonwebtoken';
import { User, type IUser } from '$lib/models/User';

export async function POST({ request, params }: { request: Request; params: { action: string } }) {
	await connectToDB();
	const { email, password } = await request.json();

	if (params.action === 'register') {
		const newUser: IUser = new User({ email, password });
		await newUser.save();
		return new Response('User registered', { status: 201 });
	}

	if (params.action === 'login') {
		const user = await User.findOne({ email });
		if (!user || !(await user.comparePassword(password))) {
			return new Response('Invalid credentials', { status: 401 });
		}
		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || '');
		return new Response(JSON.stringify({ token }), { status: 200 });
	}
}
