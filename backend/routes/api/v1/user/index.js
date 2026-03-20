import { Router } from 'express';
import authRouter from './auth.js';
import profileRouter from './profile.js';
import homeRouter from './home.js';
import accountRouter from './account.js';
import roleRouter from './role.js';
import branchRouter from './branch.js';
import territoryRouter from './territory.js';
import projectRouter from './project.js';
import unitTypeRouter from './unitType.js';
import salesModelRouter from './salesModel.js';
import paymentPlanRouter from './paymentPlan.js';
import leadRouter from './lead.js';
import attendanceRouter from './attendance.js';
import remoteControlRouter from './remoteControl.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/profile', profileRouter);
router.use('/home', homeRouter);
router.use('/account', accountRouter);
router.use('/role', roleRouter);
router.use('/branch', branchRouter);
router.use('/territory', territoryRouter);
router.use('/project', projectRouter);
router.use('/unitType', unitTypeRouter);
router.use('/salesModel', salesModelRouter);
router.use('/paymentPlan', paymentPlanRouter);
router.use('/lead', leadRouter);
router.use('/attendance', attendanceRouter);
router.use('/remote-control', remoteControlRouter);

export default router;
