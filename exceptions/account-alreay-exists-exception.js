const BaseException = require("./base-exception");

class AccountAlreadyExistsException extends BaseException{
    constructor(message){
        super(409,message);
    }
}

module.exports = AccountAlreadyExistsException;