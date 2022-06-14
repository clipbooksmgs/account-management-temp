const generateResponse = (status,errors,result)=>{
    return {
        "status": status,
        "errors": errors,
        "result": result
    }
}

module.exports = generateResponse;