import { Router } from 'express';
import SalesModelController from '../../../../controllers/user/salesModelController.js';
import isUser from '../../../../middlewares/isUser.js';
import upload from '../../../../multer.js';

const router = Router();
router.use(isUser);

router.get('/', SalesModelController.get);
router.post('/', upload.any(), SalesModelController.insert);
router.get('/:id', SalesModelController.info);
router.put('/:id', upload.any(), SalesModelController.update);
router.patch('/:id', SalesModelController.status);
router.delete('/:id', SalesModelController.delete);

export default router;