import { Request, Response, NextFunction } from 'express';
import * as etapaService from './etapa.service';
import {
  createEtapaSchema,
  updateEtapaSchema,
  associarFuncionarioSchema,
} from './etapa.schema';

export async function listarPorAeronave(req: Request, res: Response, next: NextFunction) {
  try {
    const etapas = await etapaService.listarPorAeronave(Number(req.params.aeronaveId));
    res.json({ status: 'success', data: etapas });
  } catch (err) {
    next(err);
  }
}

export async function buscarPorId(req: Request, res: Response, next: NextFunction) {
  try {
    const etapa = await etapaService.buscarPorId(Number(req.params.id));
    res.json({ status: 'success', data: etapa });
  } catch (err) {
    next(err);
  }
}

export async function criar(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = createEtapaSchema.parse(req.body);
    const etapa = await etapaService.criar(dados);
    res.status(201).json({ status: 'success', data: etapa });
  } catch (err) {
    next(err);
  }
}

export async function atualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = updateEtapaSchema.parse(req.body);
    const etapa = await etapaService.atualizar(Number(req.params.id), dados);
    res.json({ status: 'success', data: etapa });
  } catch (err) {
    next(err);
  }
}

export async function iniciar(req: Request, res: Response, next: NextFunction) {
  try {
    const etapa = await etapaService.iniciarEtapa(Number(req.params.id));
    res.json({ status: 'success', data: etapa });
  } catch (err) {
    next(err);
  }
}

export async function concluir(req: Request, res: Response, next: NextFunction) {
  try {
    const etapa = await etapaService.concluirEtapa(Number(req.params.id));
    res.json({ status: 'success', data: etapa });
  } catch (err) {
    next(err);
  }
}

export async function associarFuncionario(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = associarFuncionarioSchema.parse(req.body);
    const etapa = await etapaService.associarFuncionario(Number(req.params.id), dados);
    res.json({ status: 'success', data: etapa });
  } catch (err) {
    next(err);
  }
}

export async function desassociarFuncionario(req: Request, res: Response, next: NextFunction) {
  try {
    await etapaService.desassociarFuncionario(
      Number(req.params.id),
      Number(req.params.funcionarioId)
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function listarFuncionarios(req: Request, res: Response, next: NextFunction) {
  try {
    const funcionarios = await etapaService.listarFuncionariosDaEtapa(Number(req.params.id));
    res.json({ status: 'success', data: funcionarios });
  } catch (err) {
    next(err);
  }
}

export async function remover(req: Request, res: Response, next: NextFunction) {
  try {
    await etapaService.remover(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
