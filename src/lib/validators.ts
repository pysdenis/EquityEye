import { z } from 'zod';

export const userSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

export const historySchema = z.object({
	date: z.string().transform((str) => new Date(str)),
	value: z.number().positive(),
});

export const assetSchema = z.object({
	symbol: z.string(),
	name: z.string(),
	amount: z.number().positive(),
	currentPrice: z.number().positive(),
});
