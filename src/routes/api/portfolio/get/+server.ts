// import { json } from '@sveltejs/kit';
// import type { RequestHandler } from './$types';
// import type { PortfolioData, Stock } from '$lib/types/portfolioTypes';
// import Portfolio from '$lib/models/PortfolioSchema';

// const API_KEY = process.env.POLYGON_KEY as string;

// // Funkce pro získání aktuální ceny akcie
// async function getCurrentPrice(ticker: string): Promise<number | null> {
// 	try {
// 		const response = await fetch(`https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?apiKey=${API_KEY}`);
// 		const data = await response.json();

// 		if (!response.ok || !data.results || data.results.length === 0) {
// 			console.warn(`Chyba při načítání ceny pro ${ticker}`);
// 			return null;
// 		}

// 		return data.results[0].c ?? null; // 'c' = close price
// 	} catch (error) {
// 		console.error('Chyba při získávání aktuální ceny:', error);
// 		return null;
// 	}
// }

// // API Handler
// export const GET: RequestHandler = async ({ url }) => {
// 	const userId = url.searchParams.get('userId');

// 	if (!userId) {
// 		return json({ error: 'userId je povinný parametr' }, { status: 400 });
// 	}

// 	try {
// 		const portfolio = await Portfolio.findOne({ userId });

// 		if (!portfolio || !portfolio.stocks.length) {
// 			return json({ error: 'Portfolio neobsahuje žádné akcie' }, { status: 404 });
// 		}

// 		// Mapování na správné typy
// 		const stocks: Stock[] = await Promise.all(
// 			portfolio.stocks.map(async (stock) => ({
// 				ticker: stock.ticker,
// 				amount: stock.amount,
// 				priceAtTime: stock.priceAtTime,
// 				currentPrice: (await getCurrentPrice(stock.ticker)) ?? stock.priceAtTime, // Fallback na cenu při nákupu
// 			}))
// 		);

// 		// Výpočet celkových hodnot
// 		const totalInvested = stocks.reduce((sum, stock) => sum + stock.amount * stock.priceAtTime, 0);
// 		const totalValue = stocks.reduce((sum, stock) => sum + stock.amount * stock.currentPrice, 0);

// 		const response: PortfolioData = { stocks, totalInvested, totalValue };
// 		return json(response);
// 	} catch (error) {
// 		return json({ error: (error as Error).message }, { status: 500 });
// 	}
// };
