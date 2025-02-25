import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	const apiKey = process.env.NEWS_API_KEY;
	const query = url.searchParams.get('query') || 'stocks';
	const from = url.searchParams.get('from');
	const to = url.searchParams.get('to');
	const sortBy = url.searchParams.get('sortBy') || 'publishedAt';
	const language = url.searchParams.get('language') || 'en';
	const userPortfolio = url.searchParams.get('userPortfolio');

	console.log(apiKey);

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

	if (userPortfolio) {
		apiUrl += `&q=${userPortfolio}`; // TODO userportfolio
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
