
const userModel = require("../models/userModel");
const ProductCategory = require('../models/productCategoryModel');
const ProductType = require('../models/productTypeModel');
const ProductSize = require('../models/productSizeModel');
const ProductColor = require('../models/productColorModel');

const getDashboard = async (req, res) => {
  const user = await userModel.findOne({ _id: req.session.userId });
  res.render("admin/dashboard", { name: user.firstName});
};

const getAddProduct = async (req, res) => {
  try {
    const categories = await ProductCategory.find({});
    const types = await ProductType.find({});
    const sizes = await ProductSize.find({});
    const colors = await ProductColor.find({});
    const user = await userModel.findOne({ _id: req.session.userId });
    res.render('admin/add-product', {
      mode: 'add',
      name: user ? user.firstName : '',
      categories,
      types,
      sizes,
      colors,
      product: null
    });
  } catch (err) {
    res.status(500).send('Error loading add product page');
  }
};

module.exports = {
  getDashboard,
  getAddProduct
};
