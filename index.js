const express = require('express')
const cors = require('cors');
const app = express()
const port = process.env.PORT || 3000
require("dotenv").config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors())
app.use(express.json())






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

    // Assignment API --------------

    app.get('/assignments' , async(req, res) => {
      const cursor = assignmentCollection.find()
      const result = await cursor.toArray(cursor);
      res.send(result)
    })

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