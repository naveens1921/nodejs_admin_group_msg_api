require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { router } = require('./routes/auth');
const userManage = require('./routes/user');
const groupManage = require('./routes/group');
const messageManage = require('./routes/message');
const app = express();
app.use(express.json());
const port = process.env.PORT;

app.use('/auth', router);
app.use('/users', userManage);
app.use('/group', groupManage);
app.use('/message', messageManage);

const mongoURI = 'mongodb://0.0.0.0:27017/mongoapp';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
       
    })
    .catch(err => {
        console.error('Error connecting to MongoDB: ' + err);
    });


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;



