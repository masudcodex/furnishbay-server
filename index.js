const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();


//Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res)=> {
    res.send("Furnishbay Server is running");
})

//verifyJWT setup
const verifyJwt = (req, res, next)=>{
            
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send('Unauthorized access')
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.JWT_TOKEN, function(err, decoded){
        if (err) {
            return res.status(403).send({message: 'Access forbidden'})
        }
        req.decoded = decoded;
        next();
    })
}

//Verify Admin 

    const verifyAdmin = async(req, res, next) => {
        const email = req.decoded.email;
        const query = {email: email};
        const user = await usersCollection.findOne(query);
        if(user?.role !== 'admin'){
            res.status(403).send({message: 'Access forbidden'})
        }
        next();
    }

//Verify User

    const verifyUser = async(req, res, next) => {
        const email = req.decoded.email;
        const query = {email: email};
        const user = await usersCollection.findOne(query);
        if(user?.role !== 'user'){
            res.status(403).send({message: 'Access forbidden'})
        }
        next();
    }

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.f75ntdx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{

        const userCollection = client.db('furnishbay').collection('users');
        const categoryCollection = client.db('furnishbay').collection('categories');
        const productCollection = client.db('furnishbay').collection('products');

        //Get JWT
        app.get('/jwt', async(req, res)=>{
            const email = req.query.email;
            const query = {email: email};
            const user = await userCollection.findOne(query);
            if(user){
                const token = jwt.sign({email}, process.env.JWT_TOKEN, {expiresIn: '2d'})
                return res.send({accessToken: token})
            }
            res.status(403).send({accessToken: ''})
        })

        //Save User to database when signup
        app.post('/users', async(req, res)=> {
            const user = req.body;
            const query = {email: user.email}
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        //Get admin
        app.get('/users/admin/:email', async(req, res)=> {
            const email = req.params.email;
            const query = {email};
            const result = await userCollection.findOne(query);
            res.send({isAdmin: result?.role === 'admin'})
        })

        //Get seller
        app.get('/users/seller/:email', async(req, res)=> {
            const email = req.params.email;
            const query = {email};
            const result = await userCollection.findOne(query);
            res.send({isSeller: result?.role === 'seller'})
        })

        //Get user
        app.get('/users/user/:email', async(req, res)=> {
            const email = req.params.email;
            const query = {email};
            const result = await userCollection.findOne(query);
            res.send({isUser: result?.role === 'user'})
        })

        //Get Categories
        app.get('/categories', async(req, res)=> {
            const query = {}
            const result = await categoryCollection.find(query).toArray();
            res.send(result);
        })

        //Post Products by seller
        app.post('/products', async(req, res)=> {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result);
        })
        
        //Get Products
        app.get('/products', async(req, res)=> {
            const query = {}
            const products = await productCollection.find(query).toArray();
            res.send(products);
        })

        //Get Products by Category id
        app.get('/categories/:id', async(req, res)=> {
            const id = req.params.id;
            const query = {category_id: id}
            const result = await productCollection.find(query).toArray()
            res.send(result);
        })

    }finally{

    }
}
run().catch(console.dir);







app.listen(port, (req, res)=> {
    console.log(`Furnishbay Server is running at port ${port}`);
})