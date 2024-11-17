import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
	email: string;
	password: string;
	comparePassword: (password: string) => Promise<boolean>;
}

export interface User {
	email: string;
	token: string;
}

const UserSchema: Schema<IUser> = new Schema({
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
});

UserSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, 10);
	}
	next();
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
	return bcrypt.compare(password, this.password);
};

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
