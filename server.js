const express = require('express');
const path = require('path');
const userRoutes = require('./backend/routes/user')
const adminRoutes = require('./backend/routes/admin')
const homeRoutes = require('./backend/routes/home')
const productRoutes = require('./backend/routes/product')

const connectDB = require('./backend/config/db');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('./backend/config/passport');

const app = express();
require('dotenv').config();
connectDB();

app.use(express.static(path.join(__dirname, 'frontend', 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

app.use(passport.initialize());
app.use(passport.session());

app.set('views', path.join(__dirname, 'frontend', 'views'));
app.set('view engine', 'ejs');


app.use('/user',userRoutes)
app.use('/admin',adminRoutes)
app.use('/', homeRoutes)
app.use('/products', productRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
