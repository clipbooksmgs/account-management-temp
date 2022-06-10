const Firestore = require('@google-cloud/firestore');
const devenv = require('dotenv');
const path = require('path');

devenv.config({path: path.resolve(__dirname, '../../keys/.env')});



const getFirestoreDB = () => {
    return new Firestore({
        projectId: process.env.PROJECT_ID,
        keyFilename: path.resolve(__dirname,process.env.GOOGLE_APPLICATION_CREDENTIALS)
    });    
}

module.exports = getFirestoreDB;