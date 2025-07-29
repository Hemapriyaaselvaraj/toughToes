const userModel = require("../../models/userModel");
const productCategoryModel = require("../../models/productCategoryModel");
const productColorModel = require("../../models/productColorModel");
const productSizeModel = require("../../models/productSizeModel");
const productTypeModel = require("../../models/productTypeModel");
const Product = require("../../models/productModel");
const ProductVariation = require("../../models/productVariationModel");

const showProducts = async (req, res) => {
  const { category, type, color, size, price, sort, search, page } = req.query;

  const selectedCategory = category || null;
  const selectedType = type ? (Array.isArray(type) ? type : [type]) : [];
  const selectedColor = color ? (Array.isArray(color) ? color : [color]) : [];
  const selectedSize = size ? (Array.isArray(size) ? size : [size]) : [];
  const selectedPrice = price ? (Array.isArray(price) ? price : [price]) : [];

  const filter = { is_active: true };
  let productVariations;

  // fetch product variations first if the size or color filter is present
  if (selectedColor.length || selectedSize.length) {
    const variationFilter = {};

    if (selectedColor.length) {
      variationFilter.product_color = {
        $in: selectedColor.map((c) => new RegExp(`^${c}$`, "i")),
      };
    }

    if (selectedSize.length) {
      variationFilter.product_size = {
        $in: selectedSize.map((s) => new RegExp(`^${s}$`, "i")),
      };
    }

    productVariations = await ProductVariation.find(variationFilter).lean();

    if (productVariations.length > 0) {
      const variationMatchedProductIds = [
        ...new Set(productVariations.map((v) => v.product_id)),
      ];
      filter.product_id = { $in: variationMatchedProductIds };
    }
  }

  if (selectedCategory) {
    filter.product_category = new RegExp(`^${category}$`, "i");
  }

  if (selectedType.length > 0) {
    filter.product_type = {
      $in: selectedType.map((t) => new RegExp(`^${t}$`, "i")),
    };
  }

  if (price) {
    const [minPrice, maxPrice] = price.split("-").map(Number);
    if (minPrice && maxPrice) {
      filter.price = { $gte: minPrice, $lte: maxPrice };
    } else if (minPrice) {
      filter.price = { $gte: minPrice };
    } else if (maxPrice) {
      filter.price = { $lte: maxPrice };
    }
  }

  if (search) {
    filter.name = new RegExp(search, "i");
  }

  const pageSize = 5;
  const currentPage = parseInt(page) || 1;
  const skip = (currentPage - 1) * pageSize;

  let products = await Product.find(filter).lean();

  // calculate the discounted price of the products
  products.forEach((product) => {
    product.afterDiscountPrice =
      product.price * (1 - (product.discount_percentage || 0) / 100);
  });

  // sort the products after calculating the discounted price
  if (sort === "asc") {
    products.sort((a, b) => a.afterDiscountPrice - b.afterDiscountPrice);
  } else if (sort === "desc") {
    products.sort((a, b) => b.afterDiscountPrice - a.afterDiscountPrice);
  } else if (sort === "nameAsc") {
    products.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "nameDesc") {
    products.sort((a, b) => b.name.localeCompare(a.name));
  } else {
    products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const totalResults = products.length;
  const totalPages = Math.ceil(totalResults / pageSize);
  products = products.slice(skip, pageSize * currentPage);

  // take the first image from the variations for the given product id
  const displayedProductIds = products.map((product) => product._id);
  const images = await ProductVariation.aggregate([
    { $match: { product_id: { $in: displayedProductIds } } },
    {
      $group: {
        _id: "$product_id",
        image: { $first: { $arrayElemAt: ["$images", 0] } },
      },
    },
  ]);

  // add the fetched image to the products
  products.forEach((product) => {
    const productImage = images.find((image) => image._id.equals(product._id));
    if (productImage) {
      product.image = productImage.image;
    }
  });

  // all the below code is added only to give supporting data to the ejs
  const [categories, types, sizes, colors] = await Promise.all([
    productCategoryModel.find({}).lean(),
    productTypeModel.find({}).lean(),
    productSizeModel.find({}).lean(),
    productColorModel.find({}).lean(),
  ]);

  const priceRanges = [
    { label: "0 - 500", min: 0, max: 500 },
    { label: "500 - 1000", min: 500, max: 1000 },
    { label: "1000 - 2000", min: 1000, max: 2000 },
    { label: "2000 - 5000", min: 2000, max: 5000 },
    { label: "5000 - 10000", min: 5000, max: 10000 },
  ];

  let name = null;
  if (req.session && req.session.userId) {
    const user = await userModel.findById(req.session.userId);
    if (user) name = user.firstName + " " + user.lastName;
  }

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
    sort,
    query: req.query,
  });
};


