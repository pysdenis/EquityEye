import { type RequestHandler } from '@sveltejs/kit';
import Portfolio from '../../../../lib/models/PortfolioSchema';
import Notification from '../../../../lib/models/NotificationsSchema';

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

const getStockPriceNow = async (ticker: string): Promise<number | null> => {
	try {
		const response = await fetch(
			`https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?apiKey=${API_KEY}`
		);

		if (!response.ok) {
			console.error('Chyba při získávání ceny akcie');
			return null;
		}

		const data = await response.json();
		return data.results[0].c ?? null;
	} catch (error) {
		console.error('Chyba při získávání ceny akcie:', error);
		return null;
	}
};

// Endpoint pro přidání akcie do portfolia
export const POST: RequestHandler = async ({ request }) => {
	const { ticker, amount, userId, buyDate } = await request.json();
	let priceAtTime = null;

	if (buyDate === new Date().toISOString().split('T')[0]) {
		priceAtTime = await getStockPriceNow(ticker);
	} else {
		//Získání aktuální ceny akcie
		priceAtTime = await getStockPrice(ticker, buyDate);
	}

	if (priceAtTime === null) {
		return new Response(JSON.stringify({ error: 'Chyba při získávání ceny akcie' }), {
			status: 500
		});
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
						dateAdded: new Date(buyDate)
					}
				]
			});
			await newPortfolio.save();
		} else {
			// Pokud portfolio existuje, přidá novou akcii
			portfolio.stocks.push({
				ticker,
				amount,
				priceAtTime,
				dateAdded: new Date(buyDate)
			});
			await portfolio.save();
		}

		await Notification.create({
			userId,
			type: 'stock_purchase',
			message: `Zakoupil jsi ${amount} ks ${ticker} za ${priceAtTime} USD`,
			relatedStock: ticker
		});

		return new Response(JSON.stringify({ message: 'Akcie úspěšně přidána do portfolia' }), {
			status: 200
		});
	} catch (error) {
		return new Response(
			JSON.stringify({ error: 'Chyba při ukládání akcie do portfolia' + error }),
			{ status: 500 }
		);
	}
};
