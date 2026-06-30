import dns from 'dns';
import mongoose from 'mongoose';

dns.setServers(['8.8.8.8']);

let isConnected = false;

export async function connectToDatabase(): Promise<void> {
    if (isConnected) return;

    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI environment variable is not set');

    await mongoose.connect(uri);
    isConnected = true;
    console.log('MongoDB connected successfully');
}
