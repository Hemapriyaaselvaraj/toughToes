const cartModel = require("../backend/models/cartModel");
const productModel = require("../backend/models/productModel");
const productVariationModel = require("../backend/models/productVariationModel");
const wishlistModel = require("../backend/models/wishlistModel");



exports.addToWishlist = async(req,res) => {

    const { productVariationId } = req.body;
    const item = await productVariationModel.findById(productVariationId);

    if(!item){
        return res.send("item not listed here")
    }

    const exists = await wishlistModel.findOne({variation_id : productVariationId  , user_id : req.session.userId})
    if(exists){
        return res.send("item already in wishlist")
    }

        const product = await productModel.findById(item.product_id);


   if(product.is_active === false) {
    return res.send("product not available")
   }

      const newItem = new wishlistModel({
       user_id : req.session.userId,
       product_id : item.product_id,
       variation_id : item.variation_id,
       selected_size : item.product_size,
       selected_color : item.product_color,
   })
 await newItem.save();

return res.send("product added successfully")

}


// variation , quantity from req.body
// check the variant from db and
// check the user for that cart
// if !variation - not available
// if stock < 0 , out of stock
// quantity not below 1 , not exceeds 5
// if already available in cart, increase the quantity alone, that also shoukd not exceeds 5

exports.addToCart = async(req,res) => {

    const {variation_id , quantity} = req.body;
    const variation = await productVariationModel.findById(variation_id);

    if(!variation){
        return res.send("variation not avilable")
    }

    if(variation.stock_quantity<0){
        return res.send("out of stock");
    }

    if(quantity<1){
        return res.send("place atleast one item")
    }

    if(quantity>5){
        return res.send("you are exceeding the limit")
    } 

    const cartItem = await cartModel.findOne({product_variation_id: variation_id , user_id : req.session.userId})


    if(cartItem.quantity==5){
        return res.send("limit reached")
    }

    if(cartItem){
        cartItem.quantity+=quantity;
        await cartItem.save();
    }else {
     const newItem = new cartModel({
        user_id : req.session.id,
        product_variation_id: variation_id,
        quantity : quantity
    })

    await newItem.save();
    }

    return res.send("item added to cart")
}

 //get wishlist
 //params -id
 //name
 //category
 //price

 exports.getWishlist = async(req,res) => {

    const {user} = req.session.user;

    const wishlistItems = await wishlistModel.find({user_id:user}).populate('product_id').populate('variation_id');

    const show = wishlistItems.map(item => ({
      name : item.product_id.name,
      category : item.product_id.category,
      price : item.product_id.price,
      image : item.variation_id.images[0],
      size : item.variation_id.product_size,
     color : item.variation_id.product_color,
        _id : item.id
     
    }))

    res.render('user/wishlist', {show})
 }


//  exports.getCart = async(res,req) => {

//     const {userId} = req.session.userId;
//     const items =  await cartModel.find({user_id:userId}).populate('product_variation_id').

//     const cartItems = 
//  }