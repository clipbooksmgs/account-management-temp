const logger = require('../config/log-configuration');
const getFirestoreDB = require("../config/firestore-db");
const collections = require('../util/collection-constants');


class ProductService{
    
    constructor(){
        const db = getFirestoreDB();
        logger.info('Connected to db');
        this.productCollection = db.collection(collections.PRODUCT_COLLECTION);
    }


    async getProducts() {

        const docRefArray = await this.productCollection.listDocuments();

        const promises = docRefArray.map(async docRef => {
            const docSnapshot = await docRef.get();
            return docSnapshot.data();
        })
        return Promise.all(promises).then(values => {
            return values;
        })
    }
}

module.exports.productService = new ProductService();