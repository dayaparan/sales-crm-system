import { Router } from 'express';
import PaymentPlanController from '../../../../controllers/user/paymentPlanController.js';
import isUser from '../../../../middlewares/isUser.js';
import upload from '../../../../multer.js';

const router = Router();
router.use(isUser);

router.get('/', PaymentPlanController.get);
router.post('/', upload.any(), PaymentPlanController.insert);
router.get('/:id', PaymentPlanController.info);
router.put('/:id', upload.any(), PaymentPlanController.update);
router.patch('/:id', PaymentPlanController.status);
router.delete('/:id', PaymentPlanController.delete);

export default router;