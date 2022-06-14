const express = require('express');
const devenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');
const clientRoutes = require('./controller/client-controller');

devenv.config({path: path.resolve(__dirname, '../../keys/.env')});

const app = express();

app.use(bodyParser.json());

app.get('/',(req,resp,next)=>{
    resp.send('Hello');
})

app.use(clientRoutes);

app.listen(3500);
