import { Router } from 'express';
import Controller from '../../../../controllers/common/controller.js';
import isUser from '../../../../middlewares/isUser.js';

const router = Router();

router.get('/', isUser, Controller.get);

export default router;
