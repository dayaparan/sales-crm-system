import { Router } from 'express';
import AccountController from '../../../../controllers/user/accountController.js';
import isUser from '../../../../middlewares/isUser.js';
import upload from '../../../../multer.js';

const router = Router();
router.use(isUser);

router.get('/', AccountController.get);
router.post('/', upload.any(), AccountController.insert);
router.get('/:id', AccountController.info);
router.put('/:id', upload.any(), AccountController.update);
router.patch('/:id', AccountController.status);
router.delete('/:id', AccountController.delete);

export default router;