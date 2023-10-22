const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const app = express();
app.use(express.json());
const port = 3000;
const config = require('./config/env'); // Import the environment variable configuration

// ...

// Access the secret key
const secretKey = config.JWT_SECRET;
app.use('/auth', authRoutes);
// Connection URL to your MongoDB server
const mongoURI = 'mongodb://0.0.0.0:27017/mongoapp';

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
        console.log(config.JWT_SECRET,'token');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB: ' + err);
    });


// Define routes and middleware here

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});




