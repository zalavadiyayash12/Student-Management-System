require('dotenv').config();

const dns = require('dns');
// Force Google's DNS for lookups — fixes "querySrv ECONNREFUSED" errors that
// happen when your ISP/router/Windows DNS blocks the SRV record lookup that
// mongodb+srv:// connection strings rely on.
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');

app.use('/', authRoutes);
app.use('/', studentRoutes);

// Home Route
app.get('/', (req, res) => {
    res.send("Student Management Backend Running");
});
app.get('/profile', authMiddleware, (req, res) => {
    res.send("Welcome to profile page");
});

// ---------------------------------------------------------
// MongoDB Connect — Atlas connection string comes from .env
// so your username/password never get hard-coded or pushed
// to GitHub by mistake.
// ---------------------------------------------------------
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.log("❌ MONGO_URI not found. Create a .env file (see .env.example) with your Atlas connection string.");
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Atlas Connected"))
    .catch((err) => {
        console.log("❌ MongoDB connection failed:");
        console.log(err.message);
        console.log("\nCheck these common causes:");
        console.log("1. Network Access in Atlas → is your IP (or 0.0.0.0/0) whitelisted?");
        console.log("2. Database Access in Atlas → does the user/password match your .env?");
        console.log("3. Is your password URL-encoded if it has special characters (@ # % etc)?");
        console.log("4. Did you replace <username>, <password> and the db name in the connection string?");
    });

// Server Start
app.listen(5000, () => {
    console.log("Server running on port 5000");
});