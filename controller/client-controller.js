const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const ClientService = require('../services/client-service');
const logger = require('../config/log-configuration');
const generateResponse = require('../util/generate-response');
const res = require('express/lib/response');

const router = express.Router();
const clientService = new ClientService();

router.post('/login', async (req, resp, next) => {
    const creds = {
        "email": req.body.username,
        "password": req.body.password
    }

    try{
        const clientData = await clientService.getClientCollectionWithUsername(creds.email);
        bcrypt.compare(creds.password, clientData.password)
        .then((isMatch)=> {
            if(isMatch){
                const token = createToken(creds.email);
                return resp.cookie('authToken', token, { httpOnly: true })
                    .status(200)
                    .send(generateResponse("SUCCESS",null,{
                        "userData":{
                            "email": creds.email
                        }
                    }));
            }
            logger.info(`Authentication failed for ${creds.eamil}`)
            return resp.status(401)
                        .send(generateResponse("FAILURE","INVALID CREDENTIALS",null)); 

        }).catch(err => {
            logger.error(err.stack);
            return resp.status(500)
                        .send(generateResponse("FAILURE","INTERNAL_SERVER_ERROR",null))
        })
    }catch(err){
        logger.error(err.stack);
        return resp.status(err.httpStatusCode)
                    .send(generateResponse("FAILURE",err.message,null));
    }
});


router.post('/signup',async (req,resp,next)=>{
    const client = req.body;
    client.password = await bcrypt.hash(client.password,12);
    clientService.save(client).then(
        ()=> { 
            return resp.status(201)
            .send(generateResponse("SUCCESS",null,null))
        },
        (err)=> {
            console.log(err);
        }
    ).catch(err => {
        logger.error(err.stack);
        resp.status(err.httpStatusCode)
        .send(generateResponse("FAILURE",err.message,null));
    })
    
    // .then(()=> {
    //     res.status(201)
    //     .send(generateResponse("SUCCESS",null,null))
    // })
    // .catch(err => {
    //     console.log(err);
    //     logger.error(err.stack);
    //     resp.status(err.httpStatusCode)
    //     .send(generateResponse("FAILURE",err.message,null));
    // });
})


function createToken(email) {
    const payload = { "email": email};
    return jwt.sign(payload, process.env.SECRET, { expiresIn: 60*60 }); 
}


module.exports = router;