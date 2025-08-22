const userModel = require("../models/userModel");
const productCategoryModel = require("../models/productCategoryModel");
const productColorModel = require("../models/productColorModel");
const productSizeModel = require("../models/productSizeModel");
const productTypeModel = require("../models/productTypeModel");
const Product = require("../models/productModel");
const ProductVariation = require("../models/productVariationModel");


const productList = async (req, res) => {
  try {
    let name = null;
    if (req.session?.userId) {
      const user = await userModel.findById(req.session.userId).lean();
      if (user) name = [user.firstName, user.lastName].filter(Boolean).join(" ");
    }

    const selectedCategory = req.query.category || null;
    const selectedType = req.query.type ? [].concat(req.query.type) : [];
    const selectedSize = req.query.size ? [].concat(req.query.size) : [];
    const selectedColor = req.query.color ? [].concat(req.query.color) : [];
    const selectedPrice = req.query.price ? [].concat(req.query.price) : [];
    const search = req.query.search ? req.query.search.trim().toLowerCase() : "";
    const sortOrder = req.query.sort || "newest";
    const currentPage = parseInt(req.query.page) || 1;
    const pageSize = 20;

    // Step 1: Get all products initially filtered by category/type
    let products = await Product.find({ is_active: true }).lean();

    if (selectedCategory) {
      products = products.filter(p => p.product_category === selectedCategory);
    }
    if (selectedType.length) {
      products = products.filter(p => selectedType.includes(p.product_type));
    }

    // Step 2: Filter by variations (size/color)
    if (selectedSize.length || selectedColor.length) {
      const variationFilter = {};
      if (selectedSize.length) variationFilter.product_size = { $in: selectedSize };
      if (selectedColor.length) variationFilter.product_color = { $in: selectedColor };

      const variations = await ProductVariation.find(variationFilter, "product_id").lean();
      const variationProductIds = [...new Set(variations.map(v => v.product_id.toString()))];

      products = products.filter(p => variationProductIds.includes(p._id.toString()));
    }

    // Step 3: Filter by price
    if (selectedPrice.length) {
      const ranges = selectedPrice.map(r => {
        const [min, max] = r.split("-").map(x => parseFloat(x));
        return { min: min || 0, max: max || Infinity };
      });
      products = products.filter(p => {
        const afterDiscount = p.price * (1 - (p.discount_percentage || 0) / 100);
        return ranges.some(r => afterDiscount >= r.min && afterDiscount <= r.max);
      });
    }

    // Step 4: Filter by search
    if (search) {
      products = products.filter(p => p.name.toLowerCase().includes(search));
    }

    // Step 5: Compute discount price
    products.forEach(p => {
      p.afterDiscountPrice = p.price * (1 - (p.discount_percentage || 0) / 100);
    });

    // Step 6: Sorting
    if (sortOrder === "asc") products.sort((a, b) => a.afterDiscountPrice - b.afterDiscountPrice);
    else if (sortOrder === "desc") products.sort((a, b) => b.afterDiscountPrice - a.afterDiscountPrice);
    else if (sortOrder === "nameAsc") products.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortOrder === "nameDesc") products.sort((a, b) => b.name.localeCompare(a.name));
    else products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Step 7: Pagination
    const totalResults = products.length;
    const totalPages = Math.ceil(totalResults / pageSize);
    products = products.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Step 8: Attach variation images
    const productIds = products.map(p => p._id);
    const images = await ProductVariation.aggregate([
      { $match: { product_id: { $in: productIds } } },
      { $group: { _id: "$product_id", image: { $first: { $arrayElemAt: ["$images", 0] } } } }
    ]);
    const imageMap = {};
    images.forEach(i => { imageMap[i._id.toString()] = i.image; });
    products.forEach(p => { p.image = imageMap[p._id.toString()] || null; });

    // Step 9: Fetch filter options
    const [categories, types, sizes, colors] = await Promise.all([
      productCategoryModel.find({}).lean(),
      productTypeModel.find({}).lean(),
      productSizeModel.find({}).lean(),
      productColorModel.find({}).lean()
    ]);

    const priceRanges = [
      { label: "0 - 500", min: 0, max: 500 },
      { label: "500 - 1000", min: 500, max: 1000 },
      { label: "1000 - 2000", min: 1000, max: 2000 },
      { label: "2000 - 5000", min: 2000, max: 5000 },
      { label: "5000 - 10000", min: 5000, max: 10000 }
    ];

    res.render("user/productList", {
      products,
      name,
      categories,
      types,
      sizes,
      colors,
      priceRanges,
      selectedCategory,
      selectedType,
      selectedSize,
      selectedColor,
      selectedPrice,
      currentPage,
      totalPages,
      totalResults,
      pageSize,
      sort: sortOrder,
      query: req.query
    });
  } catch (err) {
    console.error("Error in productList:", err);
    res.status(500).send("Error loading products");
  }
};


const productDetail = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId).lean();

    if (!product) 
    return res.status(404).send('Product not found');

    const variations = await ProductVariation.find({ product_id: productId }).lean();
    
    let images = [];
    variations.forEach(v => {
      if (v.images && v.images.length) images.push(...v.images);
    });
    images = [...new Set(images)];

    const sizes = [...new Set(variations.map(v => v.product_size))];
    const colors = [...new Set(variations.map(v => v.product_color))];
    
    const sizeColorMap = {};
    if (variations && variations.length) {
      variations.forEach(variation => {
        const size = variation.product_size;
        const color = variation.product_color;
       
        if (!sizeColorMap[size]) sizeColorMap[size] = [];
        if (color && !sizeColorMap[size].includes(color)) sizeColorMap[size].push( {
          color: color, 
          images: variation.images
        });
      });
    }

    const relatedProducts = await Product.find({
      product_category: product.product_category,
      _id: { $ne: product._id },
      is_active: true
    }).limit(4).lean();

    const relatedIds = relatedProducts.map(p => p._id);
    const relatedVariations = await ProductVariation.aggregate([
      { $match: { product_id: { $in: relatedIds } } },
      { $group: { _id: "$product_id", image: { $first: { $arrayElemAt: ["$images", 0] } } } }
    ]);


    const relatedImageMap = {};
    relatedVariations.forEach(v => { relatedImageMap[v._id.toString()] = v.image; });
    relatedProducts.forEach(p => { p.image = relatedImageMap[p._id.toString()] || null; });
    let name = null;
    if (req.session && req.session.userId) {
      const user = await userModel.findById(req.session.userId).lean();
      if (user) name = user.firstName + (user.lastName ? (" " + user.lastName) : "");
    }
    res.render('user/productDetail', {
      product,
      images,
      sizes,
      colors,
      relatedProducts,
      name,
      sizeColorMap,
      variations,
    });
  } catch (err) {
    res.status(500).send('Error loading product detail');
  }
};

module.exports = {
  productList,
  productDetail,
  
};
