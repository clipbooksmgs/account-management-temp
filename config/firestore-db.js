const Firestore = require('@google-cloud/firestore');
const devenv = require('dotenv');
const path = require('path');

devenv.config({path: path.resolve(__dirname, '../../keys/.env')});



 const settings = {
    projectId: process.env.PROJECT_ID,
    keyFilename: path.resolve(__dirname,process.env.GOOGLE_APPLICATION_CREDENTIALS)
};

const getFirestoreDB = () => {
    if(process.env.ENVIRONMENT!=='DEV'){
        return new Firestore(settings); 
    }
    return new Firestore();
}

module.exports = getFirestoreDB;