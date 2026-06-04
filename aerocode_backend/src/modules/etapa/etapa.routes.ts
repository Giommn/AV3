import { Router } from 'express';
import * as controller from './etapa.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { NivelPermissao } from '@prisma/client';

const router = Router();

router.get('/aeronave/:aeronaveId', authenticate, controller.listarPorAeronave);
router.get('/:id', authenticate, controller.buscarPorId);
router.get('/:id/funcionarios', authenticate, controller.listarFuncionarios);

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

// Iniciar e concluir etapa: Engenheiro ou Administrador
router.patch(
  '/:id/iniciar',
  authenticate,
  authorize(NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO),
  controller.iniciar
);

router.patch(
  '/:id/concluir',
  authenticate,
  authorize(NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO),
  controller.concluir
);

// Associação de funcionários: Administrador ou Engenheiro
router.post(
  '/:id/funcionarios',
  authenticate,
  authorize(NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO),
  controller.associarFuncionario
);

router.delete(
  '/:id/funcionarios/:funcionarioId',
  authenticate,
  authorize(NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO),
  controller.desassociarFuncionario
);

router.delete(
  '/:id',
  authenticate,
  authorize(NivelPermissao.ADMINISTRADOR),
  controller.remover
);

export default router;
