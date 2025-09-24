import { Router } from 'express';
import unitTypeController from '../../../../controllers/user/unitTypeController.js';
import isUser from '../../../../middlewares/isUser.js';
import upload from '../../../../multer.js';

const router = Router();
router.use(isUser);

router.get('/', unitTypeController.get);
router.post('/', upload.any(), unitTypeController.insert);
router.get('/:id', unitTypeController.info);
router.put('/:id', upload.any(), unitTypeController.update);
router.patch('/:id', unitTypeController.status);
router.delete('/:id', unitTypeController.delete);

export default router;