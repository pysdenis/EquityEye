import { connectToDB } from '$lib/db';
import { Portfolio } from '$lib/models/Portfolio';

export async function GET({ params }: { params: { id: string } }) {
	await connectToDB();
	const portfolio = await Portfolio.findOne({ userId: params.id });
	return new Response(JSON.stringify(portfolio), { status: 200 });
}

export async function POST({ request }: { request: Request }) {
	await connectToDB();
	const data = await request.json();
	const portfolio = new Portfolio(data);
	await portfolio.save();
	return new Response('Portfolio created', { status: 201 });
}
