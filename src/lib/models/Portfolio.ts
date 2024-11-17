import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAsset {
	symbol: string;
	name: string;
	amount: number;
	currentPrice: number;
}

export interface IHistory {
	date: Date;
	value: number;
}

export interface IPortfolio extends Document {
	userId: mongoose.Types.ObjectId;
	assets: IAsset[];
	history: IHistory[];
}

const PortfolioSchema: Schema<IPortfolio> = new Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	assets: [
		{
			symbol: String,
			name: String,
			amount: Number,
			currentPrice: Number,
		},
	],
	history: [
		{
			date: Date,
			value: Number,
		},
	],
});

export const Portfolio: Model<IPortfolio> = mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);
