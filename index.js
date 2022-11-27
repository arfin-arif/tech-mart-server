const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRETKEY)

const port = process.env.PORT || 5000
const app = express()

// middle ware
app.use(cors())
app.use(express.json())

// mongodb

const uri = `mongodb+srv://${process.env.DAB_USER}:${process.env.DB_PASSWORD}@cluster0.qktvmdh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send('Unauthorized');
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const categoriesCollection = client.db('techMart').collection('allCategories');
        const productsCollection = client.db('techMart').collection('allProducts');
        const userCollection = client.db('techMart').collection('users');
        const bookingCollection = client.db('techMart').collection('bookings');
        const advertisedCollection = client.db('techMart').collection('advertise');
        const reportsCollection = client.db('techMart').collection('reports');
        const paymentCollections = client.db('techMart').collection('payments');


        const verifyAdmin = async (req, res, next) => {
            console.log('verify admin', req.decoded.email);
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await userCollection.findOne(query)
            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'Forbidden' })
            }
            next()
        }
        // to get particular user products

        // to get all the category
        app.get('/categories', async (req, res) => {
            const query = {};
            const result = await categoriesCollection.find(query).toArray()
            res.send(result)
        });


        // to get particular category all data
        app.get('/category', async (req, res) => {
            let query = {}
            // console.log(req.query.category_id);
            if (req.query.category_id) {
                query = {
                    category_id: req.query.category_id
                }
            }
            const cursor = productsCollection.find(query)
            const results = await cursor.toArray();
            res.send(results)
        })

        // to insert new products
        app.post('/allproducts', async (req, res) => {
            const doctor = req.body;
            const result = await productsCollection.insertOne(doctor);
            res.send(result)
        })
        // to get all thw products 
        app.get('/allproducts', async (req, res) => {
            const query = {};
            const result = await productsCollection.find(query).toArray();
            res.send(result)

        })
        // to change status 
        app.put('/products/report/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    status: 'reported'
                }
            }
            const result = await productsCollection.updateOne(filter, updatedDoc, options);
            res.send(result)
        });
        // to change promoted status 
        app.put('/products/promote/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    promotion: 'promoted'
                }
            }
            const result = await productsCollection.updateOne(filter, updatedDoc, options);
            res.send(result)
        });


        // get the dat of change statused
        app.get('/promotedProducts', async (req, res) => {
            let query = {};
            if (req.query.promotion) {
                query = {
                    promotion: req.query.promotion
                }
            }
            const cursor = productsCollection.find(query)
            const products = await cursor.toArray();
            res.send(products)
        })
        // get the dat of change statused
        app.get('/reportedItems', async (req, res) => {
            let query = {};
            if (req.query.status) {
                query = {
                    status: req.query.status
                }
            }
            const cursor = productsCollection.find(query)
            const product = await cursor.toArray();
            res.send(product)
        })





        // JWT
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '24h' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        })



        // to get particular user products

        app.get('/products', async (req, res) => {
            let query = {};
            if (req.query.sellerEmail) {
                query = {
                    sellerEmail: req.query.sellerEmail
                }
            }
            const cursor = productsCollection.find(query)
            const products = await cursor.toArray();
            res.send(products)
        })

        // to delete any product
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(filter);
            res.send(result)
        })


        // to store user info who signup
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result)
        })





        // to get all the users 
        app.get('/allusers', async (req, res) => {
            const query = {};
            const result = await userCollection.find(query).toArray();
            res.send(result)
        });

        // to change seller status
        app.put('/seller/verify/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    status: 'verified'
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc, options);
            res.send(result)
        });

        // to get all sellers from all the  user acording to their tole
        app.get('/allsellers', async (req, res) => {
            let query = {};
            if (req.query.role) {
                query = {
                    role: req.query.role
                }
            }
            const cursor = userCollection.find(query)
            const users = await cursor.toArray();
            res.send(users)
        })

        // to check admin 
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            console.log(email)
            const user = await userCollection.findOne(query)
            res.send({ isAdmin: user?.role === 'admin' });
        })
        // to check seller 
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            console.log(email)
            const user = await userCollection.findOne(query)
            res.send({ isSeller: user?.role === 'Seller' });
        })
        // to check buyer 
        app.get('/users/buyers/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            console.log(email)
            const user = await userCollection.findOne(query)
            res.send({ isUser: user?.role === 'User' });
        })

        // to delete any user
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await userCollection.deleteOne(filter);
            res.send(result)
        })

        // post the bookings
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            // console.log(booking);
            const result = await bookingCollection.insertOne(booking);
            res.send(result)
        })
        // get payment data
        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const bookings = await bookingCollection.findOne(query)
            res.send(bookings)
        })


        // get particular booking 
        app.get('/booking', async (req, res) => {
            const email = req.query.email;
            // console.log(email);
            const query = { buyerEmail: email }
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings);
        })
        // get the bookings
        app.get('/bookings', async (req, res) => {
            let query = {}
            const result = await bookingCollection.find(query).toArray();
            res.send(result)
        })



        // set up stripe
        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const price = booking.price;
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ]
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });


        // to store transaction 
        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentCollections.insertOne(payment);
            const id = payment.bookingId;
            const query = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedResult = await bookingCollection.updateOne(query, updatedDoc)
            res.send(result)
        })
        // post the advertised product
        app.post('/advertised', async (req, res) => {
            const advertised = req.body;
            // console.log(booking);
            const result = await advertisedCollection.insertOne(advertised);
            res.send(result)
        })

        // get the promoted product
        app.get('/advertised', async (req, res) => {
            let query = {}
            const result = await advertisedCollection.find(query).toArray();
            res.send(result)
        })

        // post reported item 
        app.post('/report', async (req, res) => {
            const report = req.body;
            // console.log(report);
            const result = await reportsCollection.insertOne(report);
            res.send(result)
        })

        // get the promoted product
        app.get('/report', async (req, res) => {
            let query = {}
            const result = await reportsCollection.find(query).toArray();
            res.send(result)
        })

        // to delete reported products
        app.delete('/report/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await userCollection.deleteOne(filter);
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


