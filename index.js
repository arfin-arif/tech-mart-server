const express = require('express');
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000
const app = express()

// middle ware
app.use(cors())
app.use(express.json())

async function run() {
    try {

    }
    finally {

    }
}
run().catch(console.log())

app.get('/', async (req, res) => {
    res.send('Tech MartServer is Running')
})
app.listen(port, () => {
    console.log(`Server running on $to{port}`)
})


