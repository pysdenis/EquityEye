import { json } from '@sveltejs/kit';

const API_KEY = process.env.POLYGON_KEY;
const BASE_URL = 'https://api.polygon.io/v3/reference/tickers';

export async function GET({ url }) {
	const tickerSymbol = url.searchParams.get('tickerSymbol');
	let response;
	try {
		response = await fetch(`${BASE_URL}/${tickerSymbol}?apiKey=${API_KEY}`);
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

	const info = {
		ticker: data.results.ticker,
		name: data.results.name,
		locale: data.results.locale,
		market_cap: data.results.market_cap,
		phone_number: data.results.phone_number,
		address: data.results.address,
		description: data.results.description,
		homepage_url: data.results.homepage_url,
		total_employees: data.results.total_employees,
		list_date: data.results.list_date,
		logo: `/api/tickerInfo/logo?tickerSymbol=${tickerSymbol}`, // Tady obcházím to, aby se na FE nezobrazoval můj API klíč
		share_class_shares_outstanding: data.results.share_class_shares_outstanding,
		weighted_shares_outstanding: data.results.weighted_shares_outstanding,
		round_lot: data.results.round_lot
	};

	return json(info);
}
