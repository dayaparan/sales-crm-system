import { Router } from 'express';
import ProfileController from '../../../../controllers/user/profileController.js';
import isUser from '../../../../middlewares/isUser.js';
import upload from '../../../../multer.js';

const router = Router();

router.get('/', isUser, ProfileController.get);
router.post('/', isUser, upload.any(), ProfileController.update);
router.post('/change-password', isUser, ProfileController.changePassword);

export default router;
