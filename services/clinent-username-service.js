const collections = require('../util/collection-constants')
const getFirestoreDB = require("../config/firestore-db");
const logger = require('../config/log-configuration');
const DocumentCreationException = require('../exceptions/document-creation-exception');
const AccountNotFoundException = require('../exceptions/account-not-found-exception');
const BaseException = require('../exceptions/base-exception');


class ClientUsernameService{
    constructor(){
        const db = getFirestoreDB();
        logger.info('Connected to db');
        this.clientUsernameCollection = db.collection(collections.CLIENT_USERNAME_COLLECTION);
    }

    async save(email){
        try{
            this.clientUsernameCollection.doc(email).set({
                'email': email
            });
            logger.info("Client Username Collection added");
        }catch(err){
            logger.error(err.stack);
            throw new DocumentCreationException('ClientUsername','document not created');  
        }
    }


    async update(email, id){
        try{
            await this.clientUsernameCollection.doc(email).update({
                'email':email,
                'clientCollectionKey': id
            });
            logger.info("client username collection updated with key:: "+id);
        }catch(err){
            logger.error(err.stack);
            throw new DocumentCreationException('ClientUsername','document not updated'); 
        }
    }


    async get(email){
        const document = await this.clientUsernameCollection.doc(email).get();
        if(!document.exists){
            throw new AccountNotFoundException(`No account exsits ${email}`);
        }
        return document.data(); 
    }

    async getClientEmail(clientCollectionKey){
        logger.info(`getClient Email:: ${clientCollectionKey}`);
        try{
            const querySnapshot = await this.clientUsernameCollection.where('clientCollectionKey', '==', clientCollectionKey).get();
            if(querySnapshot.empty){
                throw new AccountNotFoundException('collectionKey not existed');
            }
            const docs = await querySnapshot.docs;
            return docs[0].data().email;
        }catch(err){
            logger.error(err.stack);
            throw new BaseException(500,"INTERNAL SERVER EXCEPTION");
        }
    }

    async delete(email){
        await this.clientUsernameCollection.doc(email).delete(); 
        logger.info(`client username is deleted :: ${email}`);
    }
}

module.exports = ClientUsernameService;