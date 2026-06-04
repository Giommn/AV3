import prisma from '../../utils/prisma';
import { NotFoundError } from '../../utils/errors';
import { CreateTesteDto, UpdateTesteDto } from './teste.schema';

async function verificarAeronave(aeronaveId: number) {
  const aeronave = await prisma.aeronave.findUnique({ where: { id: aeronaveId } });
  if (!aeronave) throw new NotFoundError('Aeronave');
}

export async function listarPorAeronave(aeronaveId: number) {
  await verificarAeronave(aeronaveId);
  return prisma.teste.findMany({
    where: { aeronaveId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function buscarPorId(id: number) {
  const teste = await prisma.teste.findUnique({ where: { id } });
  if (!teste) throw new NotFoundError('Teste');
  return teste;
}

export async function criar(dados: CreateTesteDto) {
  await verificarAeronave(dados.aeronaveId);
  return prisma.teste.create({ data: dados });
}

export async function atualizar(id: number, dados: UpdateTesteDto) {
  await buscarPorId(id);
  if (dados.aeronaveId) await verificarAeronave(dados.aeronaveId);
  return prisma.teste.update({ where: { id }, data: dados });
}

export async function remover(id: number) {
  await buscarPorId(id);
  await prisma.teste.delete({ where: { id } });
}
