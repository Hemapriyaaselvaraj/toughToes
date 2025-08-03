const express = require('express');
const path = require('path');
const userRoutes = require('./backend/routes/user')
const adminRoutes = require('./backend/routes/admin')
const productRoutes = require('./backend/routes/customer/product')
const homeRoutes = require('./backend/routes/customer/home')
const cartRoutes = require('./backend/routes/customer/cart');
const userWishlistRoute = require('./backend/routes/customer/wishlist');
const userProfileRoute = require('./backend/routes/customer/profile');
const addressRoutes = require('./backend/routes/customer/address');
const checkoutRoutes = require('./backend/routes/customer/checkout');
const orderRoutes = require('./backend/routes/customer/order');
const walletRoutes = require('./backend/routes/customer/wallet');

const flash = require('connect-flash');

const connectDB = require('./backend/config/db');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('./backend/config/passport');
const app = express();



app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { secure: false } 
}));

app.use(flash());
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next(); 
});

require('dotenv').config();
connectDB();

app.use(express.static(path.join(__dirname, 'frontend', 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());

app.set('views', path.join(__dirname, 'frontend', 'views'));
app.set('view engine', 'ejs');


app.use('/user',userRoutes)
app.use('/admin',adminRoutes)

app.use('/', homeRoutes)
app.use('/products', productRoutes)
app.use('/cart', cartRoutes);
app.use('/wishlist', userWishlistRoute);
app.use('/profile', userProfileRoute);
app.use('/addresses', addressRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/order', orderRoutes);
app.use('/wallet', walletRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
