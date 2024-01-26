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

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await client.db("AttendanceManagementSystem").collection("User").findOne({ "username": username });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).send('Invalid username or password');
    }

    if (user) {
      const apaapaboleh = await generateToken(user);

      res.send('Login successfully \n' + apaapaboleh);
    }

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/Admin/createStudent', verifyToken, async (req, res) => {
  const { username, password, role, student_id, email } = req.body;

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
      student_id: student_id,
      email: email
    })

    res.send('Registration successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/Admin/createStaff', verifyToken, async (req, res) => {
  const { username, password, role, email, staff_id } = req.body;

  try {
    const createdUser = await createStaff(username, password, role, email, staff_id);
    console.log(createdUser);
    return res.status(201).send("Staff created successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post('/Staff/Students/RecordAttendance',verifyToken1, (req, res) => {
  const { student_id, date, status, time } = req.body;
  try {
    RecordAttendance(student_id, date, status, time);
    res.status(201).send("Attendance recorded successfully");
  } catch (error) {

    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post('/students/viewDetailss', async (req, res) => {
  const { student_id } = req.body;

  try {
    const details = await viewDetailss(student_id);
    console.log(details);
    return res.status(201).json(details);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post('/Admin/staff/viewDetails', verifyToken, async (req, res) => {
  const { staff_id } = req.body;

  try {
    const details = await viewDetails(staff_id);
    console.log(details);
    return res.status(201).json(details);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post('/Admin/createFaculty', verifyToken, async (req, res) => {
  const { name, code, programs, students } = req.body;
  try {

    await client.db("AttendanceManagementSystem").collection("Faculties").insertOne({
      name: name,
      code: code,
      programs: programs,
      students: students,

    })

    res.send('Faculty created successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/Admin/createPrograms', verifyToken, async (req, res) => {
  const { name, code, faculty, subject, students } = req.body;
  try {

    await client.db("AttendanceManagementSystem").collection("Programs").insertOne({
      name: name,
      code: code,
      faculty: faculty,
      subject: subject,
      students: students,

    })

    res.send('Program created successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/Admin/create-subject', verifyToken, async (req, res) => {
  const { name, code, faculty, program, credit } = req.body;

  try {
    const result = await createSubject(name, code, faculty, program, credit);
    console.log(result);
    return res.status(201).send("Subject created successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post('/Admin/viewStudentList', verifyToken, async (req, res) => {
  try {
    const list = await viewStudentList();
    console.log(list);
    return res.status(201).json(list);
  }
  catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

async function createStaff(username, password, role, email, staff_id) {
  try {
    const database = client.db('AttendanceManagementSystem');
    const collection = database.collection('User');

    // Check if the staff member already exists
    const existingStaff = await collection.findOne({ username: username });

    if (!existingStaff) {
      // Hash the password before storing it
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new staff member
      const user = {
        username: username,
        password: hashedPassword,
        role: role,
        email: email,
        staff_id: staff_id,
      };

      // Insert the new staff member into the 'User' collection
      await collection.insertOne(user);
      console.log("User created successfully");

      // Return the created user data without the password
      delete user.password;
      return user;
    } else {
      console.log("Staff member with the same username already exists");
      throw new Error("Staff member with the same username already exists");
    }
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}


async function viewDetailss(student_id) {
  try {
    const database = client.db('AttendanceManagementSystem');
    const collection = database.collection('User');

    const user = await collection.find({ student_id: student_id }).toArray();
    return user;
  }
  catch (error) {
    console.error("Error creating user:", error);
  }
}

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

async function RecordAttendance(student_id, date, status, time) {
  try {
    const database = client.db('AttendanceManagementSystem');
    const collection = database.collection('Attendances');

    const user = {
      student_id: student_id,
      date: date,
      status: status,
      time: time
    };

    await collection.insertOne(user);
    console.log("User created successfully");
  }
  catch (error) {
    console.error("Error creating user:", error);
  }
}


async function createSubject(name, code, faculty, programme, credit) {
  try {
    const database = client.db('AttendanceManagementSystem');
    const collection = database.collection('Subject');

    // Create a user object
    const subject = {
      name: name,
      code: code,
      faculty: faculty,
      program: programme,
      credit: credit
    };
    // Insert the user object into the collection
    await collection.insertOne(subject);

    console.log("Subject created successfully");
  } catch (error) {
    console.error("Error creating subject:", error);
  }
}

async function viewStudentList() {
  try {
    const database = client.db('AttendanceManagementSystem');
    const collection = database.collection('User');

    // Find the user by username
    const user = await collection.find({ role: { $eq: "student" } }).toArray();

    return user;
  } catch (error) {
    console.error('Error finding user by username:', error);
    throw error;
  }
}


async function verifyToken(req, res, next) {
  let header = req.headers.authorization;
  if (!header) {
    return res.status(401).send('Unauthorized');
  }

  let token = header.split(' ')[1];

  jwt.verify(token, 'your-secret-key', function (err, decoded) {
    if (err) {
      return res.status(401).send('Unauthorized');
    }
    else {
      console.log(decoded);
      if (decoded.role != 'Admin') {
        return res.status(401).send('Again Unauthorized');
      }
    }
    next();
  });
}


async function verifyToken1(req, res, next) {
  let header = req.headers.authorization;
  if (!header) {
    return res.status(401).send('Unauthorized');
  }

  let token = header.split(' ')[1];

  jwt.verify(token, 'your-secret-key', function (err, decoded) {
    if (err) {
      return res.status(401).send('Unauthorized');
    }
    else {
      console.log(decoded);
      if (decoded.role != 'staff') {
        return res.status(401).send('Again Unauthorized');
      }
    }
    next();
  });
}

async function generateToken(user) {
  const token = jwt.sign({
    username: user.username,
    role: user.role,
  },
    'your-secret-key',
    { expiresIn: '365d' });
  return token;
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
