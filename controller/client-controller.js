const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const ClientService = require('../services/client-service');
const logger = require('../config/log-configuration');
const generateResponse = require('../util/generate-response');
const res = require('express/lib/response');
const { createSubscription } = require('../services/StripeServices');


const clientService = new ClientService();

const login =  async (req, resp, next) => {
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
};


const signup = async (req,resp,next)=>{
    logger.info('singup::'+ JSON.stringify(req.body));
    const client = req.body;
    client.password = await bcrypt.hash(client.password,12);
    clientService.save(client)
    .then((customer)=> { 
            logger.info('account created succesfully');
            const details  = {
                customerId: customer.stripeCustomerId,
                priceId: client.subscription.priceId
            }
            console.log(details);
            createSubscription(details).then(subscriptionDetails => {
                return resp.status(201)
                .send(generateResponse("SUCCESS",null,{
                    customerId: customer.customerId,
                    subscriptionId: subscriptionDetails.subscriptionId,
                    clientSecret: subscriptionDetails.clientSecret
                }))
            }).catch(err => {
                return resp.status(500)
                .send(generateResponse("FAILURE",err.message,null))
            })
            
        },
        (err)=> {
            logger.error(err.stack);
            return resp.status(err.httpStatusCode)
            .send(generateResponse("FAILURE",err.message,null))
        }
    )
    .catch(err => {
        logger.error(err.stack);
        return resp.status(err.httpStatusCode)
        .send(generateResponse("FAILURE",err.message,null));
    })
}


function createToken(email) {
    const payload = { "email": email};
    return jwt.sign(payload, process.env.SECRET, { expiresIn: 60*60 }); 
}


module.exports = {
    login,signup
}