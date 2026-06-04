import bcrypt from 'bcryptjs';
import prisma from '../../utils/prisma';
import { signToken } from '../../utils/jwt';
import { NotFoundError, UnauthorizedError, ConflictError, ForbiddenError } from '../../utils/errors';
import {
  CreateFuncionarioDto,
  UpdateFuncionarioDto,
  ChangePasswordDto,
  LoginDto,
} from './funcionario.schema';
import { NivelPermissao } from '@prisma/client';

const SALT_ROUNDS = 10;

// Remove a senha do retorno público
function omitirSenha<T extends { senha: string }>(obj: T): Omit<T, 'senha'> {
  const { senha: _, ...rest } = obj;
  return rest;
}

export async function login(dados: LoginDto) {
  const funcionario = await prisma.funcionario.findUnique({
    where: { usuario: dados.usuario },
  });

  if (!funcionario || !funcionario.ativo) {
    throw new UnauthorizedError('Usuário ou senha inválidos.');
  }

  const senhaValida = await bcrypt.compare(dados.senha, funcionario.senha);
  if (!senhaValida) {
    throw new UnauthorizedError('Usuário ou senha inválidos.');
  }

  const token = signToken({
    funcionarioId: funcionario.id,
    usuario: funcionario.usuario,
    nivelPermissao: funcionario.nivelPermissao,
  });

  return { token, funcionario: omitirSenha(funcionario) };
}

export async function listarTodos() {
  const funcionarios = await prisma.funcionario.findMany({
    orderBy: { nome: 'asc' },
    select: {
      id: true,
      nome: true,
      telefone: true,
      endereco: true,
      usuario: true,
      nivelPermissao: true,
      ativo: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return funcionarios;
}

export async function buscarPorId(id: number) {
  const funcionario = await prisma.funcionario.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      telefone: true,
      endereco: true,
      usuario: true,
      nivelPermissao: true,
      ativo: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!funcionario) throw new NotFoundError('Funcionário');
  return funcionario;
}

export async function criar(dados: CreateFuncionarioDto, nivelRequisitante: NivelPermissao) {
  // Apenas ADMINISTRADOR pode criar outros administradores
  if (
    dados.nivelPermissao === NivelPermissao.ADMINISTRADOR &&
    nivelRequisitante !== NivelPermissao.ADMINISTRADOR
  ) {
    throw new ForbiddenError('Apenas administradores podem criar outros administradores.');
  }

  const existente = await prisma.funcionario.findUnique({ where: { usuario: dados.usuario } });
  if (existente) {
    throw new ConflictError(`Já existe um funcionário com o usuário "${dados.usuario}".`);
  }

  const senhaHash = await bcrypt.hash(dados.senha, SALT_ROUNDS);

  const funcionario = await prisma.funcionario.create({
    data: { ...dados, senha: senhaHash },
  });

  return omitirSenha(funcionario);
}

export async function atualizar(
  id: number,
  dados: UpdateFuncionarioDto,
  nivelRequisitante: NivelPermissao,
  idRequisitante: number
) {
  await buscarPorId(id);

  // Apenas ADMINISTRADOR pode promover outros a ADMINISTRADOR ou alterar dados de outros
  if (idRequisitante !== id && nivelRequisitante !== NivelPermissao.ADMINISTRADOR) {
    throw new ForbiddenError('Você só pode editar seu próprio cadastro.');
  }

  if (
    dados.nivelPermissao === NivelPermissao.ADMINISTRADOR &&
    nivelRequisitante !== NivelPermissao.ADMINISTRADOR
  ) {
    throw new ForbiddenError('Apenas administradores podem promover outros a administradores.');
  }

  const funcionario = await prisma.funcionario.update({ where: { id }, data: dados });
  return omitirSenha(funcionario);
}

export async function alterarSenha(
  id: number,
  dados: ChangePasswordDto,
  idRequisitante: number
) {
  // Funcionário só pode alterar a própria senha
  if (id !== idRequisitante) {
    throw new ForbiddenError('Você só pode alterar sua própria senha.');
  }

  const funcionario = await prisma.funcionario.findUnique({ where: { id } });
  if (!funcionario) throw new NotFoundError('Funcionário');

  const senhaValida = await bcrypt.compare(dados.senhaAtual, funcionario.senha);
  if (!senhaValida) {
    throw new UnauthorizedError('Senha atual incorreta.');
  }

  const novaHash = await bcrypt.hash(dados.novaSenha, SALT_ROUNDS);
  await prisma.funcionario.update({ where: { id }, data: { senha: novaHash } });
}

export async function remover(id: number) {
  await buscarPorId(id);
  // Soft delete: desativa em vez de excluir para preservar histórico
  await prisma.funcionario.update({ where: { id }, data: { ativo: false } });
}
