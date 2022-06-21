const logger = require('../config/log-configuration');
const { productService } = require('../services/product-service');
const generateResponse = require('../util/generate-response');


const getProducts = async (req,res,next) => {
    logger.info(`Entered:: controller getProducts`);
    const products = await productService.getProducts();
    return res.status(200).send(
        generateResponse('SUCCESS',null,{products: products})
    );
}

module.exports = {
    getProducts
}