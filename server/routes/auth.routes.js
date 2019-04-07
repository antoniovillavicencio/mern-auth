import express from 'express';
import authController from '../controllers/auth.controller';

const router = express.Router();

router.route('/signin')
  .post(authController.signin)

router.route('/signout')
  .get(authController.signout);

export default router;