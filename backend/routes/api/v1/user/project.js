import { Router } from 'express';
import ProjectController from '../../../../controllers/user/projectController.js';
import isUser from '../../../../middlewares/isUser.js';
import upload from '../../../../multer.js';

const router = Router();
router.use(isUser);

router.get('/', ProjectController.get);
router.post('/', upload.any(), ProjectController.insert);
router.get('/:id', ProjectController.info);
router.put('/:id', upload.any(), ProjectController.update);
router.patch('/:id', ProjectController.status);
router.delete('/:id', ProjectController.delete);

export default router;