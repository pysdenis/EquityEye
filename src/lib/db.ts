import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

export async function connectToDB() {
	if (!process.env.MONGO_URI) {
		console.error('MONGO_URI is not set');
		return;
	} else {
		console.log('MONGO_URI:', process.env.MONGO_URI);
	}

	if (!isConnected) {
		try {
			await mongoose.connect(process.env.MONGO_URI, {});
			isConnected = true;
			console.log('Connected to MongoDB');
		} catch (error) {
			console.error('Failed to connect to MongoDB:', error);
		}
	}
}
