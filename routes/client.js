const express = require('express');
const { login, 
        signup, 
        getClient, 
        updateClient} = require('../controller/client-controller');


const router = express.Router();

router.post('/login', login);
router.post('/signup',signup);
router.get('/client', getClient);
router.put('/client', updateClient);


module.exports = router;