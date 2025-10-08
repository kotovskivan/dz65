import { Router } from "express";
import { ObjectId } from "mongodb";
import { getCollection } from "../lib/db.js";
const router = Router();

function parseFindOptions(q){
  const limit = Math.min(parseInt(q.limit ?? "20",10)||20, 100);
  const skip = Math.max(parseInt(q.skip ?? "0",10)||0, 0);
  const sort = q.sort ? JSON.parse(q.sort) : { _id: -1 };
  const projection = q.projection ? JSON.parse(q.projection) : undefined;
  return { limit, skip, sort, projection };
}

router.get("/", async (req,res,next)=>{
  try{
    const col = await getCollection();
    const { limit, skip, sort, projection } = parseFindOptions(req.query);
    const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
    const items = await col.find(filter, { projection }).sort(sort).skip(skip).limit(limit).toArray();
    const total = await col.countDocuments(filter);
    res.json({ items, total, limit, skip });
  }catch(e){ next(e); }
});

router.get("/:id", async (req,res,next)=>{
  try{
    const col = await getCollection();
    const _id = new ObjectId(req.params.id);
    const doc = await col.findOne({ _id });
    if(!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  }catch(e){ next(e); }
});

router.post("/", async (req,res,next)=>{
  try{
    const col = await getCollection();
    const r = await col.insertOne(req.body);
    res.status(201).json(r);
  }catch(e){ next(e); }
});

router.post("/many", async (req,res,next)=>{
  try{
    if(!Array.isArray(req.body)) return res.status(400).json({ message: "Body must be an array" });
    const col = await getCollection();
    const r = await col.insertMany(req.body);
    res.status(201).json(r);
  }catch(e){ next(e); }
});

router.patch("/:id", async (req,res,next)=>{
  try{
    const col = await getCollection();
    const _id = new ObjectId(req.params.id);
    const update = req.body && (req.body.$set || req.body.$inc || req.body.$unset) ? req.body : { $set: req.body };
    const r = await col.updateOne({ _id }, update);
    res.json(r);
  }catch(e){ next(e); }
});

router.patch("/", async (req,res,next)=>{
  try{
    const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
    const col = await getCollection();
    const update = req.body && (req.body.$set || req.body.$inc || req.body.$unset) ? req.body : { $set: req.body };
    const r = await col.updateMany(filter, update);
    res.json(r);
  }catch(e){ next(e); }
});

router.put("/:id", async (req,res,next)=>{
  try{
    const col = await getCollection();
    const _id = new ObjectId(req.params.id);
    const r = await col.replaceOne({ _id }, req.body, { upsert: false });
    res.json(r);
  }catch(e){ next(e); }
});

router.delete("/:id", async (req,res,next)=>{
  try{
    const col = await getCollection();
    const _id = new ObjectId(req.params.id);
    const r = await col.deleteOne({ _id });
    res.json(r);
  }catch(e){ next(e); }
});

router.delete("/", async (req,res,next)=>{
  try{
    const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
    const col = await getCollection();
    const r = await col.deleteMany(filter);
    res.json(r);
  }catch(e){ next(e); }
});

export default router;
