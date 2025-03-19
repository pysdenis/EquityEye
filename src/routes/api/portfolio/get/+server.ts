import { type RequestHandler } from '@sveltejs/kit';
import Portfolio from '../../../../lib/models/PortfolioSchema';

// Endpoint pro získání portfolia uživatele
export const GET: RequestHandler = async ({ url }) => {
	const userId = url.searchParams.get('userId');

	console.log('userId:', userId);

	if (!userId) {
		return new Response(JSON.stringify({ error: 'Chybí userId parametr' }), { status: 400 });
	}

	try {
		const portfolio = await Portfolio.findOne({ userId });

		if (!portfolio) {
			return new Response(JSON.stringify({ error: 'Portfolio nenalezeno' }), { status: 404 });
		}

		return new Response(
			JSON.stringify({
				stocks: portfolio.stocks.map((stock) => ({
					ticker: stock.ticker,
					amount: stock.amount,
					priceAtTime: stock.priceAtTime,
					dateAdded: stock.dateAdded,
					dateSold: stock.dateSold
				}))
			}),
			{ status: 200 }
		);
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Chyba při získávání portfolia: ' + error }), {
			status: 500
		});
	}
};
