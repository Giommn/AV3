import { Request, Response, NextFunction } from 'express';
import * as relatorioService from './relatorio.service';
import { createRelatorioSchema } from './relatorio.schema';

export async function gerar(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = createRelatorioSchema.parse(req.body);
    const relatorio = await relatorioService.gerar(dados);
    res.status(201).json({ status: 'success', data: relatorio });
  } catch (err) {
    next(err);
  }
}

export async function buscarPorAeronave(req: Request, res: Response, next: NextFunction) {
  try {
    const relatorio = await relatorioService.buscarPorAeronave(Number(req.params.aeronaveId));
    res.json({ status: 'success', data: relatorio });
  } catch (err) {
    next(err);
  }
}

export async function buscarPorId(req: Request, res: Response, next: NextFunction) {
  try {
    const relatorio = await relatorioService.buscarPorId(Number(req.params.id));
    res.json({ status: 'success', data: relatorio });
  } catch (err) {
    next(err);
  }
}

export async function regenerar(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = createRelatorioSchema.parse(req.body);
    const relatorio = await relatorioService.regenerar(
      dados.aeronaveId,
      dados.nomeCliente,
      dados.dataEntrega
    );
    res.json({ status: 'success', data: relatorio });
  } catch (err) {
    next(err);
  }
}
