import { error } from '@sveltejs/kit';

const API_KEY = process.env.POLYGON_KEY;
const BASE_URL = 'https://api.polygon.io/v3/reference/tickers';

export async function GET({ url }) {
	const tickerSymbol = url.searchParams.get('tickerSymbol');

	if (!tickerSymbol) {
		throw error(400, 'Missing ticker symbol');
	}

	const res = await fetch(`${BASE_URL}/${tickerSymbol}?apiKey=${API_KEY}`);
	if (!res.ok) {
		throw error(res.status, 'Failed to fetch ticker data from Polygon.io');
	}
	const data = await res.json();

	if (!data?.results?.branding?.logo_url) {
		throw error(404, 'No logo found in Polygon data');
	}

	const logoUrl = `${data.results.branding.logo_url}?apiKey=${API_KEY}`;
	const logoRes = await fetch(logoUrl);
	if (!logoRes.ok) {
		throw error(500, 'Failed to fetch logo from Polygon.io');
	}

	return new Response(logoRes.body, {
		headers: {
			'Content-Type': logoRes.headers.get('Content-Type') ?? 'image/png'
		}
	});
}
