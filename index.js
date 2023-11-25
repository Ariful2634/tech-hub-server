const express = require('express');
const cors = require('cors');
const app  = express();
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware

app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.stv3jdc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const featureProductCollection = client.db("hubDB").collection("feature")
    const reviewCollection = client.db("hubDB").collection("reviews")
    const trendingProductCollection = client.db("hubDB").collection("trending")
    const addProductCollection = client.db("hubDB").collection("addProduct")

    // feature product get

    app.get('/featureProduct', async(req,res)=>{
        // const filter = req.query;
        // console.log(filter)
        // const query = {
        //     // price: {$lt:100}
        //     // title: {$regex: filter.search, $options:'i'}
        // }
        // const options = {
        //     sort:{
        //         timestamp: filter.sort === 'asc' ? 1 : -1,
        //     }
        // }
        const cursor = featureProductCollection.find()
        const result = await cursor.toArray()
        res.send(result)
    })

    // post review

    app.post('/reviews', async(req,res)=>{
        const review = req.body;
        const result = await reviewCollection.insertOne(review)
        res.send(result)
    })

    // get review

    app.get('/reviews', async(req,res)=>{
        const cursor = reviewCollection.find()
        const result = await cursor.toArray()
        res.send(result)
    })
    // get trending product

    app.get('/trendingProduct', async(req,res)=>{
        const cursor = trendingProductCollection.find()
        const result = await cursor.toArray()
        res.send(result)
    })


    // user related api

    app.post('/addProduct', async(req,res)=>{
        const newProduct = req.body;
        const result = await addProductCollection.insertOne(newProduct)
        res.send(result)
    })






    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res)=>{
    res.send('Tech Hub Is Running...')
})

app.listen(port,()=>{
    console.log(`Tech Hub server is running on port ${port}`)
})