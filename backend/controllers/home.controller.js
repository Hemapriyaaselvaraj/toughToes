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
    featuredProducts.forEach(p => { p.image = imageMap[p._id.toString()] || null; });

    // --- NEW LOGIC FOR CATEGORY IMAGES ---
    // Helper to get one random image for a category
    async function getRandomCategoryImage(category) {
      const product = await Product.aggregate([
        { $match: { is_active: true, product_category: category } },
        { $sample: { size: 1 } }
      ]);
      if (!product.length) return null;
      const variation = await ProductVariation.aggregate([
        { $match: { product_id: product[0]._id } },
        { $sample: { size: 1 } }
      ]);
      return (variation[0] && variation[0].images && variation[0].images.length) ? variation[0].images[0] : null;
    }
    // Get images for Men, Women, Kids
    const [menImage, womenImage, kidsImage] = await Promise.all([
      getRandomCategoryImage("Men"),
      getRandomCategoryImage("Women"),
      getRandomCategoryImage("Kids")
    ]);

    // --- NEW LOGIC FOR HERO SHOE IMAGE ---
    // Get one random product variation image for hero section
    const heroProduct = await Product.aggregate([
      { $match: { is_active: true } },
      { $sample: { size: 1 } }
    ]);
    let heroImage = null;
    if (heroProduct.length) {
      const heroVariation = await ProductVariation.aggregate([
        { $match: { product_id: heroProduct[0]._id } },
        { $sample: { size: 1 } }
      ]);
      if (heroVariation[0] && heroVariation[0].images && heroVariation[0].images.length) {
        heroImage = heroVariation[0].images[0];
      }
    }
    res.render('user/home', { name, featuredProducts, menImage, womenImage, kidsImage, heroImage });
}

module.exports = {
    home
}