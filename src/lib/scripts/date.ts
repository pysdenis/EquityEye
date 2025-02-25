export function localizeDate(date: string): string {
	const d = new Date(date);
	const day = d.getUTCDate();
	const month = d.getUTCMonth() + 1;
	const year = d.getUTCFullYear();
	return `${day}. ${month}. ${year}`;
}
