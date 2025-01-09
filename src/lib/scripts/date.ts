export function localizeDate(date: string): string {
	return new Date(date).toLocaleDateString();
}
