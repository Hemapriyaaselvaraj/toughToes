const userModel = require("../../models/userModel");
const Address = require("../../models/addressModel");
const Cart = require("../../models/cartModel");


const checkout = async (req, res) => {
  const userId = req.session.userId;
  const user = await userModel.findById(userId);
  const addresses = await Address.find({ user_id: userId });
  const cartItems = await Cart.find({ user_id: userId }).populate({
    path: "product_variation_id",
    populate: { path: "product_id", model: "product" },
  });
  const displayName = user ? user.firstName + " " + user.lastName : "";

  const products = cartItems.map((item) => {
    let priceBefore = item.product_variation_id.product_id.price;
    let priceAfter = priceBefore;
    let discount =
      item.product_variation_id.product_id.discount_percentage || 0;
    if (discount > 0) {
      priceAfter = priceBefore * (1 - discount / 100);
    }

    return {
      name: item.product_variation_id.product_id.name,
      image: item.product_variation_id.images,
      price: item.product_variation_id.product_id.price,
      quantity: item.quantity,
      priceBefore,
      priceAfter,
      discount,
      isActive: item.product_variation_id.product_id.is_active,
      stock: item.product_variation_id.stock_quantity
    };
  });

  const filteredItems = products.filter(
    (item) => item.isActive && item.stock > 0
  );

  const subtotal = filteredItems.reduce(
    (sum, p) => sum + p.priceAfter * p.quantity,
    0
  );
  const tax = Math.round((subtotal * 8) / 100); 
  const shipping = subtotal > 1000 ? 0 : 50;
  const total = subtotal + tax + shipping;

  res.render("user/checkout", {
    name: displayName,
    addresses,
    products: filteredItems,
    subtotal,
    tax,
    shipping,
    total,
  });
};


module.exports = {
  checkout,
};
