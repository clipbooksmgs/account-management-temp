

const removePassword = (client) => {
    const {password, ...otherFields} = client;
    return {...otherFields};
}

module.exports = {
    removePassword
}