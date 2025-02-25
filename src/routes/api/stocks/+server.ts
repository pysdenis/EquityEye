import { json } from '@sveltejs/kit';

const API_KEY = process.env.POLYGON_KEY;
const BASE_URL = 'https://api.polygon.io/v2/aggs/ticker';

export async function GET({ url }) {
  const ticker = url.searchParams.get('ticker');
  const response = await fetch(`${BASE_URL}/${ticker}/prev?apiKey=${API_KEY}`);

  if (!response.ok) {
    return json({ error: 'Nepodařilo se získat data.' }, { status: 500 });
  }

  const data = await response.json();
  return json(data);
}
