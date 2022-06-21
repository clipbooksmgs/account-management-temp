const collections = require('../util/collection-constants')
const getFirestoreDB = require("../config/firestore-db");
const logger = require('../config/log-configuration');
const DocumentCreationException = require('../exceptions/document-creation-exception');
const ClientUsernameService = require('./clinent-username-service');
const AccountAlreadyExistsException = require('../exceptions/account-alreay-exists-exception');
const { createCustomer } = require('./StripeServices');
const { cli } = require('winston/lib/winston/config');


class ClientService{
    
    constructor(){
        const db = getFirestoreDB();
        logger.info('Connected to db');
        this.clientUsernameService = new ClientUsernameService();
        this.clientCollection = db.collection(collections.CLIENT_COLLECTION);
    }

   async save(client){
        logger.info("save:: "+ JSON.stringify(client));
        const email = client.email;
        const isExists = await this.isAccountExists(email);
        if(!isExists){
            const customer = await createCustomer(client)
            client.stripeCustomerId = customer.customerId;
            logger.info('stripe customer is created'+ client.stripeCustomerId);
            await this.clientUsernameService.save(email);
            let id;
            try{
                const docRef = await this.clientCollection.add(JSON.parse(JSON.stringify(client)));
                logger.info("client collection added, Key:: "+ docRef.id);      
                id = docRef.id;
            }catch(err){
                logger.error(err.stack);
                throw new DocumentCreationException('Client','document not created'); 
            }
        
            await this.clientUsernameService.update(email,id);
            logger.info("Idd::::: "+ id);
            return {
                "stripeCustomerId": client.stripeCustomerId,
                "clientId": id
            }

        }else{
            logger.error("Account already existed with email:: "+email);
            throw new AccountAlreadyExistsException(`An account already exits with ${email}`);
        }
        
    }


    async update(client, clientCollectionKey) {

        logger.info("update:: "+ clientCollectionKey);
        
        const email = client.email; 
        
        if(await this.isUsernameUpdating(email,clientCollectionKey)){
            logger.info("username is updating");
            if(await this.isEmailExistsForOtherClient(email,clientCollectionKey)){
                throw new Error(`${email} is already exist for another user`);
            }
            const email = await this.clientUsernameService.getClientEmail(clientCollectionKey);
            await this.clientUsernameService.delete(email);
            await this.clientUsernameService.update(email,clientCollectionKey);
            logger.info("username is updated to:: "+ email);
        }

       await this.clientCollection.doc(clientCollectionKey).update(JSON.parse(JSON.stringify(client)));
       logger.info("client details are updated");
       return clientCollectionKey;
    }


    

    async isUsernameUpdating(email,clientCollectionKey){
        const clientDetails = await this.getClientCollection(clientCollectionKey);
        if(clientDetails.email !== email){
            return true;
        }
        return false;
    }


    async getClientCollectionWithUsername(email){
        const clientUsernameCollection = await this.clientUsernameService.get(email);
       return await this.getClientCollection(clientUsernameCollection.clientCollectionKey);
    }

    async getClientCollection(clientCollectionKey){
        const clientDoc = await this.clientCollection.doc(clientCollectionKey).get()
        if(!clientDoc.exists){
            throw new AccountNotFoundException(`No account exsits ${clientCollectionKey}`);
        }    
        return clientDoc.data(); 
    }

    async isAccountExists(email){
        return await this.clientUsernameService.get(email).then(
            (data)=> {
                logger.info('then isAccountExists')
                return true;
            },
            (err)=> {
                logger.error(err);
                return false;
            }
        )
    }


    async isEmailExistsForOtherClient(email, clientCollectionKey){
        return await this.getAccountWithUsernameAndCollectionKey(email,clientCollectionKey).then(
            (data)=> {
                return true;
            },
            (err)=> {
                return false;
            }
        )
    }

    async getAccountWithUsernameAndCollectionKey(email, clientCollectionKey){
        const usernameCollection = await this.clientUsernameService.get(email);
             if(usernameCollection.clientCollectionKey !== clientCollectionKey){
            return true;
        }else{
            return false;
        }
    }


    async delete(email){
        const usernameCollection = await this.clientUsernameService.get(email);
        await this.clientCollection.doc(usernameCollection.clientCollectionKey).delete();
        await this.clientUsernameCollection.doc(email).delete();
    }
}

module.exports = ClientService;