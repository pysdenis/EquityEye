import mongoose, { Document } from 'mongoose';

export interface IUser extends Document {
	username: string;
	email: string;
	passwordHash: string;
	createdAt: Date;
	portfolioId?: mongoose.Schema.Types.ObjectId;
	notifications: unknown[];
	preferences: Record<string, unknown>;
}

const UserSchema = new mongoose.Schema<IUser>({
	username: { type: String, unique: true, required: true },
	email: {
		type: String,
		unique: true,
		required: true,
		match: [/\S+@\S+\.\S+/, 'Email is invalid'],
	},
	passwordHash: { type: String, required: true, select: false }, // Skryté při načítání
	createdAt: { type: Date, default: Date.now },
	portfolioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio', required: false },
	notifications: { type: [Object], default: [] }, // Pole s výchozí hodnotou
	preferences: { type: mongoose.Schema.Types.Mixed, default: {} }, // Libovolný objekt
});

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
