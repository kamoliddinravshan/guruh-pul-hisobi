import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn('MONGO_URI ko\'rsatilmagan. Auth ma\'lumotlari lokal faylda saqlanadi.');
    return false;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log('MongoDB ulandi');
    return true;
  } catch (error) {
    console.warn(`MongoDB ulanmagan (${error.message}). Auth ma'lumotlari lokal faylda saqlanadi.`);
    return false;
  }
}
