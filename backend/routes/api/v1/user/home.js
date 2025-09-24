import { Router } from 'express';
import HomeController from '../../../../controllers/user/homeController.js';
import isUser from '../../../../middlewares/isUser.js';

const router = Router();
router.use(isUser);

router.get('/', HomeController.get);

export default router;