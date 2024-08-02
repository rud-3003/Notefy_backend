const connectToMongo = require('./db');
const express = require("express")
const bodyParser = require('body-parser');
require('dotenv').config();

var cors = require("cors")

connectToMongo();
const app = express()
const port = process.env.PORT;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors())
app.use(express.json())

//Available Routes
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/notes', require('./routes/notes.js'));

app.listen(port, () => {
    console.log(`Notefy App listening at http://localhost:${port}`);
})
