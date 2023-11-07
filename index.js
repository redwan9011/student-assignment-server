const express = require('express')
const cors = require('cors');
const app = express()
const port = process.env.PORT || 3000
require("dotenv").config()
var jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors( {
  origin: [
    'http://localhost:5173'
  ],
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dpklxw3.mongodb.net/?retryWrites=true&w=majority`;

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

    const database = client.db("assignmentDB");
    const assignmentCollection = database.collection("assignments");

    const submitCollection = client.db("assignmentDB").collection("submittedAssignment")
    const submitMarkCollection = client.db("assignmentDB").collection("submitMark")
    // ---------Auth API

    app.post('/jwt' , async(req, res) => {
      const user= req.body;
      console.log('user token', user);

      const token = jwt.sign(user, process.env.DB_SECRET_TOKEN , { expiresIn: '2h'})
      res
      .cookie('token', token , {
        httpOnly: true,
        secure: false,

      })
      .send({success:true})
    })

    app.post('/logout' , async(req, res) => {
      const user= req.body;

    res.clearCookie('token', {maxAge: 0}).send({success:true})
    })

    // Assignment API --------------
// all data
    app.get('/assignments' , async(req, res) => {
      const cursor = assignmentCollection.find()
      const result = await cursor.toArray(cursor);
      res.send(result)
    })
    // single data for view details and update
    app.get('/assignments/:id' ,async (req, res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result =await assignmentCollection.findOne(query);
      res.send(result)
    })


  app.post('/assignments' , async(req, res) => {
    const assignment = req.body;
    const result = await assignmentCollection.insertOne(assignment)
    res.send(result)
  })

  app.delete('/assignments/:id' , async(req, res) => {
    const id = req.params.id;
    const query = {_id : new ObjectId(id)}
    const result = await assignmentCollection.deleteOne(query);
    res.send(result)
  })

  app.put('/assignments/:id', async(req, res) => {
    const id =req.params.id;
    const filter = {_id: new ObjectId(id)};
    const option = {upsert: true};
    const assignment = req.body;
    const updateassignment = {
      $set: {
        
        tittle: assignment.tittle,
        image: assignment.image,
        marks: assignment.marks,
        difficulty: assignment.difficulty,
        date: assignment.date,
        description: assignment.description,
        
      }
    }
    const result = await assignmentCollection.updateOne(filter, updateassignment, option);
    res.send(result)
  })

    // -------Assignment  Submit APi --------------//

    app.post('/submit' , async(req, res) => {
      const submit = req.body;
      const result = await submitCollection.insertOne(submit)
      res.send(result)
    })

    app.get('/submit' , async(req, res) => {
      const result =await submitCollection.find().toArray()
      res.send(result)
    })

    // -------Submit mark api--------//
    app.post('/submitmark', async(req, res)=> {
      const submitMark = req.body;
      const result = await submitMarkCollection.insertOne(submitMark);
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
  res.send('Student assignment')
})

app.listen(port, () => {
  console.log(`student assignment site running on ${port}`)
})