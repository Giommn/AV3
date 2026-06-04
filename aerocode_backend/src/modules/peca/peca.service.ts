import prisma from '../../utils/prisma';
import { NotFoundError } from '../../utils/errors';
import { CreatePecaDto, UpdatePecaDto, UpdateStatusPecaDto } from './peca.schema';

async function verificarAeronave(aeronaveId: number) {
  const aeronave = await prisma.aeronave.findUnique({ where: { id: aeronaveId } });
  if (!aeronave) throw new NotFoundError('Aeronave');
}

export async function listarPorAeronave(aeronaveId: number) {
  await verificarAeronave(aeronaveId);
  return prisma.peca.findMany({
    where: { aeronaveId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function buscarPorId(id: number) {
  const peca = await prisma.peca.findUnique({ where: { id } });
  if (!peca) throw new NotFoundError('Peça');
  return peca;
}

export async function criar(dados: CreatePecaDto) {
  await verificarAeronave(dados.aeronaveId);
  return prisma.peca.create({ data: dados });
}

export async function atualizar(id: number, dados: UpdatePecaDto) {
  await buscarPorId(id);
  if (dados.aeronaveId) await verificarAeronave(dados.aeronaveId);
  return prisma.peca.update({ where: { id }, data: dados });
}

/**
 * Atualiza apenas o status da peça.
 * Equivale ao método `atualizarStatus()` do diagrama UML.
 */
export async function atualizarStatus(id: number, dados: UpdateStatusPecaDto) {
  await buscarPorId(id);
  return prisma.peca.update({ where: { id }, data: { status: dados.status } });
}

export async function remover(id: number) {
  await buscarPorId(id);
  await prisma.peca.delete({ where: { id } });
}
