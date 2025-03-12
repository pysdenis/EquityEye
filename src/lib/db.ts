import mongoose from 'mongoose';

const connectDb = async () => {
	try {
		if (mongoose.connection.readyState >= 1) return;

		const dbUri = process.env.MONGO_URI;
		if (!dbUri) {
			console.error('Není nastavena proměnná prostředí MONGO_URI');
			process.exit(1);
		}
		await mongoose.connect(dbUri, {
			dbName: 'equityeye',
		});
	} catch (error) {
		console.error('Chyba při připojování k databázi MongoDB:', error);
		process.exit(1);
	}
};

export default connectDb;
