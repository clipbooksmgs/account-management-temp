const express = require('express');
const {getProducts} = require('../controller/product-controller');

const router = express.Router();



router.get('/products', getProducts);

module.exports = router;