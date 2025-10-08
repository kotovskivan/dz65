import Article from '../models/Article.js';

export async function list(req,res,next){
  try{
    const items = await Article.find().sort({createdAt:-1}).lean();
    res.render('articles/index.ejs', { title:'Статті', items, theme: res.locals.theme });
  }catch(e){ next(e); }
}

export async function show(req,res,next){
  try{
    const item = await Article.findById(req.params.articleId).lean();
    if(!item) return res.status(404).send('Article not found');
    res.render('articles/show.ejs', { title:item.title, item, theme: res.locals.theme });
  }catch(e){ next(e); }
}

export async function createForm(req,res){
  res.render('articles/create.pug', { title: 'Нова стаття' });
}

export async function createPost(req,res,next){
  try{
    const { title, body } = req.body;
    await Article.create({ title, body });
    res.redirect('/articles');
  }catch(e){ next(e); }
}
