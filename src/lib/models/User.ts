import mongoose from 'mongoose';

export interface IUser extends Document {
	username: string;
	email: string;
	passwordHash: string;
}

export interface User extends IUser {
	createdAt: Date;
	portfolioId: mongoose.Schema.Types.ObjectId;
	notifications: Array<unknown>;
	preferences: object;
}

const UserSchema = new mongoose.Schema({
	username: { type: String, unique: true, required: true },
	email: { type: String, unique: true, required: true },
	passwordHash: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
	portfolioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio' },
	notifications: { type: Array, default: [] },
	preferences: { type: Object, default: {} }
});

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
