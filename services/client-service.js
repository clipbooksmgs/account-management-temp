const res = require('express/lib/response');
const collections = require('../util/collection-constants')

const getFirestoreDB = require("../util/firestore-db");


class ClientService{
    constructor(){
        const db = getFirestoreDB();
        this.clientUsernameCollection = db.collection(collections.CLIENT_USERNAME_COLLECTION);
        this.clientCollection = db.collection(collections.CLIENT_COLLECTION);
    }

   async save(client){
           
        const isExists = await this.isAccountExists(client.email);
        if(!isExists){
            await this.clientUsernameCollection.doc(client.email).set({
                'email': client.email
            });
            const resp = await this.clientCollection.add(JSON.parse(JSON.stringify(client)));
            await this.clientUsernameCollection.doc(client.email).update({
                'email': client.email,
                'clientCollectionKey': resp.id
            });
            return resp.id;
        }else{
            throw new Error(`An account already exits with ${client.email}`);
        }
        
    }


    async update(client, clientCollectionKey) {
        const email = client.email; 
        
        if(await this.isUsernameUpdating(email,clientCollectionKey)){
            if(await this.isEmailExistsForOtherClient(email,clientCollectionKey)){
                throw new Error(`${email} is already exist for another user`);
            }
            const querySnapshot = await this.clientUsernameCollection.where('clientCollectionKey', '==', clientCollectionKey).get();
            const docs = await querySnapshot.docs;
            await this.clientUsernameCollection.doc(docs[0].data().email).delete();
            await this.clientUsernameCollection.doc(email).set({
                'email':email,
                'clientCollectionKey': clientCollectionKey
            })
            
        }

       await this.clientCollection.doc(clientCollectionKey).update(JSON.parse(JSON.stringify(client)));
       return clientCollectionKey;
    }

    async isUsernameUpdating(email,clientCollectionKey){
        const clientDetails = await this.getClientCollection(clientCollectionKey);
        if(clientDetails.email !== email){
            return true;
        }
        return false;
    }


    async getClientCollection(clientCollectionKey){
        const clientDoc = await this.clientCollection.doc(clientCollectionKey).get()
        if(!clientDoc.exists){
            throw new Error(`No account exsits ${clientCollectionKey}`);
        }    
        return clientDoc.data(); 
    }

    async getClientUsernameCollection(email){
       const document = await this.clientUsernameCollection.doc(email).get();
       if(!document.exists){
           throw new Error(`No account exsits ${email}`);
       }
           
       return document.data(); 
    }

    async isAccountExists(email){
        return await this.getClientUsernameCollection(email).then(
            (data)=> {
                return true;
            },
            (err)=> {
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
        const document = await this.clientUsernameCollection.doc(email).get();
       if(!document.exists){
        throw new Error(`No account exsits ${email}`);
       }else{
            if(document.data().clientCollectionKey !== clientCollectionKey){
                return true;
            }else{
                return false;
            }
       }
    }


    async delete(email){
        const emailDoc = await this.clientUsernameCollection.doc(email).get();
        if(emailDoc.empty){
            throw new Error(`Account with ${email} is not existed or already deleted`);
        }else{
            await this.clientCollection.doc(emailDoc.data().clientCollectionKey).delete();
            await this.clientUsernameCollection.doc(email).delete();
        }
    }
}

module.exports = ClientService;