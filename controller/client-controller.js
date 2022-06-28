const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const ClientService = require('../services/client-service');
const logger = require('../config/log-configuration');
const generateResponse = require('../util/generate-response');
const { createSubscription } = require('../services/StripeServices');
const { removePassword } = require('../util/client-util');



const clientService = new ClientService();

const login =  async (req, resp, next) => {
    const creds = {
        "email": req.body.email,
        "password": req.body.password
    }

    try{
        const clientData = await clientService.getClient(creds.email);
        bcrypt.compare(creds.password, clientData.password)
        .then((isMatch)=> {
            if(isMatch){
                const token = createToken(creds.email);
                return resp.cookie('authToken', token, { httpOnly: true })
                    .status(200)
                    .send(generateResponse("SUCCESS",null,removePassword(clientData)));
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
    console.log('This is signup');
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

const getClient = (req,resp,next) =>{
    logger.info('getClient:: ');
    const email = req.query.email;
    logger.info("Query params:: "+ email);
    clientService.getClient(email)
    .then(client => {
        return resp.status(200).send(
            generateResponse('SUCCESS',null,client)
        )
    }).catch(err => {
        logger.error(err.stack);
        return resp.status(err.httpStatusCode)
        .send(generateResponse("FAILURE",err.message,null));
    })
}


const updateClient = (req,resp,next) => {
    const client = req.body;
    logger.info("updateClient:: "+ JSON.stringify(client));
    clientService.update(client)
    .then(() => {
            return resp.status(200)
            .send(generateResponse('SUCCESS',null,{email:client.email}))
        }
    ).catch(err => {
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
    login,signup,getClient, updateClient
}