import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Article from './src/models/Article.js';

async function run(){
  const uri = process.env.MONGODB_URI;
  if(!uri){ console.error('Set MONGODB_URI first'); process.exit(1); }
  await mongoose.connect(uri, { dbName: 'dz64' });
  await Article.deleteMany({});
  await Article.insertMany([
    { title: 'Перша стаття', body: 'Тут контент першої статті.' },
    { title: 'Друга стаття', body: 'Тут контент другої статті.' }
  ]);
  console.log('Seed done');
  await mongoose.disconnect();
}
run().catch(e=>{ console.error(e); process.exit(1); });
