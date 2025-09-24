import { Router } from 'express';

import commonRouter from './common/index.js';
import userRouter from './user/index.js';

// import ApiLogsMiddleware from '../../../middlewares/apiLogs.js';

const router = Router();

router.use('/common', commonRouter);
router.use('/user', userRouter);

export default router;
