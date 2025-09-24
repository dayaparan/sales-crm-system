import { Router } from 'express';
import RoleController from '../../../../controllers/user/roleController.js';
import isUser from '../../../../middlewares/isUser.js';
import upload from '../../../../multer.js';

const router = Router();
router.use(isUser);

router.get('/', RoleController.get);
router.post('/', upload.any(), RoleController.insert);
router.get('/:id', RoleController.info);
router.put('/:id', upload.any(), RoleController.update);
router.patch('/:id', RoleController.status);
router.delete('/:id', RoleController.delete);

export default router;