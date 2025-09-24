import { Router } from 'express';
import AuthController from '../../../../controllers/user/authController.js';
import isUser from '../../../../middlewares/isUser.js';

const router = Router();

router.post('/signIn', AuthController.signIn);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', isUser, AuthController.resetPassword);

export default router;
