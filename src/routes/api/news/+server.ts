import { json } from '@sveltejs/kit';
import Portfolio from '../../../lib/models/PortfolioSchema';

export async function GET({ url }) {
	const apiKey = process.env.NEWS_API_KEY;
	const query = url.searchParams.get('query') || 'stocks';
	const from = url.searchParams.get('from');
	const to = url.searchParams.get('to');
	const sortBy = url.searchParams.get('sortBy') || 'publishedAt';
	const language = url.searchParams.get('language') || 'en';
	const userId = url.searchParams.get('userId');

	let apiUrl = `https://newsapi.org/v2/everything?q=${query}&sortBy=${sortBy}&apiKey=${apiKey}&pageSize=50&language=${language}`;

	if (from) {
		const iso8601Regex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})?)?$/;
		if (!iso8601Regex.test(from)) {
			return json({ error: 'Invalid ISO 8601 format for "from" parameter' }, { status: 400 });
		}
		apiUrl += `&from=${from}`;
	}

	if (to) {
		const iso8601Regex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})?)?$/;
		if (!iso8601Regex.test(to)) {
			return json({ error: 'Invalid ISO 8601 format for "to" parameter' }, { status: 400 });
		}
		apiUrl += `&to=${to}`;
	}

	if (userId && query === 'stocks') {
		try {
			const portfolio = await Portfolio.findOne({ userId });

			if (!portfolio || !portfolio.stocks.length) {
				return json({ error: 'Uživatel nemá žádné akcie v portfoliu' }, { status: 404 }); //TODO neshazovat chybu, ale vrátit prázdný seznam
			}

			const tickers = [...new Set(portfolio.stocks.map((stock) => stock.ticker))];

			const query = tickers.join(' OR ');
			let apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=${sortBy}&apiKey=${apiKey}&pageSize=50&language=${language}`;

			if (from) apiUrl += `&from=${from}`;
			if (to) apiUrl += `&to=${to}`;

			// 🟢 3️⃣ Volání NewsAPI
			const response = await fetch(apiUrl);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Chyba při načítání dat z NewsAPI');
			}

			// 🟢 4️⃣ Vrácení výsledků
			return json(data);
		} catch (error) {
			return json({ error: (error as Error).message }, { status: 500 });
		}
	}

	try {
		const response = await fetch(apiUrl);
		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message || 'Chyba při načítání dat z NewsAPI');
		}

		return json(data);
	} catch (error) {
		return json({ error: (error as Error).message }, { status: 500 });
	}
}
