const userModel = require("../../models/userModel");
const productCategoryModel = require("../../models/productCategoryModel");
const productColorModel = require("../../models/productColorModel");
const productSizeModel = require("../../models/productSizeModel");
const productTypeModel = require("../../models/productTypeModel");
const Product = require("../../models/productModel");
const ProductVariation = require("../../models/productVariationModel");
const cloudinary = require("../../config/cloudinary");
const productVariationModel = require("../../models/productVariationModel");

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
    mode: 'add',
    product: {}
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

    let sortObj = { createdAt: -1 };
    if (sort === 'nameAsc') sortObj = { name: 1, createdAt: -1 };
    else if (sort === 'nameDesc') sortObj = { name: -1, createdAt: -1 };

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

// GET: Render edit product page
const getEditProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId).lean();
    if (!product) return res.status(404).send('Product not found');

    // Fetch variations for this product
    const variations = await ProductVariation.find({ product_id: productId }).lean();
    product.variations = variations.map(v => ({
      size: v.product_size,
      color: v.product_color,
      stock: v.stock_quantity,
      images: v.images,
    }));

    const categories = await productCategoryModel.find({}).lean();
    const types = await productTypeModel.find({}).lean();
    const sizes = await productSizeModel.find({}).lean();
    const colors = await productColorModel.find({}).lean();

    res.render('admin/add-product', {
      name: req.user?.firstName || '',
      product,
      categories,
      types,
      sizes,
      colors,
      mode: 'edit'
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// POST: Update product
const postEditProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).send('Product not found');

    // Update main fields
    product.name = req.body.name;
    product.price = req.body.price;
    product.discount_percentage = req.body.discount;
    product.description = req.body.description;
    product.product_category = req.body.category;
    product.product_type = req.body.type;
    await product.save();

    // Update or add variations
    const variations = req.body.variations || {};
    const files = req.files || {};
    const variationOps = [];

    // Get all existing variations for this product
    const existingVariations = await ProductVariation.find({ product_id: productId });

    // Helper to find a matching variation (by size and color)
    function findExistingVar(size, color) {
      return existingVariations.find(v => v.product_size === size && v.product_color === color);
    }

    const variationEntries = [];

     for (let i = 0; i < variations.length; i++) {
      const variation = variations[i];
      const images = files.filter(file => file.fieldname === `variationImages_${i}`) || [];
      const imageUrls = images.map((file) => file.path);

       let existing = findExistingVar(variation.size, variation.color);

      const newVariation = new ProductVariation({
        product_id: savedProduct._id,
        product_size: variation.size,
        product_color: variation.color,
        stock_quantity: variation.stock,
        images: imageUrls.length > 0 && existing?.images ? [...imageUrls, ...existing.images] : imageUrls.length > 0 ? imageUrls : existing?.images || [],
        created_at: new Date(),
        updated_at: new Date(),
      });

      variationEntries.push(newVariation.save());
    }

  
    await Promise.all(variationOps);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
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
  getEditProduct,
  postEditProduct,
};
