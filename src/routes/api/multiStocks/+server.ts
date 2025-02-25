import { json } from '@sveltejs/kit';

const API_KEY = process.env.POLYGON_KEY;
const BASE_URL = 'https://api.polygon.io/v2/aggs/ticker';

const stockList = [
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.' },
  { ticker: 'TSLA', name: 'Tesla Inc.' },
  { ticker: 'MSFT', name: 'Microsoft Corp.' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.' }
];

export async function GET() {
  const stockDataPromises = stockList.map(async (stock) => {
    const response = await fetch(`${BASE_URL}/${stock.ticker}/prev?apiKey=${API_KEY}`);

    if (!response.ok) {
      return { ticker: stock.ticker, error: 'Chyba při načítání dat' };
    }

    const data = await response.json();
    return {
      ticker: stock.ticker,
      name: stock.name,
      price: data.results[0]?.c ? data.results[0].c : 'Není dostupná cena'
    };
  });

  const stockData = await Promise.all(stockDataPromises);

  return json(stockData);
}
