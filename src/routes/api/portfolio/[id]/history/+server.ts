import { connectToDB } from '$lib/db';
import { Portfolio } from '$lib/models/Portfolio';

export async function GET({ params, url }: { params: { id: string }; url: URL }) {
	await connectToDB();

	// Načti parametr 'filter' z query stringu (např. ?filter=1M)
	const filter = url.searchParams.get('filter') || 'ALL';

	// Najdi portfolio podle userId
	const portfolio = await Portfolio.findOne({ userId: params.id }).select('history');
	if (!portfolio) {
		return new Response('Portfolio not found', { status: 404 });
	}

	// Načti celou historii
	const history = portfolio.history;

	// Filtrování historie na základě 'filter'
	const filteredHistory = filterHistory(history, filter);

	return new Response(JSON.stringify(filteredHistory), { status: 200 });
}

/**
 * Filtruje historii portfolia na základě časového období.
 *
 * @param history - Pole záznamů historie
 * @param filter - Filtr (např. '24h', '1M', '3M', '6M', '1Y', 'ALL')
 * @returns Filtrované záznamy
 */
function filterHistory(
	history: { date: Date; value: number }[],
	filter: string
): { date: Date; value: number }[] {
	if (filter === 'ALL') {
		return history;
	}

	// Definuj počet měsíců pro každý filtr
	const monthsMap: Record<string, number> = {
		'1M': 1,
		'3M': 3,
		'6M': 6,
		'1Y': 12,
	};

	const months = monthsMap[filter];
	if (!months) {
		throw new Error('Invalid filter');
	}

	const cutoffDate = new Date();
	cutoffDate.setMonth(cutoffDate.getMonth() - months);

	return history.filter((record) => new Date(record.date) >= cutoffDate);
}
