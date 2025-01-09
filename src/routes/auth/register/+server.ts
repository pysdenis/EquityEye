import { json } from '@sveltejs/kit';
import User from '$lib/models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.VITE_JWT_SECRET || 'test';

export const POST = async ({ request }) => {
	try {
		const { username, email, password } = await request.json();

		if (!email.includes('@') || !email.includes('.') || email.length < 5) {
			return json({ error: 'Zadejte platný E-mail' }, { status: 400 });
		}

		// Kontrola, jestli už uživatel neexistuje
		const existingUser = await User.findOne({ $or: [{ username }, { email }] });
		if (existingUser) {
			return json({ error: 'Uživatel s tímto jménem nebo E-mailem již existuje' }, { status: 400 });
		}

		// Hash hesla
		const passwordHash = await bcrypt.hash(password, 10);

		// Vytvoření nového uživatele
		const newUser = new User({ username, email, passwordHash });
		await newUser.save();

		// Generate JWT token
		const token = jwt.sign({ id: newUser._id, email: newUser.email }, JWT_SECRET, {
			expiresIn: '1h'
		});

		return json({ message: 'Registrace byla úspěšná!', token }, { status: 201 });
	} catch (error) {
		console.error(error);
		return json({ error: 'Chyba při registraci uživatele.' }, { status: 500 });
	}
};
