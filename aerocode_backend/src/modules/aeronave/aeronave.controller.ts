import { Request, Response, NextFunction } from 'express';
import * as aeronaveService from './aeronave.service';
import { createAeronaveSchema, updateAeronaveSchema } from './aeronave.schema';

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const aeronaves = await aeronaveService.listarTodas();
    res.json({ status: 'success', data: aeronaves });
  } catch (err) {
    next(err);
  }
}

export async function buscarPorId(req: Request, res: Response, next: NextFunction) {
  try {
    const aeronave = await aeronaveService.buscarPorId(Number(req.params.id));
    res.json({ status: 'success', data: aeronave });
  } catch (err) {
    next(err);
  }
}

export async function criar(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = createAeronaveSchema.parse(req.body);
    const aeronave = await aeronaveService.criar(dados);
    res.status(201).json({ status: 'success', data: aeronave });
  } catch (err) {
    next(err);
  }
}

export async function atualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = updateAeronaveSchema.parse(req.body);
    const aeronave = await aeronaveService.atualizar(Number(req.params.id), dados);
    res.json({ status: 'success', data: aeronave });
  } catch (err) {
    next(err);
  }
}

export async function remover(req: Request, res: Response, next: NextFunction) {
  try {
    await aeronaveService.remover(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function detalhes(req: Request, res: Response, next: NextFunction) {
  try {
    const detalhes = await aeronaveService.obterDetalhesCompletos(Number(req.params.id));
    res.json({ status: 'success', data: detalhes });
  } catch (err) {
    next(err);
  }
}
