import { error, json } from '@sveltejs/kit';

const API_KEY = process.env.POLYGON_KEY;

export async function GET({ url }) {
	const query = url.searchParams.get('query') ?? '';
	if (!query) {
		return json([]);
	}

	try {
		const polygonUrl = new URL('https://api.polygon.io/v3/reference/tickers');
		polygonUrl.searchParams.set('search', query);
		polygonUrl.searchParams.set('active', 'true');
		polygonUrl.searchParams.set('limit', '10');
		if (!API_KEY) {
			throw error(500, 'API key is missing');
		}
		polygonUrl.searchParams.set('apiKey', API_KEY);

		const res = await fetch(polygonUrl);
		if (!res.ok) {
			throw error(res.status, 'Polygon API error');
		}

		const data = await res.json();
		return json(data.results ?? []);
	} catch {
		throw error(500, 'Internal Server Error');
	}
}
