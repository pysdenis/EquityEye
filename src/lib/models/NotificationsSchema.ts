import mongoose, { Document } from 'mongoose';

export interface INotification extends Document {
	userId: mongoose.Schema.Types.ObjectId;
	type: 'stock_purchase' | 'price_alert' | 'dividend'; // zatím jen stock_purchase
	message: string;
	seen: boolean;
	createdAt: Date;
	relatedStock?: string;
}

const NotificationSchema = new mongoose.Schema<INotification>({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	type: { type: String, required: true },
	message: { type: String, required: true },
	seen: { type: Boolean, default: false },
	createdAt: { type: Date, default: Date.now },
	relatedStock: { type: String }
});

const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
