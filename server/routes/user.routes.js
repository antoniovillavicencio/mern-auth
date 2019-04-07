import express from 'express';
import userController from '../controllers/user.controller';
import authController from '../controllers/auth.controller';

const router = express.Router();

router.route('/')
  .get(userController.list)
  .post(userController.create);

router.route('/:userId')
  .get(authController.requireSignin, userController.read)
  .put(authController.requireSignin, authController.hasAuthorization, userController.update)
  .delete(authController.requireSignin, authController.hasAuthorization, userController.remove);

router.param('userId', userController.userById);

export default router;