import { Request, Response, NextFunction } from 'express';
import * as pecaService from './peca.service';
import { createPecaSchema, updatePecaSchema, updateStatusPecaSchema } from './peca.schema';

export async function listarPorAeronave(req: Request, res: Response, next: NextFunction) {
  try {
    const pecas = await pecaService.listarPorAeronave(Number(req.params.aeronaveId));
    res.json({ status: 'success', data: pecas });
  } catch (err) {
    next(err);
  }
}

export async function buscarPorId(req: Request, res: Response, next: NextFunction) {
  try {
    const peca = await pecaService.buscarPorId(Number(req.params.id));
    res.json({ status: 'success', data: peca });
  } catch (err) {
    next(err);
  }
}

export async function criar(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = createPecaSchema.parse(req.body);
    const peca = await pecaService.criar(dados);
    res.status(201).json({ status: 'success', data: peca });
  } catch (err) {
    next(err);
  }
}

export async function atualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = updatePecaSchema.parse(req.body);
    const peca = await pecaService.atualizar(Number(req.params.id), dados);
    res.json({ status: 'success', data: peca });
  } catch (err) {
    next(err);
  }
}

export async function atualizarStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = updateStatusPecaSchema.parse(req.body);
    const peca = await pecaService.atualizarStatus(Number(req.params.id), dados);
    res.json({ status: 'success', data: peca });
  } catch (err) {
    next(err);
  }
}

export async function remover(req: Request, res: Response, next: NextFunction) {
  try {
    await pecaService.remover(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
