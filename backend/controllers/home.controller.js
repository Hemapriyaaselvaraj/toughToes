const userModel = require("../models/userModel");
const Product = require("../models/productModel");
const ProductVariation = require("../models/productVariationModel");

const home = async (req, res) => {
    let name = "Guest";
    if (req.session && req.session.userId) {
        const user = await userModel.findById(req.session.userId);
        if (user) name = user.firstName + ' ' + user.lastName;
    }
    // Get 4 random products
    const featuredProducts = await Product.aggregate([{ $match: { is_active: true } }, { $sample: { size: 4 } }]);
    // For each product, get one image from its variations
    const productIds = featuredProducts.map(p => p._id);
    const variations = await ProductVariation.aggregate([
      { $match: { product_id: { $in: productIds } } },
      { $group: { _id: "$product_id", image: { $first: { $arrayElemAt: ["$images", 0] } } } }
    ]);
    const imageMap = {};
    variations.forEach(v => { imageMap[v._id.toString()] = v.image; });
    // Attach image to each product
    featuredProducts.forEach(p => { p.image = imageMap[p._id.toString()] || null; });
    res.render('user/home', { name, featuredProducts });
}

module.exports = {
    home
}