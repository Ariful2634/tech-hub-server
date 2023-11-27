const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware

app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const reportCollection = client.db("hubDB").collection("report")
        const usersCollection = client.db("hubDB").collection("users")


        // register user

        app.post('/users', async (req, res) => {
            const user = req.body;

            // insert email if user dosen't exists

            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query)
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }

            const result = await usersCollection.insertOne(user)
            res.send(result)
        })


        app.get('/users',  async (req, res) => {

            const result = await usersCollection.find().toArray()
            res.send(result)
        })

        app.patch('/users/admin/:id',  async(req,res)=>{
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)}
            const updateDoc={
              $set:{
                role:'admin'
              }
            }
            const result = await usersCollection.updateOne(filter,updateDoc)
            res.send(result)
          })

          app.get('/users/admin/:email',  async(req,res)=>{
            const email = req.params.email;
            // if(email !== req.decoded.email){
            //   return res.status(403).send({message:'forbidden access'})
            // }
      
            const query = {email:email}
            const user = await usersCollection.findOne(query)
            let admin = false;
            if(user){
              admin = user?.role==='admin'
            }
            res.send({admin})
          })


        //   upvote
        app.put('/addProduct/upvote/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateStatus = req.body;
            const upvote = {
                $set: {

                    upvoted: updateStatus.upvote,


                }
            }
            const result = await addProductCollection.updateOne(filter, upvote, options)
            res.send(result)
        })


        // status related

        app.put('/addProduct/status/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateStatus = req.body;
            const status = {
                $set: {

                    status: updateStatus.status,


                }
            }
            const result = await addProductCollection.updateOne(filter, status, options)
            res.send(result)
        })
        app.put('/addProduct/mark/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateStatus = req.body;
            const mark = {
                $set: {

                    mark: updateStatus.mark,


                }
            }
            const result = await addProductCollection.updateOne(filter, mark, options)
            res.send(result)
        })


        // post report

        app.post('/report', async (req, res) => {
            const reportedProduct = req.body;
            const result = await reportCollection.insertOne(reportedProduct)
            res.send(result)
        })



        // post feature product

        app.post('/featureProduct', async (req, res) => {
            const featuredProduct = req.body;
            const result = await featureProductCollection.insertOne(featuredProduct)
            res.send(result)
        })


        // feature product get

        app.get('/featureProduct', async (req, res) => {
            const filter = req.query;
            console.log(filter)
            const query = {
                // price: {$lt:100}
                // title: {$regex: filter.search, $options:'i'}
            }
            const options = {
                sort: {
                    timestamp: filter.sort === 'asc' ? 1 : -1,
                }
            }
            const cursor = featureProductCollection.find(query, options)
            const result = await cursor.toArray()
            res.send(result)
        })

        // post review

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review)
            res.send(result)
        })

        // get review

        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })
        // get trending product

        app.get('/trendingProduct', async (req, res) => {
            const cursor = trendingProductCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })


        // user related api

        app.post('/addProduct', async (req, res) => {
            const newProduct = req.body;
            const result = await addProductCollection.insertOne(newProduct)
            res.send(result)
        })

        app.get('/addProduct', async (req, res) => {
            let filterQuery = {};
            if (req.query?.email) {
                filterQuery = { email: req.query.email };
            }

            let searchQuery = {};
            if (req.query.search && typeof req.query.search === 'string') {
                searchQuery = {
                    tags: { $in: [new RegExp(req.query.search, 'i')] }
                };
            }
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 20;
            const skip = (page - 1) * pageSize;
            const cursor = addProductCollection.find({ ...filterQuery, ...searchQuery })
                .skip(skip)
                .limit(pageSize);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/addProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await addProductCollection.findOne(query);
            res.send(result)
        })

        app.put('/update/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateTech = req.body;
            const tech = {
                $set: {
                    product_name: updateTech.product_name,
                    product_image: updateTech.product_image,
                    description: updateTech.description,
                    links: updateTech.links,

                }
            }
            const result = await addProductCollection.updateOne(filter, tech, options)
            res.send(result)
        })

        app.delete('/addProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await addProductCollection.deleteOne(query)
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


app.get('/', (req, res) => {
    res.send('Tech Hub Is Running...')
})

app.listen(port, () => {
    console.log(`Tech Hub server is running on port ${port}`)
})