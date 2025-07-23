const userModel = require("../../models/userModel");
const Product = require("../../models/productModel");
const ProductVariation = require("../../models/productVariationModel");

// Helper: Get first image from first variation of a product
const getFirstImage = async (productId) => {
  try {
    const variation = await ProductVariation.findOne({
      product_id: productId,
      images: { $exists: true, $not: { $size: 0 } },
    });

    return variation?.images?.[0] || null;
  } catch (error) {
    console.error(`Error getting image for product ${productId}:`, error);
    return null;
  }
};

// Helper: Get first image for any product in a given category
const getCategoryFirstImage = async (category) => {
  try {
    const product = await Product.findOne({
      is_active: true,
      product_category: category,
    });

    if (!product) return null;

    const variation = await ProductVariation.findOne({
      product_id: product._id,
      images: { $exists: true, $not: { $size: 0 } },
    });

    return variation?.images?.[0] || null;
  } catch (error) {
    console.error(`Error getting category image for ${category}:`, error);
    return null;
  }
};

const home = async (req, res) => {
  try {
    // Get logged-in user name
    let name = null;
    if (req.session?.userId) {
      const user = await userModel.findById(req.session.userId);
      if (user) {
        name = `${user.firstName} ${user.lastName}`;
      }
    }

    // Get 4 random featured products
    const featuredProducts = await Product.aggregate([
      { $match: { is_active: true } },
      { $sample: { size: 4 } },
    ]);

    // Attach first image to each featured product
    for (let product of featuredProducts) {
      product.image = await getFirstImage(product._id);
    }

    // Get first image for Men, Women, and Kids categories
    const [menImage, womenImage, kidsImage] = await Promise.all([
      getCategoryFirstImage("Men"),
      getCategoryFirstImage("Women"),
      getCategoryFirstImage("Kids"),
    ]);

    // Get banner product and its image
    const bannerProduct = await Product.findOne({ is_active: true });
    const bannerImage = bannerProduct ? await getFirstImage(bannerProduct._id) : null;

    // Render home page
    res.render("user/home", {
      name,
      featuredProducts,
      bannerProduct,
      bannerImage,
      menImage,
      womenImage,
      kidsImage,
    });

  } catch (error) {
    console.error("Error in home route:", error);
    res.status(500).send("Something went wrong");
  }
};

module.exports = { home };
