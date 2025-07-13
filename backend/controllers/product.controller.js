const userModel = require("../models/userModel");
const productCategoryModel = require("../models/productCategoryModel");
const productColorModel = require("../models/productColorModel");
const productSizeModel = require("../models/productSizeModel");
const productTypeModel = require("../models/productTypeModel");


const getProductConfiguration = async (req, res) => {
  const user = await userModel.findOne({ _id: req.session.userId });

  const categories = await productCategoryModel.find({});
  const types = await productTypeModel.find({});
  const sizes = await productSizeModel.find({});
  const colors = await productColorModel.find({});

  res.render("admin/product-configuration", { name: user.firstName , 
    data : {
        category : categories,
        type: types,
        size: sizes,
        color: colors
    }
  });
};


const createCategory = async (req, res) => {
   try {
    const { value } = req.body;

    const isCategoryAlreadyAvailable = await productCategoryModel.findOne({
      category: value
    })

    if(isCategoryAlreadyAvailable) {
      throw new Error("Category already exists");
    }

    const newCategory = new productCategoryModel({ category: value });
    await newCategory.save();

    res.status(201).json({
      message: "Category created",
    });

  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to create category" });
  }
}

const updateCategory = async (req, res) => {
   try {
    const { value } = req.body;
    const { id } = req.params;

    const existingCategory = await productCategoryModel.findById(id);

    if (!existingCategory) {
        throw new Error("Category not found");
    }

    
    const isCategoryAlreadyAvailable = await productCategoryModel.findOne({
      category: value
    })

    if(isCategoryAlreadyAvailable) {
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
    res.status(500).json({ message: error.message || "Failed to update category" });
  }
}

const deleteCategory = async (req, res) => {
   try {
    const { id } = req.params;

    await productCategoryModel.findByIdAndDelete(id);

    res.status(200).json({
      message: "Category deleted",
    });

  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete category" });
  }
}

// CREATE Product Type
const createType = async (req, res) => {
  try {
    const { value } = req.body;

    const isTypeAlreadyAvailable = await productTypeModel.findOne({
      type: value
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
      type: value
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
      size: value
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
      size: value
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
      color: value
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
    res.status(500).json({ message: error.message || "Failed to create color" });
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
      color: value
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
    res.status(500).json({ message: error.message || "Failed to update color" });
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
    res.status(500).json({ message: error.message || "Failed to delete color" });
  }
};


const getAddProduct = async (req, res) => {
    const user = await userModel.findOne({ _id: req.session.userId });

 const categories = await productCategoryModel.find({});
  const types = await productTypeModel.find({});
  const sizes = await productSizeModel.find({});
  const colors = await productColorModel.find({});

  res.render("admin/add-product", { name: user.firstName , 
        categories,
        types,
        sizes,
        colors
  });
}

module.exports = {
  getProductConfiguration,
  createCategory,
  updateCategory,
  deleteCategory,
  createType, createColor, createSize,
  updateType, updateColor, updateSize,
  deleteType, deleteColor, deleteSize,
  getAddProduct
};
