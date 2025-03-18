import { json } from '@sveltejs/kit';

const API_KEY = process.env.POLYGON_KEY;
const BASE_URL = 'https://api.polygon.io/v2/aggs/ticker';

export async function GET({ url }) {
	const to = new Date().toISOString().split('T')[0];
	const multiplier = url.searchParams.get('multiplier') || 1;
	const timespan = url.searchParams.get('timespan') || 'day';
	const from = url.searchParams.get('from') || '2021-01-01';
	const tickerSymbol = url.searchParams.get('tickerSymbol');
	let response;

	try {
		response = await fetch(
			`${BASE_URL}/${tickerSymbol}/range/${multiplier}/${timespan}/${from}/${to}?apiKey=${API_KEY}`
		);
	} catch (error) {
		console.error('Failed to fetch data', error);
		return json({ error: 'Failed to fetch data' }, { status: 400 });
	}

	if (!response.ok) {
		return json({ error: 'Failed to fetch data' }, { status: response.status });
	}

	const data = await response.json();

	if (!data.results) {
		return json({ error: 'No data available' }, { status: 400 });
	}

	const chartData = data.results.map((item: { t: number; c: number }) => ({
		x: new Date(item.t).toISOString(),
		y: parseFloat(item.c.toString())
	}));

	return json(chartData);
}
