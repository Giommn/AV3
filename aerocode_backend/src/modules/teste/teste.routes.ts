import { Router } from 'express';
import * as controller from './teste.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { NivelPermissao } from '@prisma/client';

const router = Router();

router.get('/aeronave/:aeronaveId', authenticate, controller.listarPorAeronave);
router.get('/:id', authenticate, controller.buscarPorId);

router.post(
  '/',
  authenticate,
  authorize(NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO),
  controller.criar
);

router.patch(
  '/:id',
  authenticate,
  authorize(NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO),
  controller.atualizar
);

router.delete(
  '/:id',
  authenticate,
  authorize(NivelPermissao.ADMINISTRADOR),
  controller.remover
);

export default router;