const productList = async (req, res) => {
  let name = null;
  if (req.session && req.session.userId) {
    const user = await userModel.findById(req.session.userId);
    if (user) name = user.firstName + " " + user.lastName;
  }

  const selectedCategory = req.query.category || null;
  const selectedType = [].concat(req.query.type || []);
  const selectedSize = [].concat(req.query.size || []);
  const selectedColor = [].concat(req.query.color || []);
  const selectedPrice = [].concat(req.query.price || []);
  const search = req.query.search?.trim() || "";
  const sortOrder = req.query.sort || "newest";
  const currentPage = parseInt(req.query.page) || 1;
  const pageSize = 20;

  const filter = { is_active: true };
  if (selectedCategory) filter.product_category = selectedCategory;
  if (selectedType.length) filter.product_type = { $in: selectedType };
  if (search) filter.name = { $regex: search, $options: "i" };

  let variationProductIds = null;
  if (selectedSize.length || selectedColor.length) {
    const variationFilter = {};
    if (selectedSize.length)
      variationFilter.product_size = { $in: selectedSize };
    if (selectedColor.length)
      variationFilter.product_color = { $in: selectedColor };

    const variations = await ProductVariation.find(
      variationFilter,
      "product_id"
    ).lean();
    variationProductIds = [
      ...new Set(variations.map((v) => v.product_id.toString())),
    ];

    if (!variationProductIds.length) {
      return res.render("user/productList", {
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
        pageSize,
      });
    }

    filter._id = { $in: variationProductIds };
  }

  if (selectedPrice.length) {
    const priceConditions = selectedPrice.map((range) => {
      const [min, max] = range.split("-");
      const cond = {};
      if (min) cond.$gte = parseFloat(min);
      if (max && max !== "null") cond.$lte = parseFloat(max);
      return cond;
    });

    if (priceConditions.length === 1) {
      filter.price = priceConditions[0];
    } else {
      filter.$or = priceConditions.map((p) => ({ price: p }));
    }
  }

  let products = await Product.find(filter).lean();
  products.forEach((p) => {
    p.afterDiscountPrice = p.price * (1 - (p.discount_percentage || 0) / 100);
  });

  if (sortOrder === "asc") {
    products.sort((a, b) => a.afterDiscountPrice - b.afterDiscountPrice);
  } else if (sortOrder === "desc") {
    products.sort((a, b) => b.afterDiscountPrice - a.afterDiscountPrice);
  } else if (sortOrder === "nameAsc") {
    products.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOrder === "nameDesc") {
    products.sort((a, b) => b.name.localeCompare(a.name));
  } else {
    products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const totalResults = products.length;
  const totalPages = Math.ceil(totalResults / pageSize);
  products = products.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const productIds = products.map((p) => p._id);
  const images = await ProductVariation.aggregate([
    { $match: { product_id: { $in: productIds } } },
    {
      $group: {
        _id: "$product_id",
        image: { $first: { $arrayElemAt: ["$images", 0] } },
      },
    },
  ]);

  const imageMap = {};
  images.forEach((i) => {
    imageMap[i._id.toString()] = i.image;
  });
  products.forEach((p) => {
    p.image = imageMap[p._id.toString()] || null;
  });

  const [categories, types, sizes, colors] = await Promise.all([
    productCategoryModel.find({}).lean(),
    productTypeModel.find({}).lean(),
    productSizeModel.find({}).lean(),
    productColorModel.find({}).lean(),
  ]);
  const priceRanges = [
    { label: "0 - 500", min: 0, max: 500 },
    { label: "500 - 1000", min: 500, max: 1000 },
    { label: "1000 - 2000", min: 1000, max: 2000 },
    { label: "2000 - 5000", min: 2000, max: 5000 },
    { label: "5000 - 10000", min: 5000, max: 10000 },
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
    query: req.query,
  });
};

const productDetail = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId).lean();
    if (!product) return res.status(404).send('Product not found');
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
  showProducts,
};
