const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.get('/me', authController.protect, userController.getMe);

router
  .route('/')
  .get(authController.protect, userController.getAllUsers)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    userController.updateUser
  );

router
  .route('/wallet/:user')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    userController.getWallet
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    userController.updateWallet
  );

module.exports = router;
