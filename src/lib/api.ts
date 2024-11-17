export async function fetchPortfolioHistory(userId: string, filter: string = 'ALL') {
	try {
		const response = await fetch(`/api/portfolio/${userId}/history?filter=${filter}`);
		if (!response.ok) {
			throw new Error(`Failed to fetch portfolio history: ${response.statusText}`);
		}
		const data = await response.json();
		return data; // Vrátí historii portfolia jako pole
	} catch (error) {
		console.error(error);
		throw error;
	}
}
