const userModel = require("../../models/userModel");
const productCategoryModel = require("../../models/productCategoryModel");
const productColorModel = require("../../models/productColorModel");
const productSizeModel = require("../../models/productSizeModel");
const productTypeModel = require("../../models/productTypeModel");
const Product = require("../../models/productModel");
const ProductVariation = require("../../models/productVariationModel");

const productList = async (req, res) => {
  let name = null;
  if (req.session && req.session.userId) {
    const user = await userModel.findById(req.session.userId);
    if (user) name = user.firstName + ' ' + user.lastName;
  }
  // Get selected filters from query
  const selectedCategory = req.query.category || null;
  const typeArr = req.query.type ? (Array.isArray(req.query.type) ? req.query.type : [req.query.type]) : (req.query['type[]'] ? (Array.isArray(req.query['type[]']) ? req.query['type[]'] : [req.query['type[]']]) : []);
  const sizeArr = req.query.size ? (Array.isArray(req.query.size) ? req.query.size : [req.query.size]) : (req.query['size[]'] ? (Array.isArray(req.query['size[]']) ? req.query['size[]'] : [req.query['size[]']]) : []);
  const colorArr = req.query.color ? (Array.isArray(req.query.color) ? req.query.color : [req.query.color]) : (req.query['color[]'] ? (Array.isArray(req.query['color[]']) ? req.query['color[]'] : [req.query['color[]']]) : []);
  const priceArr = req.query.price ? (Array.isArray(req.query.price) ? req.query.price : [req.query.price]) : (req.query['price[]'] ? (Array.isArray(req.query['price[]']) ? req.query['price[]'] : [req.query['price[]']]) : []);
  // Always reset to empty array if nothing is selected
  const selectedType = typeArr.length ? typeArr : [];
  const selectedSize = sizeArr.length ? sizeArr : [];
  const selectedColor = colorArr.length ? colorArr : [];
  const selectedPrice = priceArr.length ? priceArr : [];

  // Pagination
  const pageSize = 20; // changed from 9 to 20
  const currentPage = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;


  // Build filter
  let andFilters = [{ is_active: true }];
  if (selectedCategory) andFilters.push({ product_category: selectedCategory });
  if (selectedType.length) andFilters.push({ product_type: { $in: selectedType } });

  // Search by product name
  if (req.query.search && req.query.search.trim().length > 0) {
    andFilters.push({ name: { $regex: req.query.search.trim(), $options: 'i' } });
  }

  // Variation-based filtering
  let variationProductIds = null;

  if (selectedSize.length || selectedColor.length) {
    let variationFilter = {};
    if (selectedSize.length) variationFilter.product_size = { $in: selectedSize };
    if (selectedColor.length) variationFilter.product_color = { $in: selectedColor };
    const matchingVariations = await ProductVariation.find(variationFilter, 'product_id').lean();
    variationProductIds = [...new Set(matchingVariations.map(v => v.product_id.toString()))];
    if (variationProductIds.length === 0) {
      // No products match, so return empty result
      return res.render('user/productList', {
        products: [],
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
        totalPages: 0,
        totalResults: 0,
        pageSize
      });
    }
    andFilters.push({ _id: { $in: variationProductIds } });
  }
  // Price: support multiple ranges
  if (selectedPrice.length) {
    let priceFilters = [];
    selectedPrice.forEach(range => {
      const [min, max] = range.split('-');
      let pf = {};
      if (min) pf.$gte = Number(min);
      if (max && max !== 'null') pf.$lte = Number(max);
      priceFilters.push(pf);
    });
    if (priceFilters.length === 1) {
      andFilters.push({ price: priceFilters[0] });
    } else if (priceFilters.length > 1) {
      andFilters.push({ $or: priceFilters.map(pf => ({ price: pf })) });
    }
  }
  // Remove empty filters
  andFilters = andFilters.filter(f => Object.keys(f).length > 0);
  let productFilter = andFilters.length > 1 ? { $and: andFilters } : andFilters[0];

  // --- SORTING LOGIC ---
  let sortOrder = req.query.sort || 'asc';
  // Always get latest products first
  let products = await Product.find(productFilter)
    .sort({ createdAt: -1 })
    .lean();
  products.forEach(p => {
    p.afterDiscountPrice = p.price * (1 - (p.discount_percentage || 0) / 100);
  });
  // Sort by after-discount price (but keep latest first for same price)
  if (sortOrder === 'asc') {
    products.sort((a, b) => {
      if (a.afterDiscountPrice === b.afterDiscountPrice) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return a.afterDiscountPrice - b.afterDiscountPrice;
    });
  } else if (sortOrder === 'desc') {
    products.sort((a, b) => {
      if (a.afterDiscountPrice === b.afterDiscountPrice) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return b.afterDiscountPrice - a.afterDiscountPrice;
    });
  }
  // Pagination after sorting
  const totalResults = products.length;
  const totalPages = Math.ceil(totalResults / pageSize);
  products = products.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  // Fetch one image for each product from its variations
  const productIds = products.map(p => p._id);
  const variations = await ProductVariation.aggregate([
    { $match: { product_id: { $in: productIds } } },
    { $group: { _id: "$product_id", image: { $first: { $arrayElemAt: ["$images", 0] } } } }
  ]);
  const imageMap = {};
  variations.forEach(v => { imageMap[v._id.toString()] = v.image; });
  products.forEach(p => { p.image = imageMap[p._id.toString()] || null; });
  // Fetch filter data from DB
  const categories = await productCategoryModel.find({}).lean();
  const types = await productTypeModel.find({}).lean();
  const sizes = await productSizeModel.find({}).lean();
  const colors = await productColorModel.find({}).lean();
  // Price ranges (static for now)
  const priceRanges = [
    { label: '$0 - $500', min: 0, max: 50 },
    { label: '$500 - $1000', min: 500, max: 1000 },
    { label: '$1000 - $2000', min: 1000, max: 2000 },
    { label: '$2000 - $5000', min: 2000, max: 5000 },
    { label: '$5000 - $10000', min: 5000, max: 10000 }
  ];
  res.render('user/productList', {
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
    sort: sortOrder, // Pass sort to EJS
    query: req.query // Pass query for filter persistence
  });
};

// Show product detail page
const productDetail = async (req, res) => {
  try {
    const productId = req.params.id;
    // Fetch product by ID
    const product = await Product.findById(productId).lean();
    if (!product) return res.status(404).send('Product not found');
    // Fetch variations (images, sizes, colors)
    const variations = await ProductVariation.find({ product_id: productId }).lean();
    // Prepare images array (main + thumbnails)
    let images = [];
    variations.forEach(v => {
      if (v.images && v.images.length) images.push(...v.images);
    });
    images = [...new Set(images)];
    const sizes = [...new Set(variations.map(v => v.product_size))];
    const colors = [...new Set(variations.map(v => v.product_color))];
    // Build a sizeColorMap: { size1: [color1, color2], ... }
    const sizeColorMap = {};
    if (variations && variations.length) {
      variations.forEach(variation => {
        const size = variation.size;
        const color = variation.color;
        if (!sizeColorMap[size]) sizeColorMap[size] = [];
        if (color && !sizeColorMap[size].includes(color)) sizeColorMap[size].push(color);
      });
    }
    // Fetch related products (same category, exclude self)
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
    // Fetch user name from DB if logged in
    let name = null;
    if (req.session && req.session.userId) {
      const user = await require("../../models/userModel").findById(req.session.userId).lean();
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
    });
  } catch (err) {
    res.status(500).send('Error loading product detail');
  }
};

module.exports = {
  productList,
  productDetail,
};
