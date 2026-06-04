import prisma from '../../utils/prisma';
import { NotFoundError, ConflictError, AppError } from '../../utils/errors';
import { StatusEtapa } from '@prisma/client';
import { CreateEtapaDto, UpdateEtapaDto, AssociarFuncionarioDto } from './etapa.schema';

async function verificarAeronave(aeronaveId: number) {
  const aeronave = await prisma.aeronave.findUnique({ where: { id: aeronaveId } });
  if (!aeronave) throw new NotFoundError('Aeronave');
}

export async function listarPorAeronave(aeronaveId: number) {
  await verificarAeronave(aeronaveId);
  return prisma.etapa.findMany({
    where: { aeronaveId },
    orderBy: { ordem: 'asc' },
    include: {
      funcionarios: {
        include: {
          funcionario: {
            select: { id: true, nome: true, usuario: true, nivelPermissao: true },
          },
        },
      },
    },
  });
}

export async function buscarPorId(id: number) {
  const etapa = await prisma.etapa.findUnique({
    where: { id },
    include: {
      funcionarios: {
        include: {
          funcionario: {
            select: { id: true, nome: true, usuario: true, nivelPermissao: true },
          },
        },
      },
    },
  });
  if (!etapa) throw new NotFoundError('Etapa');
  return etapa;
}

export async function criar(dados: CreateEtapaDto) {
  await verificarAeronave(dados.aeronaveId);
  return prisma.etapa.create({
    data: { ...dados, status: StatusEtapa.PENDENTE },
  });
}

export async function atualizar(id: number, dados: UpdateEtapaDto) {
  await buscarPorId(id);
  if (dados.aeronaveId) await verificarAeronave(dados.aeronaveId);
  return prisma.etapa.update({ where: { id }, data: dados });
}

/**
 * Inicia uma etapa (PENDENTE → ANDAMENTO).
 * Regra de negócio: a etapa de ordem anterior deve estar CONCLUIDA,
 * exceto a primeira (ordem = 1).
 */
export async function iniciarEtapa(id: number) {
  const etapa = await buscarPorId(id);

  if (etapa.status !== StatusEtapa.PENDENTE) {
    throw new AppError(
      `Não é possível iniciar uma etapa com status "${etapa.status}". A etapa deve estar PENDENTE.`,
      422
    );
  }

  // Verifica se a etapa anterior (por ordem) está concluída
  if (etapa.ordem > 1) {
    const etapaAnterior = await prisma.etapa.findFirst({
      where: { aeronaveId: etapa.aeronaveId, ordem: etapa.ordem - 1 },
    });

    if (etapaAnterior && etapaAnterior.status !== StatusEtapa.CONCLUIDA) {
      throw new AppError(
        `A etapa anterior "${etapaAnterior.nome}" (ordem ${etapaAnterior.ordem}) ainda não foi concluída. ` +
        `Não é possível iniciar esta etapa antes de concluir a anterior.`,
        422
      );
    }
  }

  return prisma.etapa.update({
    where: { id },
    data: { status: StatusEtapa.ANDAMENTO },
  });
}

/**
 * Conclui uma etapa (ANDAMENTO → CONCLUIDA).
 */
export async function concluirEtapa(id: number) {
  const etapa = await buscarPorId(id);

  if (etapa.status !== StatusEtapa.ANDAMENTO) {
    throw new AppError(
      `Não é possível concluir uma etapa com status "${etapa.status}". A etapa deve estar EM ANDAMENTO.`,
      422
    );
  }

  return prisma.etapa.update({
    where: { id },
    data: { status: StatusEtapa.CONCLUIDA },
  });
}

/**
 * Associa um funcionário a uma etapa, evitando duplicidade.
 */
export async function associarFuncionario(etapaId: number, dados: AssociarFuncionarioDto) {
  await buscarPorId(etapaId);

  const funcionario = await prisma.funcionario.findUnique({
    where: { id: dados.funcionarioId },
  });
  if (!funcionario) throw new NotFoundError('Funcionário');

  // Evita duplicidade
  const jaAssociado = await prisma.etapaFuncionario.findUnique({
    where: { etapaId_funcionarioId: { etapaId, funcionarioId: dados.funcionarioId } },
  });

  if (jaAssociado) {
    throw new ConflictError('Este funcionário já está associado a esta etapa.');
  }

  await prisma.etapaFuncionario.create({
    data: { etapaId, funcionarioId: dados.funcionarioId },
  });

  return buscarPorId(etapaId);
}

/**
 * Remove a associação de um funcionário a uma etapa.
 */
export async function desassociarFuncionario(etapaId: number, funcionarioId: number) {
  await buscarPorId(etapaId);

  const associacao = await prisma.etapaFuncionario.findUnique({
    where: { etapaId_funcionarioId: { etapaId, funcionarioId } },
  });

  if (!associacao) {
    throw new NotFoundError('Associação entre funcionário e etapa');
  }

  await prisma.etapaFuncionario.delete({
    where: { etapaId_funcionarioId: { etapaId, funcionarioId } },
  });
}

/**
 * Lista todos os funcionários vinculados a uma etapa.
 */
export async function listarFuncionariosDaEtapa(etapaId: number) {
  await buscarPorId(etapaId);

  const associacoes = await prisma.etapaFuncionario.findMany({
    where: { etapaId },
    include: {
      funcionario: {
        select: { id: true, nome: true, usuario: true, nivelPermissao: true, telefone: true },
      },
    },
  });

  return associacoes.map((a) => a.funcionario);
}

export async function remover(id: number) {
  await buscarPorId(id);
  await prisma.etapa.delete({ where: { id } });
}
