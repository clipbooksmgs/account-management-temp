const express = require('express');
const cors = require('cors');
const devenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');
const clinetRoutes = require('./routes/client');
const commonRoutes = require('./routes/common');

devenv.config({path: path.resolve(__dirname, '../../keys/.env')});

const app = express();

app.use(cors())
app.use(bodyParser.json());
app.use(clinetRoutes);
app.use(commonRoutes);

app.get('/',(req,resp,next)=>{
    return resp.send('Hello');
})

app.listen(3500);
