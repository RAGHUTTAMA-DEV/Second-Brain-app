const express = require('express');
const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');
const router = require('./route');
require('dotenv').config();
const cors=require('cors'); // Load environment variables from a .env file

const app = express();
app.use(cors());
// Middleware
app.use(express.json());
app.use('/api', router);

async function main() {
    try {
        // Use environment variable for MongoDB connection string
        const dbUri = process.env.MONGO_URI;
        if (!dbUri) {
            throw new Error('MongoDB connection string is not defined in environment variables');
        }

        // Connect to MongoDB
        await mongoose.connect(dbUri);
        console.log('Connected to database');

        // Start the server
        const PORT = 3004; // Define the port number
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`); // Corrected log message
        });
    } catch (error) {
        console.error('Error starting the application:', error.message);
        process.exit(1); // Exit the process with failure
    }
}

main();