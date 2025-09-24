import { Router } from 'express';
import TerritoryController from '../../../../controllers/user/territoryController.js';
import isUser from '../../../../middlewares/isUser.js';
import upload from '../../../../multer.js';

const router = Router();
router.use(isUser);

router.get('/', TerritoryController.get);
router.post('/', upload.any(), TerritoryController.insert);
router.get('/:id', TerritoryController.info);
router.put('/:id', upload.any(), TerritoryController.update);
router.patch('/:id', TerritoryController.status);
router.delete('/:id', TerritoryController.delete);

export default router;