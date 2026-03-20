import { Router } from 'express';
import RemoteControlController from '../../../../controllers/user/remoteControlController.js';
import isUser from '../../../../middlewares/isUser.js';

const router = Router();
router.use(isUser);

router.get('/online-users', RemoteControlController.getOnlineUsers);
router.get('/history', RemoteControlController.getCommandHistory);
router.post('/force-logout/:id', RemoteControlController.forceLogout);
router.post('/lock-account/:id', RemoteControlController.lockAccount);
router.post('/unlock-account/:id', RemoteControlController.unlockAccount);
router.post('/request-location/:id', RemoteControlController.requestLocation);
router.post('/push-config/:id', RemoteControlController.pushConfig);

export default router;
