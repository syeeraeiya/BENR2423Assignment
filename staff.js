const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri =
  'mongodb+srv://b022210082:password1234@cluster0.uhzytme.mongodb.net/?retryWrites=true&w=majority';

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

run().catch(console.dir);

// Retrieve student details

app.post('/staff/viewDetails', async (req, res) => {
  const { staff_id } = req.body;

  try {
    const details = await viewDetails(staff_id);
    console.log(details);
    return res.status(201).send("Successful");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

async function viewDetails(staff_id) {
  try {
    const database = client.db('AttendanceManagementSystem');
    const collection = database.collection('User');

    const user = await collection.find({ staff_id: staff_id }).toArray();
    return user;
  }
  catch (error) {
    console.error("Error creating user:", error);
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});