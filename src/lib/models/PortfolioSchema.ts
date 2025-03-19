import mongoose, { Document } from 'mongoose';

export interface IPortfolio extends Document {
	userId: mongoose.Schema.Types.ObjectId;
	stocks: {
		ticker: string;
		amount: number;
		priceAtTime: number;
		dateAdded: Date;
		dateSold?: Date;
	}[];
}

const PortfolioSchema = new mongoose.Schema<IPortfolio>({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	stocks: {
		type: [
			{
				ticker: { type: String, required: true },
				amount: { type: Number, required: true },
				priceAtTime: { type: Number, required: true },
				dateAdded: { type: Date, default: Date.now },
				dateSold: { type: Date },
			},
		],
		default: [],
	},
});

const Portfolio = mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);

export default Portfolio;
