import mongoose from 'mongoose';

let isConnected = false;

export async function connectToDB() {
	if (!isConnected) {
		try {
			await mongoose.connect(process.env.MONGO_URI || '', {});
			isConnected = true;
			console.log('Connected to MongoDB');
		} catch (error) {
			console.error('Failed to connect to MongoDB:', error);
		}
	}
}
