const BaseException = require("./base-exception");

class DocumentCreationException extends BaseException{
    constructor(collectionName,message){
        const msg = `collectionName: ${collectionName}; description: ${message}`;
        super(404,msg);
    }
}

module.exports = DocumentCreationException;