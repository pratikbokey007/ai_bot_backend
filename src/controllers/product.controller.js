const Product = require("../models/product.model");

async function getProduct(req, res, next) {
  try {
    const products = await Product.find().sort({ product_id: 1 }).lean();
    return res.json(products);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProduct,
};
