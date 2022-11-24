const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();
//Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res)=> {
    res.send("Furnishbay Server is running");
})




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.f75ntdx.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{

        const userCollection = client.db('furnishbay').collection('users');

        app.post('/users', async(req, res)=> {
            const user = req.body;
            console.log(user);
            const query = {email: user.email}
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

    }finally{

    }
}
run().catch(console.dir);







app.listen(port, (req, res)=> {
    console.log(`Furnishbay Server is running at port ${port}`);
})