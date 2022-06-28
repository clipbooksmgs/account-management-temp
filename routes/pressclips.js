const express = require('express');
const { getInterestedPersons } = require('../controller/pressclips-controller');


const router = express.Router();


router.get('/client/:clientId/interestedpersons', getInterestedPersons);


module.exports = router;