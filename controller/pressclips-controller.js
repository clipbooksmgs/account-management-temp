const logger = require('../config/log-configuration');
const generateResponse = require('../util/generate-response');


const getInterestedPersons = (req,res,next) => {
    const clientId = req.params.clientId;
    logger.info(`getInterestedPersons::  ${clientId}`);
    return res.send(generateResponse('SUCCESS',null,[]));
    
}

module.exports = {
    getInterestedPersons
}