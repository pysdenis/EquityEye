import { json } from '@sveltejs/kit';

const API_KEY = process.env.POLYGON_KEY;
const BASE_URL = 'https://api.polygon.io/v2/aggs/ticker';

export async function GET({ url }) {
	const stockTicker = url.searchParams.get('tickerSymbol')?.toUpperCase();

	// Definujeme časový rozsah (posledních 48 hodin)
	const to = new Date().toISOString().split('T')[0]; // Dnes
	const from = new Date();
	from.setDate(from.getDate() - 2); // Dva dny zpět
	const fromDateStr = from.toISOString().split('T')[0];

	// API volání na data za posledních 48 hodin v hodinových intervalech
	const response = await fetch(
		`${BASE_URL}/${stockTicker}/range/1/hour/${fromDateStr}/${to}?apiKey=${API_KEY}`
	);
	console.log(
		`Fetching: ${BASE_URL}/${stockTicker}/range/1/hour/${fromDateStr}/${to}?apiKey=${API_KEY}`
	);

	if (!response.ok) {
		return json({ error: 'Failed to fetch stock data' }, { status: response.status });
	}

	const data = await response.json();

	// Pokud nejsou žádná data, vrátíme chybu
	if (!data.results || data.results.length === 0) {
		return json({ error: 'No data available' }, { status: 404 });
	}

	// Seřazení dat podle času (čas je v milisekundách)
	const sortedData = data.results.sort((a, b) => a.t - b.t);

	// První a poslední cena v získaných datech
	const firstPrice = parseFloat(sortedData[0].c.toFixed(2)); // První cena
	const lastPrice = parseFloat(sortedData[sortedData.length - 1].c.toFixed(2)); // Poslední cena

	// Výpočet procentuální změny
	const percentageChange = parseFloat((((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2));

	console.log(
		`First price: ${firstPrice}, Last price: ${lastPrice}, Percentage change: ${percentageChange}`
	);

	return json({
		price: lastPrice,
		percentageChange
	});
}
