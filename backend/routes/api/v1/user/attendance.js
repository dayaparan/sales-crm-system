import { Router } from 'express';
import AttendanceController from '../../../../controllers/user/attendanceController.js';
import isUser from '../../../../middlewares/isUser.js';
import upload from '../../../../multer.js';

const router = Router();
router.use(isUser);

router.get('/', AttendanceController.get);
router.post('/', upload.any(), AttendanceController.insert);
// router.get('/:id', AttendanceController.info);
// router.put('/:id', upload.any(), AttendanceController.update);
// router.patch('/:id', AttendanceController.status);
// router.delete('/:id', AttendanceController.delete);

export default router;