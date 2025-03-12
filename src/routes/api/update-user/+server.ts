import { json } from "@sveltejs/kit";
import bcrypt from "bcrypt";
import User from "$lib/models/User";

export async function POST({ request }) {
	const { userId, newUsername, oldPassword, newPassword } = await request.json();

	// Najdeme uživatele podle ID
	const user = await User.findById(userId).select("+passwordHash");

	if (!user) {
		return json({ error: "Uživatel nenalezen." }, { status: 404 });
	}

	// Pokud chce změnit username
	if (newUsername) {
		const existingUser = await User.findOne({ username: newUsername });
		if (existingUser) {
			return json({ error: "Toto uživatelské jméno je již obsazené." }, { status: 400 });
		}
		user.username = newUsername;
	}

	// Pokud chce změnit heslo
	if (newPassword) {
		const passwordMatch = await bcrypt.compare(oldPassword, user.passwordHash);
		if (!passwordMatch) {
			return json({ error: "Špatné staré heslo." }, { status: 401 });
		}
		user.passwordHash = await bcrypt.hash(newPassword, 10);
	}

	await user.save();
	return json({ message: "Údaje byly úspěšně změněny." });
}
