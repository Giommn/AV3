import { Request, Response, NextFunction } from 'express';
import * as testeService from './teste.service';
import { createTesteSchema, updateTesteSchema } from './teste.schema';

export async function listarPorAeronave(req: Request, res: Response, next: NextFunction) {
  try {
    const testes = await testeService.listarPorAeronave(Number(req.params.aeronaveId));
    res.json({ status: 'success', data: testes });
  } catch (err) {
    next(err);
  }
}

export async function buscarPorId(req: Request, res: Response, next: NextFunction) {
  try {
    const teste = await testeService.buscarPorId(Number(req.params.id));
    res.json({ status: 'success', data: teste });
  } catch (err) {
    next(err);
  }
}

export async function criar(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = createTesteSchema.parse(req.body);
    const teste = await testeService.criar(dados);
    res.status(201).json({ status: 'success', data: teste });
  } catch (err) {
    next(err);
  }
}

export async function atualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = updateTesteSchema.parse(req.body);
    const teste = await testeService.atualizar(Number(req.params.id), dados);
    res.json({ status: 'success', data: teste });
  } catch (err) {
    next(err);
  }
}

export async function remover(req: Request, res: Response, next: NextFunction) {
  try {
    await testeService.remover(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
