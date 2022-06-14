const BaseException = require("./base-exception");

class AccountNotFoundException extends BaseException{
    constructor(message){
        super(404, message);
    }
}

module.exports = AccountNotFoundException;