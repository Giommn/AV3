import { Router } from 'express';
import * as controller from './relatorio.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { NivelPermissao } from '@prisma/client';

const router = Router();

router.get('/:id', authenticate, controller.buscarPorId);
router.get('/aeronave/:aeronaveId', authenticate, controller.buscarPorAeronave);

// Gerar relatório: Engenheiro ou Administrador
router.post(
  '/',
  authenticate,
  authorize(NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO),
  controller.gerar
);

// Regenerar relatório: apenas Administrador
router.put(
  '/regenerar',
  authenticate,
  authorize(NivelPermissao.ADMINISTRADOR),
  controller.regenerar
);

export default router;
