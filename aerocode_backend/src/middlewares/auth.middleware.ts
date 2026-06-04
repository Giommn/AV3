import { Request, Response, NextFunction } from 'express';
import { NivelPermissao } from '@prisma/client';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

// Estende o tipo Request do Express para incluir o funcionário autenticado
declare global {
  namespace Express {
    interface Request {
      funcionario?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Token de autenticação não fornecido.'));
  }

  const token = authHeader.split(' ')[1];

  try {
    req.funcionario = verifyToken(token);
    next();
  } catch {
    next(new UnauthorizedError('Token inválido ou expirado.'));
  }
}

/**
 * Middleware de autorização por nível de permissão.
 * A hierarquia é: ADMINISTRADOR > ENGENHEIRO > OPERADOR
 */
export function authorize(...niveis: NivelPermissao[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.funcionario) {
      return next(new UnauthorizedError());
    }

    if (!niveis.includes(req.funcionario.nivelPermissao)) {
      return next(new ForbiddenError(
        `Acesso negado. Nível exigido: ${niveis.join(' ou ')}. Seu nível: ${req.funcionario.nivelPermissao}.`
      ));
    }

    next();
  };
}
