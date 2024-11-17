import { connectToDB } from '$lib/db';
import { Portfolio } from '$lib/models/Portfolio';

export async function GET({ params }: { params: { id: string } }) {
	await connectToDB();
	const portfolio = await Portfolio.findOne({ userId: params.id }).select('history');
	if (!portfolio) {
		return new Response('Portfolio not found', { status: 404 });
	}
	return new Response(JSON.stringify(portfolio.history), { status: 200 });
}
