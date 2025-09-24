import { Router } from 'express';
import BranchController from '../../../../controllers/user/branchController.js';
import isUser from '../../../../middlewares/isUser.js';
import upload from '../../../../multer.js';

const router = Router();
router.use(isUser);

router.get('/', BranchController.get);
router.post('/', upload.any(), BranchController.insert);
router.get('/:id', BranchController.info);
router.put('/:id', upload.any(), BranchController.update);
router.patch('/:id', BranchController.status);
router.delete('/:id', BranchController.delete);

export default router;