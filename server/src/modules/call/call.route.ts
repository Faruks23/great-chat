import { Router } from 'express';
import { getCalls } from './call.controller';

const router = Router();

router.get('/', getCalls);

export default router;
