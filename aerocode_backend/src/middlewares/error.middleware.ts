import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Erros operacionais conhecidos
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Erros de validação Zod
  if (err instanceof ZodError) {
    res.status(422).json({
      status: 'error',
      message: 'Dados inválidos.',
      errors: err.errors.map((e) => ({
        campo: e.path.join('.'),
        mensagem: e.message,
      })),
    });
    return;
  }

  // Violação de unique constraint (Prisma)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const fields = (err.meta?.target as string[])?.join(', ') ?? 'campo';
      res.status(409).json({
        status: 'error',
        message: `Já existe um registro com esse valor no campo: ${fields}.`,
      });
      return;
    }

    if (err.code === 'P2025') {
      res.status(404).json({
        status: 'error',
        message: 'Registro não encontrado.',
      });
      return;
    }
  }

  // Erro genérico (não expõe detalhes em produção)
  console.error('Erro não tratado:', err);

  res.status(500).json({
    status: 'error',
    message:
      process.env.NODE_ENV === 'production'
        ? 'Erro interno do servidor.'
        : String(err),
  });
}
