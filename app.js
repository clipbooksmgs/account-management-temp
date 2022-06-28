const express = require('express');
const cors = require('cors');
const devenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');
const clinetRoutes = require('./routes/client');
const commonRoutes = require('./routes/common');
const pressclipsRoutes = require('./routes/pressclips');

devenv.config({path: path.resolve(__dirname, '../../keys/.env')});

const app = express();

app.use(cors())
app.use(bodyParser.json());
app.use(clinetRoutes);
app.use(commonRoutes);
app.use(pressclipsRoutes);

app.get('/',(req,resp,next)=>{
    return resp.send('Hello');
})

const PORT = process.env.PORT || 8080;

app.listen(PORT);
