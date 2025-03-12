import { type RequestHandler } from '@sveltejs/kit';
import Portfolio from '../../../../lib/models/PortfolioSchema';

const API_KEY = process.env.POLYGON_KEY;

// Funkce pro získání ceny akcie
const getStockPrice = async (ticker: string, date: string): Promise<number | null> => {
	try {
		const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${date}/${date}?apiKey=${API_KEY}`; //change to range one minute
		const response = await fetch(url);

		if (!response.ok) {
			console.error(`Chyba při získávání dat pro ${ticker} (${date})`);
			return null;
		}

		const data = await response.json();

		if (!data.results || data.results.length === 0) {
			console.warn(`Žádná data pro ${ticker} (${date})`);
			return null;
		}

		return data.results[0].c ?? null; // 'c' = close price (závěrečná cena dne)
	} catch (error) {
		console.error('Chyba při získávání ceny akcie:', error);
		return null;
	}
};

// Endpoint pro přidání akcie do portfolia
export const POST: RequestHandler = async ({ request }) => {
	const { ticker, amount, userId, buyDate } = await request.json();

	// Získání aktuální ceny akcie
	const priceAtTime = await getStockPrice(ticker, buyDate);

	if (priceAtTime === null) {
		return new Response(JSON.stringify({ error: 'Chyba při získávání ceny akcie' }), { status: 500 });
	}

	// Uložení akcie do portfolia
	try {
		const portfolio = await Portfolio.findOne({ userId });

		if (!portfolio) {
			// Pokud portfolio neexistuje, vytvoří nové
			const newPortfolio = new Portfolio({
				userId,
				stocks: [
					{
						ticker,
						amount,
						priceAtTime,
						dateAdded: new Date(buyDate),
					},
				],
			});
			await newPortfolio.save();
		} else {
			// Pokud portfolio existuje, přidá novou akcii
			portfolio.stocks.push({
				ticker,
				amount,
				priceAtTime,
				dateAdded: new Date(buyDate),
			});
			await portfolio.save();
		}

		return new Response(JSON.stringify({ message: 'Akcie úspěšně přidána do portfolia' }), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Chyba při ukládání akcie do portfolia' + error }), { status: 500 });
	}
};
