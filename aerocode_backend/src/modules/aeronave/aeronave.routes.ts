import { Router } from 'express';
import * as controller from './aeronave.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { NivelPermissao } from '@prisma/client';

const router = Router();

// Todos os funcionários autenticados podem listar e visualizar aeronaves
router.get('/', authenticate, controller.listar);
router.get('/:id', authenticate, controller.buscarPorId);
router.get('/:id/detalhes', authenticate, controller.detalhes);

// Criação e atualização: apenas Administrador e Engenheiro
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

// Remoção: apenas Administrador
router.delete(
  '/:id',
  authenticate,
  authorize(NivelPermissao.ADMINISTRADOR),
  controller.remover
);

export default router;
