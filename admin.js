const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
app.use(express.json())

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://b022210082:password1234@cluster0.uhzytme.mongodb.net/?retryWrites=true&w=majority";

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
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      //await client.close();
    }
  }
  run().catch(console.dir);


app.post('/Admin/AddStudent', async (req, res) => {
    const { username, password, role, matrix, email } = req.body;

    try {
        const existingUser = await client.db("AttendanceManagementSystem").collection("User").findOne({ "username": username });

        if (existingUser) {
            return res.status(400).send('Username already exists');
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        await client.db("AttendanceManagementSystem").collection("User").insertOne({
            username: username,
            password: hashedPassword,
            role: role,
            matrix: matrix,
            email: email

        })

        res.send('Registration successful');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
app.get ('/Admin/StudentList',async(req,res)=>{
    const existingUser = await client.db("AttendanceManagementSystem").collection("User").find( 
       { role: "student" 
    }).toArray();
    res.send(existingUser);
});



app.listen(port, () => {
    console.log('Example app listening on port${port}')
})