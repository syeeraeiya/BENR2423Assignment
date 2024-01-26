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

app.post('/Students/RecordAttendance', (req, res) => {
    const { student_id, date, status } = req.body;
    try {
        RecordAttendance(student_id, date, status);
        res.status(201).send("Attendance recorded successfully");
    } catch (error) {

        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

app.post('/students/viewDetails' , async (req, res) => {
    const { student_id } = req.body;

    try {
        const details = await viewDetails(student_id);
        console.log(details);
        return res.status(201).send("Successful");
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

app.post('/students/ViewReport', async (req, res) => {
    try {
        const list = await viewReport();
        console.log(list);
        return res.status(201).send("View Report Successful");
    }
    catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
})

async function viewDetails(student_id) {
    try {
        const database = client.db('AttendanceManagementSystem');
        const collection = database.collection('User');

        const user = await collection.find({student_id:student_id}).toArray();
        return user;
    }
    catch (error) {
        console.error("Error creating user:", error);
    }
}

async function RecordAttendance(student_id, date, status) {
    try {
        const database = client.db('AttendanceManagementSystem');
        const collection = database.collection('Attendances');

        const user = {
            student_id: student_id,
            date: date,
            status: status,
        };

        await collection.insertOne(user);
        console.log("User created successfully");
    }
    catch (error) {
        console.error("Error creating user:", error);
    }
}

async function viewReport(name, student_id, faculty, programme) {
    try {
        const database = client.db('AttendanceManagementSystem');
        const usersCollection = database.collection('Users');
        const facultiesCollection = database.collection('Faculties');
        const programmesCollection = database.collection('Programs');

        // Query the 'Users' collection for user information
        const userQuery = {
            name: name,
            student_id: student_id,
        };
        const user = await usersCollection.findOne(userQuery);

        if (user) {
            // Query the 'Faculties' collection for faculty information
            const facultyQuery = {
                faculty: faculty,
            };
            const facultyData = await facultiesCollection.findOne(facultyQuery);

            // Query the 'Programmes' collection for programme information
            const programmeQuery = {
                programme: programme,
            };
            const programmeData = await programmesCollection.findOne(programmeQuery);

            // Do something with the user, faculty, and programme data
            console.log("User found. User:", user, "Faculty Data:", facultyData, "Programme Data:", programmeData);
        } else {
            console.log("User not found");
        }
    } catch (error) {
        console.error("Error viewing report:", error);
    }
}


app.listen(port, () => {
    console.log('Example app listening on port ${port}');
})