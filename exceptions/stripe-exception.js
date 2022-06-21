const BaseException = require("./base-exception");

class StripeException extends BaseException{
    constructor(message){
        super(500,message);
    }
}

module.exports = StripeException;