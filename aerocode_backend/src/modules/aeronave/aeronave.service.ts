import prisma from '../../utils/prisma';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { CreateAeronaveDto, UpdateAeronaveDto } from './aeronave.schema';

export async function listarTodas() {
  return prisma.aeronave.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { pecas: true, etapas: true, testes: true } },
    },
  });
}

export async function buscarPorId(id: number) {
  const aeronave = await prisma.aeronave.findUnique({
    where: { id },
    include: {
      _count: { select: { pecas: true, etapas: true, testes: true } },
    },
  });

  if (!aeronave) throw new NotFoundError('Aeronave');
  return aeronave;
}

export async function criar(dados: CreateAeronaveDto) {
  // Garante unicidade do código
  const existente = await prisma.aeronave.findUnique({
    where: { codigo: dados.codigo },
  });

  if (existente) {
    throw new ConflictError(`Já existe uma aeronave com o código "${dados.codigo}".`);
  }

  return prisma.aeronave.create({ data: dados });
}

export async function atualizar(id: number, dados: UpdateAeronaveDto) {
  await buscarPorId(id); // garante existência

  // Se estiver tentando alterar o código, verifica duplicidade
  if (dados.codigo) {
    const existente = await prisma.aeronave.findFirst({
      where: { codigo: dados.codigo, NOT: { id } },
    });

    if (existente) {
      throw new ConflictError(`Já existe uma aeronave com o código "${dados.codigo}".`);
    }
  }

  return prisma.aeronave.update({ where: { id }, data: dados });
}

export async function remover(id: number) {
  await buscarPorId(id);
  await prisma.aeronave.delete({ where: { id } });
}

/**
 * Retorna todos os detalhes completos da aeronave incluindo peças, etapas, testes e relatório.
 * Equivale ao método `exibirDetalhes()` do diagrama UML.
 */
export async function obterDetalhesCompletos(id: number) {
  const aeronave = await prisma.aeronave.findUnique({
    where: { id },
    include: {
      pecas: { orderBy: { createdAt: 'asc' } },
      etapas: {
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
      },
      testes: { orderBy: { createdAt: 'asc' } },
      relatorio: true,
    },
  });

  if (!aeronave) throw new NotFoundError('Aeronave');
  return aeronave;
}
