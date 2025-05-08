import { json } from '@sveltejs/kit';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import User from '../../../lib/models/User';
import Portfolio from '../../../lib/models/PortfolioSchema';
import Notification from '../../../lib/models/NotificationsSchema';

const getStock24hChange = async (ticker: string) => {
	const now = new Date();
	const from = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
	const url = new URL('/api/stockNameDate', process.env.PUBLIC_URL || 'http://localhost');
	url.searchParams.set('tickerSymbol', ticker);
	url.searchParams.set('multiplier', '1');
	url.searchParams.set('timespan', 'day');
	url.searchParams.set('from', from);
	try {
		const res = await fetch(url.toString());
		if (!res.ok) return { price: 0, change: 0 };
		const data = await res.json();
		if (!data || data.length < 2) return { price: data[0]?.y ?? 0, change: 0 };
		const priceNow = data[data.length - 1].y;
		const price24hAgo = data[0].y;
		const change = ((priceNow - price24hAgo) / price24hAgo) * 100;
		return { price: priceNow, change };
	} catch {
		return { price: 0, change: 0 };
	}
};

export async function GET({ request }) {
	try {
		const authHeader = request.headers.get('authorization');
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const token = authHeader.slice(7);
		const decoded = jwt.verify(token, process.env.VITE_JWT_SECRET || '') as JwtPayload;
		if (!decoded.id) {
			return json({ error: 'Invalid token' }, { status: 400 });
		}
		const userId = decoded.id;
		const user = await User.findById(userId);
		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}
		const portfolio = await Portfolio.findOne({ userId });
		const stocks = (portfolio?.stocks ?? []).filter((s) => s.amount > 0);
		const stocksOut = [];
		let portfolioValue = 0;
		let portfolioValue24hAgo = 0;
		for (const stock of stocks.slice(0, 3)) {
			const { price, change } = await getStock24hChange(stock.ticker);
			stocksOut.push({
				ticker: stock.ticker,
				price,
				change
			});
			portfolioValue += price * stock.amount;
			portfolioValue24hAgo += price / (1 + change / 100) * stock.amount;
		}
		// Pro celé portfolio (všechny akcie)
		for (const stock of stocks) {
			const { price, change } = await getStock24hChange(stock.ticker);
			portfolioValue += price * stock.amount;
			portfolioValue24hAgo += price / (1 + change / 100) * stock.amount;
		}
		const portfolioChange = portfolioValue24hAgo > 0 ? ((portfolioValue - portfolioValue24hAgo) / portfolioValue24hAgo) * 100 : 0;
		const lastNotification = await Notification.findOne({ userId }).sort({ createdAt: -1 });
		return json({
			username: user.username,
			portfolioValue,
			portfolioChange,
			stocks: stocksOut,
			lastNotification: lastNotification ? {
				message: lastNotification.message,
				createdAt: lastNotification.createdAt
			} : null
		});
	} catch (error) {
		console.error(error);
		return json({ error: 'Failed to fetch user data' }, { status: 500 });
	}
}
