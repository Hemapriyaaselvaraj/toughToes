const userModel = require("../models/userModel");
const productCategoryModel = require("../models/productCategoryModel");
const productColorModel = require("../models/productColorModel");
const productSizeModel = require("../models/productSizeModel");
const productTypeModel = require("../models/productTypeModel");
const Product = require("../models/productModel");
const ProductVariation = require("../models/productVariationModel");
const cloudinary = require("../config/cloudinary");
const productVariationModel = require("../models/productVariationModel");

const getProductConfiguration = async (req, res) => {
  const user = await userModel.findOne({ _id: req.session.userId });

  const categories = await productCategoryModel.find({});
  const types = await productTypeModel.find({});
  const sizes = await productSizeModel.find({});
  const colors = await productColorModel.find({});

  res.render("admin/product-configuration", {
    name: user.firstName,
    data: {
      category: categories,
      type: types,
      size: sizes,
      color: colors,
    },
  });
};

const createCategory = async (req, res) => {
  try {
    const { value } = req.body;

    const isCategoryAlreadyAvailable = await productCategoryModel.findOne({
      category: value,
    });

    if (isCategoryAlreadyAvailable) {
      throw new Error("Category already exists");
    }

    const newCategory = new productCategoryModel({ category: value });
    await newCategory.save();

    res.status(201).json({
      message: "Category created",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Failed to create category" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { value } = req.body;
    const { id } = req.params;

    const existingCategory = await productCategoryModel.findById(id);

    if (!existingCategory) {
      throw new Error("Category not found");
    }

    const isCategoryAlreadyAvailable = await productCategoryModel.findOne({
      category: value,
    });

    if (isCategoryAlreadyAvailable) {
      throw new Error("Category already exists");
    }

    var myquery = { _id: id };
    var newvalues = {
      $set: { category: value },
    };

    await productCategoryModel.updateOne(myquery, newvalues);

    res.status(200).json({
      message: "Category updated",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Failed to update category" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await productCategoryModel.findByIdAndDelete(id);

    res.status(200).json({
      message: "Category deleted",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Failed to delete category" });
  }
};

// CREATE Product Type
const createType = async (req, res) => {
  try {
    const { value } = req.body;

    const isTypeAlreadyAvailable = await productTypeModel.findOne({
      type: value,
    });

    if (isTypeAlreadyAvailable) {
      throw new Error("Type already exists");
    }

    const newType = new productTypeModel({ type: value });
    await newType.save();

    res.status(201).json({
      message: "Type created",
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to create type" });
  }
};

// UPDATE Product Type
const updateType = async (req, res) => {
  try {
    const { value } = req.body;
    const { id } = req.params;

    const existingType = await productTypeModel.findById(id);

    if (!existingType) {
      throw new Error("Type not found");
    }

    const isTypeAlreadyAvailable = await productTypeModel.findOne({
      type: value,
    });

    if (isTypeAlreadyAvailable) {
      throw new Error("Type already exists");
    }

    const myquery = { _id: id };
    const newvalues = {
      $set: { type: value },
    };

    await productTypeModel.updateOne(myquery, newvalues);

    res.status(200).json({
      message: "Type updated",
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update type" });
  }
};

// DELETE Product Type
const deleteType = async (req, res) => {
  try {
    const { id } = req.params;

    await productTypeModel.findByIdAndDelete(id);

    res.status(200).json({
      message: "Type deleted",
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete type" });
  }
};

// CREATE Product Size
const createSize = async (req, res) => {
  try {
    const { value } = req.body;

    const isSizeAlreadyAvailable = await productSizeModel.findOne({
      size: value,
    });

    if (isSizeAlreadyAvailable) {
      throw new Error("Size already exists");
    }

    const newSize = new productSizeModel({ size: value });
    await newSize.save();

    res.status(201).json({
      message: "Size created",
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to create size" });
  }
};

// UPDATE Product Size
const updateSize = async (req, res) => {
  try {
    const { value } = req.body;
    const { id } = req.params;

    const existingSize = await productSizeModel.findById(id);

    if (!existingSize) {
      throw new Error("Size not found");
    }

    const isSizeAlreadyAvailable = await productSizeModel.findOne({
      size: value,
    });

    if (isSizeAlreadyAvailable) {
      throw new Error("Size already exists");
    }

    const myquery = { _id: id };
    const newvalues = {
      $set: { size: value },
    };

    await productSizeModel.updateOne(myquery, newvalues);

    res.status(200).json({
      message: "Size updated",
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update size" });
  }
};

// DELETE Product Size
const deleteSize = async (req, res) => {
  try {
    const { id } = req.params;

    await productSizeModel.findByIdAndDelete(id);

    res.status(200).json({
      message: "Size deleted",
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete size" });
  }
};

// CREATE Product Color
const createColor = async (req, res) => {
  try {
    const { value } = req.body;

    const isColorAlreadyAvailable = await productColorModel.findOne({
      color: value,
    });

    if (isColorAlreadyAvailable) {
      throw new Error("Color already exists");
    }

    const newColor = new productColorModel({ color: value });
    await newColor.save();

    res.status(201).json({
      message: "Color created",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Failed to create color" });
  }
};

// UPDATE Product Color
const updateColor = async (req, res) => {
  try {
    const { value } = req.body;
    const { id } = req.params;

    const existingColor = await productColorModel.findById(id);

    if (!existingColor) {
      throw new Error("Color not found");
    }

    const isColorAlreadyAvailable = await productColorModel.findOne({
      color: value,
    });

    if (isColorAlreadyAvailable) {
      throw new Error("Color already exists");
    }

    const myquery = { _id: id };
    const newvalues = {
      $set: { color: value },
    };

    await productColorModel.updateOne(myquery, newvalues);

    res.status(200).json({
      message: "Color updated",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Failed to update color" });
  }
};

// DELETE Product Color
const deleteColor = async (req, res) => {
  try {
    const { id } = req.params;

    await productColorModel.findByIdAndDelete(id);

    res.status(200).json({
      message: "Color deleted",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Failed to delete color" });
  }
};

const getAddProduct = async (req, res) => {
  const user = await userModel.findOne({ _id: req.session.userId });

  const categories = await productCategoryModel.find({});
  const types = await productTypeModel.find({});
  const sizes = await productSizeModel.find({});
  const colors = await productColorModel.find({});

  res.render("admin/add-product", {
    name: user.firstName,
    categories,
    types,
    sizes,
    colors,
  });
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      description,
      price,
      discount,
      category,
      type,
      variations,
    } = req.body;

    const newProduct = new Product({
      name,
      product_sku: sku,
      description,
      price,
      discount_percentage: discount,
      product_category: category,
      product_type: type,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const savedProduct = await newProduct.save();

    const variationEntries = [];
    const files = req.files || [];

    for (let i = 0; i < variations.length; i++) {
      const variation = variations[i];
      const images = files.filter(file => file.fieldname === `variationImages_${i}`) || [];
      const imageUrls = images.map((file) => file.path);

      const newVariation = new ProductVariation({
        product_id: savedProduct._id,
        product_size: variation.size,
        product_color: variation.color,
        stock_quantity: variation.stock,
        images: imageUrls,
        created_at: new Date(),
        updated_at: new Date(),
      });

      variationEntries.push(newVariation.save());
    }

    await Promise.all(variationEntries);

    res.status(201).json({ message: "Product created successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getProducts = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.session.userId });
    const categories = await productCategoryModel.find({});
    const types = await productTypeModel.find({});

    // Filters
    const {
      category = 'all',
      type = 'all',
      sort = 'nameAsc',
      search = '',
      page = 1
    } = req.query;

    const pageSize = 5;
    const currentPage = parseInt(page) || 1;
    const filter = {};

    if (category !== 'all') filter.product_category = category;
    if (type !== 'all') filter.product_type = type;
    if (search) filter.name = { $regex: search, $options: 'i' };

    let sortObj = {};
    if (sort === 'nameAsc') sortObj = { name: 1 };
    else if (sort === 'nameDesc') sortObj = { name: -1 };

    const totalResults = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort(sortObj)
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize)
      .lean();

    for (let product of products) {
      product.stock = product.stock || 0;
    }

    const totalPages = Math.ceil(totalResults / pageSize);

    res.render("admin/products", {
      name: user.firstName || "Admin",
      products,
      categories,
      types,
      currentCategory: category,
      currentType: type,
      currentSort: sort,
      currentSearch: search,
      currentPage,
      totalPages,
      totalResults,
      pageSize
    });

  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch products" });
  }
};

const toggleActive = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    product.is_active = !product.is_active;
    await product.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to update status" });
  }
};

const productList = async (req, res) => {
  let name = "Guest";
  if (req.session && req.session.userId) {
    const user = await userModel.findById(req.session.userId);
    if (user) name = user.firstName + ' ' + user.lastName;
  }
  // Get selected filters from query
  const selectedCategory = req.query.category || null;
  const selectedType = req.query.type || null;
  const selectedSize = req.query.size || null;
  const selectedColor = req.query.color || null;
  const selectedPrice = req.query.price || null;
  // Pagination
  const pageSize = 9;
  const currentPage = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
  let productFilter = { is_active: true };
  // Only filter by type, size, color if all three are selected and not null
  if (selectedType && selectedSize && selectedColor) {
    productFilter.product_type = selectedType;
    productFilter.product_size = selectedSize;
    productFilter.product_color = selectedColor;
  } else {
    // If none of type/size/color are selected, allow all
    if (!selectedType && !selectedSize && !selectedColor) {
      // Do nothing, allow all
    } else {
      // If only some are selected, ignore type/size/color filters
      // Do not set _id=null, just skip filtering by these fields
    }
  }
  if (selectedCategory) productFilter.product_category = selectedCategory;
  if (selectedPrice) {
    const [min, max] = selectedPrice.split('-');
    if (min) productFilter.price = { ...productFilter.price, $gte: Number(min) };
    if (max) productFilter.price = { ...productFilter.price, $lte: Number(max) };
  }
  // Remove undefined/null filters to avoid querying for deleted products
  Object.keys(productFilter).forEach(key => {
    if (productFilter[key] === null || productFilter[key] === undefined || productFilter[key] === "") {
      delete productFilter[key];
    }
  });
  const totalResults = await Product.countDocuments(productFilter);
  const products = await Product.find(productFilter)
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize)
    .lean();
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
    { label: '$0 - $50', min: 0, max: 50 },
    { label: '$50 - $100', min: 50, max: 100 },
    { label: '$100 - $150', min: 100, max: 150 },
    { label: '$150+', min: 150, max: null }
  ];
  const totalPages = Math.ceil(totalResults / pageSize);
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
    pageSize
  });
};

module.exports = {
  getProductConfiguration,
  createCategory,
  updateCategory,
  deleteCategory,
  createType,
  createColor,
  createSize,
  updateType,
  updateColor,
  updateSize,
  deleteType,
  deleteColor,
  deleteSize,
  getAddProduct,
  createProduct,
  getProducts,
  getProducts,
  toggleActive,
  productList,
};
