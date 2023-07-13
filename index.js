const express = require('express');
const bodyParser = require("body-parser");
const mongosse = require('mongoose');
const cors = require('cors');
const callRoutes = require('./routes/Calls');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 9000;
let server;

//middleware config
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json({limit: '20mb'}));
app.use('/api/calls/', callRoutes);

mongosse.connect(process.env.DB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => console.log('Database connection established'))
.catch(er => console.log(er));


server = app.listen(PORT, () => {
    console.log('server running', + PORT);
})