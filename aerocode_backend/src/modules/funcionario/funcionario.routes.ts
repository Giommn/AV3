import { Router } from 'express';
import * as controller from './funcionario.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { NivelPermissao } from '@prisma/client';

const router = Router();

// Rota pública: login
router.post('/login', controller.login);

// Rotas autenticadas
router.get('/me', authenticate, controller.perfil);

router.get('/', authenticate, authorize(NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO), controller.listar);
router.get('/:id', authenticate, controller.buscarPorId);

// Criar funcionário: apenas Administrador
router.post(
  '/',
  authenticate,
  authorize(NivelPermissao.ADMINISTRADOR),
  controller.criar
);

// Atualizar: próprio funcionário ou Administrador
router.patch('/:id', authenticate, controller.atualizar);

// Alterar senha: próprio funcionário
router.patch('/:id/senha', authenticate, controller.alterarSenha);

// Desativar: apenas Administrador
router.delete(
  '/:id',
  authenticate,
  authorize(NivelPermissao.ADMINISTRADOR),
  controller.remover
);

export default router;
