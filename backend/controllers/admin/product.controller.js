const userModel = require("../../models/userModel");
const productCategoryModel = require("../../models/productCategoryModel");
const productColorModel = require("../../models/productColorModel");
const productSizeModel = require("../../models/productSizeModel");
const productTypeModel = require("../../models/productTypeModel");
const Product = require("../../models/productModel");
const ProductVariation = require("../../models/productVariationModel");

const getProductConfiguration = async (req, res) => {
  const user = await userModel.findOne({ _id: req.session.userId });

  const categories = await productCategoryModel.find({}).sort({ category: 1 });
  const types = await productTypeModel.find({}).sort({ type: 1 });
  const sizes = await productSizeModel.find({}).sort({ size: 1 });
  const colors = await productColorModel.find({}).sort({ color: 1 });

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
      category: { $regex: `^${value}$`, $options: 'i' }
    });
    
    if (isCategoryAlreadyAvailable) {
      throw new Error("Category already exists");
    } 
      
    const newCategory = new productCategoryModel({ category: value.toUpperCase() });
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
      category: { $regex: `^${value}$`, $options: 'i' }
    });

    if (isCategoryAlreadyAvailable) {
      throw new Error("Category already exists");
    }

    var myquery = { _id: id };
    var newvalues = {
      $set: { category: value.toUpperCase() },
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

const createType = async (req, res) => {
  try {
    const { value } = req.body;

    const isTypeAlreadyAvailable = await productTypeModel.findOne({
      type: { $regex: `^${value}$`, $options: 'i' }
    });

    if (isTypeAlreadyAvailable) {
      throw new Error("Type already exists");
    }

    const newType = new productTypeModel({ type: value.toUpperCase() });
    await newType.save();

    res.status(201).json({
      message: "Type created",
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to create type" });
  }
};

const updateType = async (req, res) => {
  try {
    const { value } = req.body;
    const { id } = req.params;

    const existingType = await productTypeModel.findById(id);

    if (!existingType) {
      throw new Error("Type not found");
    }

    const isTypeAlreadyAvailable = await productTypeModel.findOne({
      type: { $regex: `^${value}$`, $options: 'i' }
    });


    if (isTypeAlreadyAvailable) {
      throw new Error("Type already exists");
    }

    const myquery = { _id: id };
    const newvalues = {
      $set: { type: value.toUpperCase() },
    };

    await productTypeModel.updateOne(myquery, newvalues);

    res.status(200).json({
      message: "Type updated",
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update type" });
  }
};

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

const createSize = async (req, res) => {
  try {
    const { value } = req.body;

    const isSizeAlreadyAvailable = await productSizeModel.findOne({
      size: { $regex: `^${value}$`, $options: 'i' }
    });


    if (isSizeAlreadyAvailable) {
      throw new Error("Size already exists");
    }

    const newSize = new productSizeModel({ size: value.toUpperCase() });
    await newSize.save();

    res.status(201).json({
      message: "Size created",
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to create size" });
  }
};

const updateSize = async (req, res) => {
  try {
    const { value } = req.body;
    const { id } = req.params;

    const existingSize = await productSizeModel.findById(id);

    if (!existingSize) {
      throw new Error("Size not found");
    }

    const isSizeAlreadyAvailable = await productSizeModel.findOne({
      size: { $regex: `^${value}$`, $options: 'i' }
    });


    if (isSizeAlreadyAvailable) {
      throw new Error("Size already exists");
    }

    const myquery = { _id: id };
    const newvalues = {
      $set: { size: value.toUpperCase() },
    };

    await productSizeModel.updateOne(myquery, newvalues);

    res.status(200).json({
      message: "Size updated",
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update size" });
  }
};

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

const createColor = async (req, res) => {
  try {
    const { value } = req.body;

    const isColorAlreadyAvailable =  await productColorModel.findOne({
      color: { $regex: `^${value}$`, $options: 'i' }
    });


    if (isColorAlreadyAvailable) {
      throw new Error("Color already exists");
    }

    const newColor = new productColorModel({ color: value.toUpperCase() });
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

const updateColor = async (req, res) => {
  try {
    const { value } = req.body;
    const { id } = req.params;

    const existingColor = await productColorModel.findById(id);

    if (!existingColor) {
      throw new Error("Color not found");
    }

    const isColorAlreadyAvailable = await productColorModel.findOne({
      color: { $regex: `^${value}$`, $options: 'i' }
    });

    if (isColorAlreadyAvailable) {
      throw new Error("Color already exists");
    }

    const myquery = { _id: id };
    const newvalues = {
      $set: { color: value.toUpperCase() },
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

    // Process each variation
    for (let i = 0; i < variations.length; i++) {
      const variation = variations[i];
      
      // Get the cropped image for this variation
      const images = files.filter(file => file.fieldname === `variationImages_${i}`) || [];
      
      // These images are already cropped to squares by the frontend
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

    const {
      category = 'all',
      type = 'all',
      sort = 'latest',
      search = '',
      page = 1
    } = req.query;

    const pageSize = 5;
    const currentPage = parseInt(page) || 1;
    const filter = {};

    if (category !== 'all') filter.product_category = category;
    if (type !== 'all') filter.product_type = type;
    if (search) filter.name = { $regex: search, $options: 'i' };

    let sortObj = { created_at: -1, _id: -1 };
    if (sort === 'nameAsc') sortObj = { name: 1, created_at: -1, _id: -1 };
    else if (sort === 'nameDesc') sortObj = { name: -1, created_at: -1, _id: -1 };

    const totalResults = await Product.countDocuments(filter);


    const skipCount = (currentPage - 1) * pageSize;
    const products = await Product.find(filter)
      .sort(sortObj)
      .skip(skipCount)
      .limit(pageSize)
      .lean();
    

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

const getEditProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId).lean();
    if (!product) return res.status(404).send('Product not found');

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

const postEditProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).send('Product not found');

    product.name = req.body.name;
    product.price = req.body.price;
    product.discount_percentage = req.body.discount;
    product.description = req.body.description;
    product.product_category = req.body.category;
    product.product_type = req.body.type;
    const savedProduct = await product.save();

    const variations = req.body.variations || {};
    const files = req.files || {};

    const existingVariations = await ProductVariation.find({ product_id: productId });

    function findExistingVar(size, color) {
      return existingVariations.find(v => v.product_size === size && v.product_color === color);
    }

    const submittedKeys = new Set();
    const variationEntries = [];

    for (let i = 0; i < variations.length; i++) {
      const variation = variations[i];
      const images = files.filter(file => file.fieldname === `variationImages_${i}`) || [];
      const imageUrls = images.map((file) => file.path);

      const key = `${variation.size}__${variation.color}`;
      submittedKeys.add(key);

      let existing = findExistingVar(variation.size, variation.color);

      if (existing) {
        const updateVariation = await ProductVariation.findById(existing._id);
        updateVariation.stock_quantity = variation.stock;
        if (imageUrls.length > 0) {
          updateVariation.images = [...imageUrls, ...(updateVariation.images || [])];
        }
        updateVariation.updated_at = new Date();
        variationEntries.push(updateVariation.save());
      } else {
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
    }

    const deleteOps = [];
    for (const v of existingVariations) {
      const key = `${v.product_size}__${v.product_color}`;
      if (!submittedKeys.has(key)) {
        deleteOps.push(ProductVariation.deleteOne({ _id: v._id }));
      }
    }

    await Promise.all([...variationEntries, ...deleteOps]);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error updating product:", err);
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
