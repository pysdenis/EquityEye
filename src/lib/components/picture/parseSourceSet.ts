import { querySizeMappings } from "./querySizeMappings.js";

export function parseSourceSet(query: string): string {
	const size = querySizeMappings[query.slice(1) as keyof typeof querySizeMappings];
	const isMin = query.startsWith(">");
	return `(${isMin ? "min" : "max"}-width: ${size - (isMin ? 0 : 1)}px)`;
}
