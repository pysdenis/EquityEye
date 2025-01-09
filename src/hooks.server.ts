import connectDb from '$lib/db';
import 'dotenv/config';

export async function handle({ event, resolve }) {
	await connectDb(); // Připojení k databázi

	return resolve(event); // Pokračování v zpracování požadavku
}
