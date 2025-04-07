import { json } from '@sveltejs/kit';
import Portfolio from '../../../lib/models/PortfolioSchema';

export async function GET({ url }) {
	const userId = url.searchParams.get('userId');
	try {
		const portfolio = await Portfolio.findOne({ userId });

		if (portfolio && portfolio.stocks.length > 0) {
			const tickers = [...new Set(portfolio.stocks.map((stock) => stock.ticker))];
			return json({ tickers });
		} else {
			return json({ tickers: [] });
		}
	} catch (error) {
		console.error('Error fetching user stocks:', error);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
