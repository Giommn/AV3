import { Request, Response, NextFunction } from 'express';
import * as funcionarioService from './funcionario.service';
import {
  createFuncionarioSchema,
  updateFuncionarioSchema,
  changePasswordSchema,
  loginSchema,
} from './funcionario.schema';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = loginSchema.parse(req.body);
    const resultado = await funcionarioService.login(dados);
    res.json({ status: 'success', data: resultado });
  } catch (err) {
    next(err);
  }
}

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const funcionarios = await funcionarioService.listarTodos();
    res.json({ status: 'success', data: funcionarios });
  } catch (err) {
    next(err);
  }
}

export async function buscarPorId(req: Request, res: Response, next: NextFunction) {
  try {
    const funcionario = await funcionarioService.buscarPorId(Number(req.params.id));
    res.json({ status: 'success', data: funcionario });
  } catch (err) {
    next(err);
  }
}

export async function criar(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = createFuncionarioSchema.parse(req.body);
    const funcionario = await funcionarioService.criar(
      dados,
      req.funcionario!.nivelPermissao
    );
    res.status(201).json({ status: 'success', data: funcionario });
  } catch (err) {
    next(err);
  }
}

export async function atualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = updateFuncionarioSchema.parse(req.body);
    const funcionario = await funcionarioService.atualizar(
      Number(req.params.id),
      dados,
      req.funcionario!.nivelPermissao,
      req.funcionario!.funcionarioId
    );
    res.json({ status: 'success', data: funcionario });
  } catch (err) {
    next(err);
  }
}

export async function alterarSenha(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = changePasswordSchema.parse(req.body);
    await funcionarioService.alterarSenha(
      Number(req.params.id),
      dados,
      req.funcionario!.funcionarioId
    );
    res.json({ status: 'success', message: 'Senha alterada com sucesso.' });
  } catch (err) {
    next(err);
  }
}

export async function remover(req: Request, res: Response, next: NextFunction) {
  try {
    await funcionarioService.remover(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function perfil(req: Request, res: Response, next: NextFunction) {
  try {
    const funcionario = await funcionarioService.buscarPorId(req.funcionario!.funcionarioId);
    res.json({ status: 'success', data: funcionario });
  } catch (err) {
    next(err);
  }
}
