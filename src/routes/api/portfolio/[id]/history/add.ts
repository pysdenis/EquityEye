import { connectToDB } from '$lib/db';
import { Portfolio } from '$lib/models/Portfolio';

export async function POST({ request, params }: { request: Request; params: { id: string } }) {
	await connectToDB();
	const { date, value } = await request.json();

	const portfolio = await Portfolio.findOne({ userId: params.id });
	if (!portfolio) {
		return new Response('Portfolio not found', { status: 404 });
	}

	portfolio.history.push({ date: new Date(date), value });
	await portfolio.save();

	return new Response('History updated', { status: 200 });
}
