import { Router } from 'express';
import * as controller from './peca.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { NivelPermissao } from '@prisma/client';

const router = Router();

// Listagem por aeronave
router.get('/aeronave/:aeronaveId', authenticate, controller.listarPorAeronave);
router.get('/:id', authenticate, controller.buscarPorId);

// Criação: Administrador ou Engenheiro
router.post(
  '/',
  authenticate,
  authorize(NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO),
  controller.criar
);

// Atualização completa: Administrador ou Engenheiro
router.patch(
  '/:id',
  authenticate,
  authorize(NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO),
  controller.atualizar
);

// Atualização de status: qualquer funcionário autenticado (operadores podem atualizar status de peças)
router.patch('/:id/status', authenticate, controller.atualizarStatus);

// Remoção: apenas Administrador
router.delete(
  '/:id',
  authenticate,
  authorize(NivelPermissao.ADMINISTRADOR),
  controller.remover
);

export default router;
