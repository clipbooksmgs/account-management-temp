class BaseException extends Error{
    constructor(httpStatusCode, message){
        super(message);
        this.httpStatusCode = httpStatusCode;
    }
}

module.exports = BaseException;