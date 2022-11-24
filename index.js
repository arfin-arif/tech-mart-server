const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 5000
const app = express()

// middle ware
app.use(cors())
app.use(express.json())

// mongodb

const uri = `mongodb+srv://${process.env.DAB_USER}:${process.env.DB_PASSWORD}@cluster0.qktvmdh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
        const categoriesCollection = client.db('techMart').collection('allCategories');
        const productsCollection = client.db('techMart').collection('allProducts');
        const userCollection = client.db('techMart').collection('users');

        app.get('/categories', async (req, res) => {
            const query = {};
            const result = await categoriesCollection.find(query).toArray()
            res.send(result)
        });

        // to get particular category all data
        app.get('/category', async (req, res) => {
            let query = {}
            console.log(req.query.category_id);
            if (req.query.category_id) {
                query = {
                    category_id: req.query.category_id
                }
            }
            const cursor = productsCollection.find(query)
            const results = await cursor.toArray();
            res.send(results)
        })
        // to get all thw products 
        app.get('/allproducts', async (req, res) => {
            const query = {};
            const result = await productsCollection.find(query).toArray();
            res.send(result)

        })

        // to store user info who signup
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result)
        })


    }
    finally {

    }
}
run().catch(console.log())

app.get('/', async (req, res) => {
    res.send('Tech MartServer is Running')
})
app.listen(port, () => {
    console.log(`Server running on ${port}`)
})


