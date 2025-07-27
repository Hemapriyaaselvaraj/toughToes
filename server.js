const express = require('express');
const path = require('path');
const userRoutes = require('./backend/routes/user')
const adminRoutes = require('./backend/routes/admin')
const customerRoutes = require('./backend/routes/customer')
const flash = require('connect-flash');

const connectDB = require('./backend/config/db');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('./backend/config/passport');
const app = express();


// Session middleware setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { secure: false } // set to true if using https
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
app.use('/', customerRoutes)

const cartRoutes = require('./backend/routes/cart');
app.use('/cart', cartRoutes);

const userWishlistRoute = require('./backend/routes/user/wishlist');
app.use('/wishlist', userWishlistRoute);

const userProfileRoute = require('./backend/routes/user/profile');
app.use('/profile', userProfileRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
