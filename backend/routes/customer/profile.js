const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const profileController = require('../../controllers/customer/profile.controller');
const editProfileController = require('../../controllers/customer/editProfile.controller');
const { isCustomerAccessible } = require('../../middlewares/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../../frontend/public/uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only image files are allowed!'));
  }
});
router.get('/edit', isCustomerAccessible, editProfileController.getEditProfile);
router.post('/edit', isCustomerAccessible, editProfileController.postEditProfile);
router.get('/', isCustomerAccessible, profileController.getProfile);
router.post('/', isCustomerAccessible, profileController.updateProfile);
router.post('/update-image', isCustomerAccessible, upload.single('profileImage'), profileController.updateProfileImage);

module.exports = router;
