// import { json } from '@sveltejs/kit';
// import jwt from 'jsonwebtoken';
// import User from '../../../../lib/models/User';

// export async function PUT({ request }) {
// 	try {
// 		const authHeader = request.headers.get('authorization');
// 		if (!authHeader || !authHeader.startsWith('Bearer ')) {
// 			return json({ error: 'Unauthorized' }, { status: 401 });
// 		}

// 		const token = authHeader.split(' ')[1];
// 		const decoded = jwt.verify(token, process.env.VITE_JWT_SECRET || '');

// 		// Aktualizace dat uživatele
// 		const body = await request.json();
// 		const updatedUser = await User.findByIdAndUpdate(
// 			decoded.id,
// 			{ preferences: body.preferences },
// 			{ new: true }
// 		);

// 		return json(updatedUser);
// 	} catch (error) {
// 		console.error(error);
// 		return json({ error: 'Failed to update preferences' }, { status: 500 });
// 	}
// }

// TODO NOT IN MVP

/*
<form on:submit|preventDefault={updatePreferences}>
		<label>
		  Preferred Currency:
		  <input type="text" bind:value={preferences.currency} />
		</label>
		<button type="submit">Update</button>
	  </form>

	  	let preferences = userData?.preferences || {};

const updatePreferences = async () => {
  const token = get(userStore).token;

  const response = await fetch('/api/dashboard/preferences', {
	method: 'PUT',
	headers: {
	  'Content-Type': 'application/json',
	  Authorization: `Bearer ${token}`,
	},
	body: JSON.stringify({ preferences }),
  });

  if (response.ok) {
	alert('Preferences updated!');
  } else {
	alert('Failed to update preferences');
  }
};

*/
