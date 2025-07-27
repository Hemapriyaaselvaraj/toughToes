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

  
  const selectedCategory = req.query.category || null;
  const selectedType = [].concat(req.query.type || []);
  const selectedSize = [].concat(req.query.size || []);
  const selectedColor = [].concat(req.query.color || []);
  const selectedPrice = [].concat(req.query.price || []);
  const search = req.query.search?.trim() || '';
  const sortOrder = req.query.sort || 'newest';
  const currentPage = parseInt(req.query.page) || 1;
  const pageSize = 20;

 
  const filter = { is_active: true };
  if (selectedCategory) filter.product_category = selectedCategory;
  if (selectedType.length) filter.product_type = { $in: selectedType };
  if (search) filter.name = { $regex: search, $options: 'i' };

  
  let variationProductIds = null;
  if (selectedSize.length || selectedColor.length) {
    const variationFilter = {};
    if (selectedSize.length) variationFilter.product_size = { $in: selectedSize };
    if (selectedColor.length) variationFilter.product_color = { $in: selectedColor };

    const variations = await ProductVariation.find(variationFilter, 'product_id').lean();
    variationProductIds = [...new Set(variations.map(v => v.product_id.toString()))];

    if (!variationProductIds.length) {
      return res.render('user/productList', {
        products: [],
        name,
        categories: [],
        types: [],
        sizes: [],
        colors: [],
        priceRanges: [],
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

    filter._id = { $in: variationProductIds };
  }

  
  if (selectedPrice.length) {
    const priceConditions = selectedPrice.map(range => {
      const [min, max] = range.split('-');
      const cond = {};
      if (min) cond.$gte = parseFloat(min);
      if (max && max !== 'null') cond.$lte = parseFloat(max);
      return cond;
    });

    if (priceConditions.length === 1) {
      filter.price = priceConditions[0];
    } else {
      filter.$or = priceConditions.map(p => ({ price: p }));
    }
  }

  
  let products = await Product.find(filter).lean();
  products.forEach(p => {
    p.afterDiscountPrice = p.price * (1 - (p.discount_percentage || 0) / 100);
  });

  if (sortOrder === 'asc') {
    products.sort((a, b) => a.afterDiscountPrice - b.afterDiscountPrice);
  } else if (sortOrder === 'desc') {
    products.sort((a, b) => b.afterDiscountPrice - a.afterDiscountPrice);
  } else if (sortOrder === 'nameAsc') {
    products.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOrder === 'nameDesc') {
    products.sort((a, b) => b.name.localeCompare(a.name));
  } else {
    products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const totalResults = products.length;
  const totalPages = Math.ceil(totalResults / pageSize);
  products = products.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  
  const productIds = products.map(p => p._id);
  const images = await ProductVariation.aggregate([
    { $match: { product_id: { $in: productIds } } },
    { $group: { _id: "$product_id", image: { $first: { $arrayElemAt: ["$images", 0] } } } }
  ]);

  const imageMap = {};
  images.forEach(i => {
    imageMap[i._id.toString()] = i.image;
  });
  products.forEach(p => {
    p.image = imageMap[p._id.toString()] || null;
  });

  
  const [categories, types, sizes, colors] = await Promise.all([
    productCategoryModel.find({}).lean(),
    productTypeModel.find({}).lean(),
    productSizeModel.find({}).lean(),
    productColorModel.find({}).lean()
  ]);
  const priceRanges = [
    { label: '0 - 500', min: 0, max: 500 },
    { label: '500 - 1000', min: 500, max: 1000 },
    { label: '1000 - 2000', min: 1000, max: 2000 },
    { label: '2000 - 5000', min: 2000, max: 5000 },
    { label: '5000 - 10000', min: 5000, max: 10000 }
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
    sort: sortOrder,
    query: req.query
  });
};


const productDetail = async (req, res) => {
  try {
    const productId = req.params.id;

    
    const product = await Product.findById(productId).lean();
    if (!product) return res.status(404).send('Product not found');

    
    const variations = await ProductVariation.find({ product_id: productId }).lean();

    
    let allImages = [];
    variations.forEach(variation => {
      if (variation.images && variation.images.length > 0) {
        allImages.push(...variation.images);
      }
    });
    
    allImages = [...new Set(allImages)];

    
    const sizes = [...new Set(variations.map(v => v.product_size))];

    
    const colors = [...new Set(variations.map(v => v.product_color))];

    
    const sizeColorMap = {};
    variations.forEach(variation => {
      const size = variation.product_size;
      const color = variation.product_color;

      if (!sizeColorMap[size]) {
        sizeColorMap[size] = [];
      }

      const alreadyHasColor = sizeColorMap[size].some(c => c.color === color);
      if (!alreadyHasColor) {
        sizeColorMap[size].push({
          color: color,
          images: variation.images
        });
      }
    });

    
    const relatedProducts = await Product.find({
      product_category: product.product_category,
      _id: { $ne: product._id },
      is_active: true
    }).limit(4).lean();

    
    const relatedIds = relatedProducts.map(p => p._id);
    const relatedImages = await ProductVariation.aggregate([
      { $match: { product_id: { $in: relatedIds } } },
      {
        $group: {
          _id: "$product_id",
          image: { $first: { $arrayElemAt: ["$images", 0] } }
        }
      }
    ]);

    
    const imageMap = {};
    relatedImages.forEach(item => {
      imageMap[item._id.toString()] = item.image;
    });

   
    relatedProducts.forEach(product => {
      const id = product._id.toString();
      product.image = imageMap[id] || null;
    });

   
    let name = null;
    if (req.session && req.session.userId) {
      const user = await userModel.findById(req.session.userId).lean();
      if (user) {
        name = user.firstName + (user.lastName ? " " + user.lastName : "");
      }
    }

    
    res.render('user/productDetail', {
      product,
      images: allImages,
      sizes,
      colors,
      sizeColorMap,
      relatedProducts,
      name,
      variations
    });

  } catch (error) {
    res.status(500).send('Error loading product detail');
  }
};


module.exports = {
  productList,
  productDetail,
};
