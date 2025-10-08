import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';
import { ensureAuthApi } from '../middlewares/auth.js';

const router = Router();

function parseFilter(q){
  if(!q) return {};
  return q.split(',').reduce((acc,p)=>{
    const [k,v]=p.split(':');
    if(!k) return acc;
    if(v==='true') acc[k]=true;
    else if(v==='false') acc[k]=false;
    else if(!Number.isNaN(Number(v))) acc[k]=Number(v);
    else acc[k]=v;
    return acc;
  },{});
}

// GET find + projection
router.get('/', async (req,res)=>{
  try{
    const col = getDB().collection('items');
    const filter = parseFilter(req.query.q);
    const limit = Math.min(Number(req.query.limit)||20, 100);
    const skip = Number(req.query.skip)||0;
    let projection;
    if (req.query.fields) {
      projection = req.query.fields.split(',').reduce((acc, f)=>{
        const key = f.trim(); if(key) acc[key]=1; return acc;
      },{});
    }
    const cursor = col.find(filter, projection?{ projection } : {}).skip(skip).limit(limit);
    const items = await cursor.toArray();
    const total = await col.countDocuments(filter);
    res.json({ total, count: items.length, items });
  }catch(e){
    res.status(500).json({ message:'Read error', error:String(e.message||e) });
  }
});

// insertOne
router.post('/', ensureAuthApi, async (req,res)=>{
  try{
    const col = getDB().collection('items');
    const body = req.body;
    if(!body || typeof body !== 'object') return res.status(400).json({ message:'Body must be an object' });
    const r = await col.insertOne(body);
    res.status(201).json({ insertedId: r.insertedId, acknowledged: r.acknowledged });
  }catch(e){
    res.status(500).json({ message:'InsertOne error', error:String(e.message||e) });
  }
});

// insertMany
router.post('/bulk', ensureAuthApi, async (req,res)=>{
  try{
    const col = getDB().collection('items');
    const docs = Array.isArray(req.body) ? req.body : null;
    if(!docs || !docs.length) return res.status(400).json({ message:'Body must be a non-empty array' });
    const r = await col.insertMany(docs, { ordered:false });
    res.status(201).json({ insertedCount:r.insertedCount, insertedIds:r.insertedIds });
  }catch(e){
    res.status(500).json({ message:'InsertMany error', error:String(e.message||e) });
  }
});

// updateOne
router.patch('/:id', ensureAuthApi, async (req,res)=>{
  try{
    const col = getDB().collection('items');
    const r = await col.updateOne({ _id:new ObjectId(req.params.id) }, { $set: req.body || {} });
    res.json({ matchedCount:r.matchedCount, modifiedCount:r.modifiedCount });
  }catch(e){
    res.status(500).json({ message:'UpdateOne error', error:String(e.message||e) });
  }
});

// updateMany
router.patch('/', ensureAuthApi, async (req,res)=>{
  try{
    const col = getDB().collection('items');
    const { filter = {}, update = {} } = req.body || {};
    const r = await col.updateMany(filter, { $set: update });
    res.json({ matchedCount:r.matchedCount, modifiedCount:r.modifiedCount });
  }catch(e){
    res.status(500).json({ message:'UpdateMany error', error:String(e.message||e) });
  }
});

// replaceOne
router.put('/:id', ensureAuthApi, async (req,res)=>{
  try{
    const col = getDB().collection('items');
    const r = await col.replaceOne({ _id:new ObjectId(req.params.id) }, req.body || {}, { upsert:false });
    res.json({ matchedCount:r.matchedCount, modifiedCount:r.modifiedCount, upsertedId:r.upsertedId ?? null });
  }catch(e){
    res.status(500).json({ message:'ReplaceOne error', error:String(e.message||e) });
  }
});

// deleteOne
router.delete('/:id', ensureAuthApi, async (req,res)=>{
  try{
    const col = getDB().collection('items');
    const r = await col.deleteOne({ _id:new ObjectId(req.params.id) });
    res.json({ deletedCount:r.deletedCount });
  }catch(e){
    res.status(500).json({ message:'DeleteOne error', error:String(e.message||e) });
  }
});

// deleteMany
router.delete('/', ensureAuthApi, async (req,res)=>{
  try{
    const col = getDB().collection('items');
    const { filter = {} } = req.body || {};
    const r = await col.deleteMany(filter);
    res.json({ deletedCount:r.deletedCount });
  }catch(e){
    res.status(500).json({ message:'DeleteMany error', error:String(e.message||e) });
  }
});

export default router;