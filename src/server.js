
import express from 'express';
import bodyParser from 'body-parser';
import {MongoClient} from 'mongodb';
import path from 'path';

const app = express();

/*
const articlesInfo = {
    'learn-react':{upvotes:0,comments: []},
    'learn-node':{upvotes:0,comments: []},
    'my-thoughts-on-resumes':{upvotes:0,comments: []}
}
*/


app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'/build')));

const start = async() => {
    const client = await MongoClient.connect(
        'mongodb://localhost:27017',
        {useNewUrlParser:true, useUnifiedTopology:true}
    )
    const db = client.db('react-blog1');
    
    app.get('/api/articles/:name', async(req,res) => {
        const articleName = req.params.name; 
        const articleInfo = await db.collection('articles').findOne({name: articleName});
        res.status(200).json(articleInfo);
        //client.close(); -> No sights of this on mongodb doc
    });
    
    app.post('/api/articles/:name/upvote', async(req,res) => {
        const articleName = req.params.name;
        const articleInfo = await db.collection('articles').findOne({name: articleName});
        //console.log(articleInfo);
        //console.log(articleName);
        await db.collection('articles').updateOne(
            {name: articleName},
            //{$set: {upvotes : articleInfo.upvotes + 1}}
            {$inc: {upvotes : 1}}
        );
        articleInfo.upvotes++;
        res.status(200).json(articleInfo);
    });

    app.post('/api/articles/:name/comments', async(req,res) => {
        const articleName = req.params.name;
        const {postedBy, text} = req.body;
        //console.log(articleInfo);
        //console.log(articleName);
        await db.collection('articles').updateOne(
            {name: articleName},
            //{$set: {upvotes : articleInfo.upvotes + 1}}
            {$push: {comments : {postedBy,text}}}
        );
        const articleInfo = await db.collection('articles').findOne({name: articleName});
        res.status(200).json(articleInfo);
    });
    
    
    /*
    app.get('/hello', (req,res) => {
        res.send("hello");
        console.log("got the request!!!")
    });
    
    app.post('/hello', (req,res) => {
        const {name} = req.body;
        res.send(`hello1 ${name}`);
        console.log("got the request!!!")
    });
    
    app.post('/api/articles/:name/upvote', (req,res) => {
        const articleName = req.params.name;
        articlesInfo[articleName].upvotes++;
        res.status(200).send(`${articleName} upvoted. YEsss!! Now has ${articlesInfo[articleName].upvotes} votes`);
        console.log("got the request!!!")
    });
    
    app.post('/api/articles/:name/comments', (req,res) => {
        const articleName = req.params.name;// const {name : articleName} = req.params;
        const {postedBy,text} = req.body;
        articlesInfo[articleName].comments.push({
            postedBy,
            text
        });
        res.status(200).send(articlesInfo[articleName]);
        console.log("got the request!!!")
    });
    
    
    */

    app.get('*',(req,res) => {
        res.sendFile(path.join(__dirname,'/build/index.html'));
    })
   
    app.listen(8000 , () => console.log("server is up on 8000"));
}

start();

