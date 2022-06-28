const Firestore = require('@google-cloud/firestore');
const devenv = require('dotenv');
const path = require('path');


if(process.env.ENVIRONMENT==='DEV'){
    devenv.config({path: path.resolve(__dirname, '../.env.development')});
}else if(process.env.ENVIRONMENT==='DEV'){
    devenv.config({path: path.resolve(__dirname, '../.env.production')});
}



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