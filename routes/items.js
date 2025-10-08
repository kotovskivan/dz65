import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';
import { ensureAuthApi } from '../middlewares/auth.js';

const router = Router();

function parseKeyValCsv(q){
  if(!q) return {};
  return q.split(',').reduce((acc,p) => {
    const [k,v] = p.split(':');
    if(!k) return acc;
    if(v === 'true') acc[k] = true;
    else if(v === 'false') acc[k] = false;
    else if(!Number.isNaN(Number(v))) acc[k] = Number(v);
    else acc[k] = v;
    return acc;
  }, {});
}

function parseProjection(q){
  if(!q) return undefined;
  const obj = {};
  q.split(',').forEach(p=>{
    const [k,v] = p.split(':');
    if(!k) return;
    const n = Number(v);
    obj[k] = Number.isNaN(n) ? 1 : n;
  });
  return obj;
}

router.get('/', async (req, res) => {
  try{
    const col = getDB().collection('items');
    const filter = parseKeyValCsv(req.query.filter);
    const projection = parseProjection(req.query.projection);
    const sort = parseKeyValCsv(req.query.sort);
    const limit = Math.min(Number(req.query.limit) || 20, 200);
    const skip = Number(req.query.skip) || 0;

    const cursor = col.find(filter, { projection }).sort(sort).skip(skip).limit(limit);
    const data = await cursor.toArray();
    const total = await col.countDocuments(filter);
    res.json({ total, count: data.length, items: data });
  }catch(e){
    res.status(500).json({ message: 'Find error', error: String(e.message || e) });
  }
});

router.get('/:id', async (req,res)=>{
  try{
    const col = getDB().collection('items');
    const _id = new ObjectId(req.params.id);
    const doc = await col.findOne({ _id });
    if(!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  }catch(e){
    res.status(400).json({ message: 'Invalid id', error: String(e.message || e) });
  }
});

router.post('/', ensureAuthApi, async (req,res)=>{
  try{
    const col = getDB().collection('items');
    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const r = await col.insertOne({ ...payload, createdAt: new Date() });
    res.status(201).json({ insertedId: r.insertedId });
  }catch(e){
    res.status(500).json({ message: 'InsertOne error', error: String(e.message || e) });
  }
});

router.post('/bulk', ensureAuthApi, async (req,res)=>{
  try{
    const col = getDB().collection('items');
    const docs = Array.isArray(req.body) ? req.body : (req.body?.docs || []);
    if(!Array.isArray(docs) || docs.length === 0) return res.status(400).json({ message: 'Provide array of documents' });
    const withMeta = docs.map(d => ({ ...d, createdAt: new Date() }));
    const r = await col.insertMany(withMeta);
    res.status(201).json({ insertedCount: r.insertedCount, insertedIds: r.insertedIds });
  }catch(e){
    res.status(500).json({ message: 'InsertMany error', error: String(e.message || e) });
  }
});

router.patch('/:id', ensureAuthApi, async (req,res)=>{
  try{
    const col = getDB().collection('items');
    const _id = new ObjectId(req.params.id);
    const { $set = req.body } = req.body || {};
    const r = await col.updateOne({ _id }, { $set, $currentDate: { updatedAt: true } });
    res.json({ matchedCount: r.matchedCount, modifiedCount: r.modifiedCount });
  }catch(e){
    res.status(500).json({ message: 'UpdateOne error', error: String(e.message || e) });
  }
});

router.patch('/', ensureAuthApi, async (req,res)=>{
  try{
    const col = getDB().collection('items');
    const { filter = {}, update = {} } = req.body || {};
    const r = await col.updateMany(filter, { ...update, $currentDate: { ...(update.$currentDate||{}), updatedAt: true } });
    res.json({ matchedCount: r.matchedCount, modifiedCount: r.modifiedCount });
  }catch(e){
    res.status(500).json({ message: 'UpdateMany error', error: String(e.message || e) });
  }
});

router.put('/:id', ensureAuthApi, async (req,res)=>{
  try{
    const col = getDB().collection('items');
    const _id = new ObjectId(req.params.id);
    const replacement = req.body && typeof req.body === 'object' ? req.body : {};
    replacement.updatedAt = new Date();
    const r = await col.replaceOne({ _id }, replacement, { upsert: false });
    res.json({ matchedCount: r.matchedCount, modifiedCount: r.modifiedCount });
  }catch(e){
    res.status(500).json({ message: 'ReplaceOne error', error: String(e.message || e) });
  }
});

router.delete('/:id', ensureAuthApi, async (req,res)=>{
  try{
    const col = getDB().collection('items');
    const _id = new ObjectId(req.params.id);
    const r = await col.deleteOne({ _id });
    res.json({ deletedCount: r.deletedCount });
  }catch(e){
    res.status(500).json({ message: 'DeleteOne error', error: String(e.message || e) });
  }
});

router.delete('/', ensureAuthApi, async (req,res)=>{
  try{
    const col = getDB().collection('items');
    const { filter = {} } = req.body || {};
    const r = await col.deleteMany(filter);
    res.json({ deletedCount: r.deletedCount });
  }catch(e){
    res.status(500).json({ message: 'DeleteMany error', error: String(e.message || e) });
  }
});

export default router;
