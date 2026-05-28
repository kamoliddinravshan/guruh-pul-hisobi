import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI .env faylida ko\'rsatilmagan');
  await mongoose.connect(uri);
  console.log('MongoDB ulandi');
}
