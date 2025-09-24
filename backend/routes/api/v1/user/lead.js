import { Router } from 'express';
import LeadController from '../../../../controllers/user/leadController.js';
import isUser from '../../../../middlewares/isUser.js';
import upload from '../../../../multer.js';

const router = Router();
router.use(isUser);

router.get('/', LeadController.get);
router.post('/', upload.any(), LeadController.insert);
router.get('/:id', LeadController.info);
router.put('/:id', upload.any(), LeadController.update);
router.patch('/:id', LeadController.status);
router.patch('/:id/priority', LeadController.priority);
router.delete('/:id', LeadController.delete);
router.post('/csv', upload.single('file'), LeadController.csv);

router.post('/:id/closing', upload.any(), LeadController.closing);
router.post('/:id/feedBack', LeadController.feedBack);
router.post('/inquiry', LeadController.inquiry);
router.post('/:id/timeLine', LeadController.timeLineInsert);

export default router;