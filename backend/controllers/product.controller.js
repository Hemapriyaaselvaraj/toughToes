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

    const newCategory = new productCategoryModel({ category: value });
    const savedCategory = await newCategory.save();

    res.status(201).json({
      message: "Category created",
    });

  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Failed to create category" });
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

module.exports = {
  getProductConfiguration,
  createCategory,
  updateCategory,
  deleteCategory
};
