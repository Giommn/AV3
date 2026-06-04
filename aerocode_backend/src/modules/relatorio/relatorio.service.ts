import fs from 'fs';
import path from 'path';
import prisma from '../../utils/prisma';
import { NotFoundError, AppError, ConflictError } from '../../utils/errors';
import { CreateRelatorioDto } from './relatorio.schema';
import { StatusEtapa } from '@prisma/client';

/**
 * Gera o conteúdo textual do relatório final da aeronave.
 * Equivale ao método `gerarRelatorio()` do diagrama UML.
 */
function gerarConteudoRelatorio(
  aeronave: Awaited<ReturnType<typeof obterDadosAeronave>>,
  nomeCliente: string,
  dataEntrega: Date
): string {
  const linhas: string[] = [];
  const separador = '='.repeat(70);
  const separadorMenor = '-'.repeat(70);

  linhas.push(separador);
  linhas.push('           AEROCODE - RELATÓRIO FINAL DE AERONAVE');
  linhas.push(separador);
  linhas.push('');

  // Cabeçalho
  linhas.push('DADOS DA AERONAVE');
  linhas.push(separadorMenor);
  linhas.push(`Código       : ${aeronave.codigo}`);
  linhas.push(`Modelo       : ${aeronave.modelo}`);
  linhas.push(`Tipo         : ${aeronave.tipo}`);
  linhas.push(`Capacidade   : ${aeronave.capacidade} passageiros`);
  linhas.push(`Alcance      : ${aeronave.alcance} km`);
  linhas.push('');

  // Entrega
  linhas.push('DADOS DA ENTREGA');
  linhas.push(separadorMenor);
  linhas.push(`Cliente      : ${nomeCliente}`);
  linhas.push(`Data Entrega : ${dataEntrega.toLocaleDateString('pt-BR')}`);
  linhas.push(`Gerado em    : ${new Date().toLocaleString('pt-BR')}`);
  linhas.push('');

  // Etapas
  linhas.push('ETAPAS DE PRODUÇÃO');
  linhas.push(separadorMenor);
  if (aeronave.etapas.length === 0) {
    linhas.push('  Nenhuma etapa registrada.');
  } else {
    aeronave.etapas.forEach((etapa, i) => {
      linhas.push(`  ${i + 1}. ${etapa.nome}`);
      linhas.push(`     Ordem  : ${etapa.ordem}`);
      linhas.push(`     Status : ${etapa.status}`);
      linhas.push(`     Prazo  : ${new Date(etapa.prazo).toLocaleDateString('pt-BR')}`);
      const nomesFuncionarios = etapa.funcionarios
        .map((ef) => ef.funcionario.nome)
        .join(', ');
      linhas.push(`     Equipe : ${nomesFuncionarios || 'Nenhum funcionário associado'}`);
    });
  }
  linhas.push('');

  // Peças
  linhas.push('PEÇAS UTILIZADAS');
  linhas.push(separadorMenor);
  if (aeronave.pecas.length === 0) {
    linhas.push('  Nenhuma peça registrada.');
  } else {
    aeronave.pecas.forEach((peca, i) => {
      linhas.push(`  ${i + 1}. ${peca.nome}`);
      linhas.push(`     Tipo       : ${peca.tipo}`);
      linhas.push(`     Fornecedor : ${peca.fornecedor}`);
      linhas.push(`     Status     : ${peca.status}`);
    });
  }
  linhas.push('');

  // Testes
  linhas.push('RESULTADOS DOS TESTES');
  linhas.push(separadorMenor);
  if (aeronave.testes.length === 0) {
    linhas.push('  Nenhum teste registrado.');
  } else {
    aeronave.testes.forEach((teste, i) => {
      linhas.push(`  ${i + 1}. ${teste.tipo}`);
      linhas.push(`     Resultado  : ${teste.resultado}`);
      if (teste.observacao) {
        linhas.push(`     Observação : ${teste.observacao}`);
      }
    });
  }
  linhas.push('');

  // Resumo dos testes
  const aprovados = aeronave.testes.filter((t) => t.resultado === 'APROVADO').length;
  const reprovados = aeronave.testes.filter((t) => t.resultado === 'REPROVADO').length;
  linhas.push(`  RESUMO: ${aprovados} aprovado(s) / ${reprovados} reprovado(s)`);
  linhas.push('');
  linhas.push(separador);
  linhas.push('           FIM DO RELATÓRIO');
  linhas.push(separador);

  return linhas.join('\n');
}

async function obterDadosAeronave(aeronaveId: number) {
  const aeronave = await prisma.aeronave.findUnique({
    where: { id: aeronaveId },
    include: {
      pecas: true,
      etapas: {
        orderBy: { ordem: 'asc' },
        include: {
          funcionarios: {
            include: { funcionario: { select: { nome: true } } },
          },
        },
      },
      testes: true,
    },
  });

  if (!aeronave) throw new NotFoundError('Aeronave');
  return aeronave;
}

export async function gerar(dados: CreateRelatorioDto) {
  const aeronave = await obterDadosAeronave(dados.aeronaveId);

  // Verifica se todas as etapas foram concluídas
  const etapasPendentes = aeronave.etapas.filter(
    (e) => e.status !== StatusEtapa.CONCLUIDA
  );

  if (etapasPendentes.length > 0) {
    const nomes = etapasPendentes.map((e) => `"${e.nome}"`).join(', ');
    throw new AppError(
      `Não é possível gerar o relatório. As seguintes etapas ainda não foram concluídas: ${nomes}.`,
      422
    );
  }

  // Verifica se já existe relatório
  const relatorioExistente = await prisma.relatorio.findUnique({
    where: { aeronaveId: dados.aeronaveId },
  });

  if (relatorioExistente) {
    throw new ConflictError(
      'Já existe um relatório para esta aeronave. Use a rota de regeneração para substituí-lo.'
    );
  }

  const conteudo = gerarConteudoRelatorio(aeronave, dados.nomeCliente, dados.dataEntrega);

  // Salva em arquivo de texto
  const dirRelatorios = process.env.RELATORIOS_DIR ?? './relatorios';
  if (!fs.existsSync(dirRelatorios)) {
    fs.mkdirSync(dirRelatorios, { recursive: true });
  }

  const nomeArquivo = `relatorio_aeronave_${aeronave.codigo}_${Date.now()}.txt`;
  const caminhoArquivo = path.join(dirRelatorios, nomeArquivo);
  fs.writeFileSync(caminhoArquivo, conteudo, { encoding: 'utf8' });

  // Persiste no banco
  const relatorio = await prisma.relatorio.create({
    data: {
      aeronaveId: dados.aeronaveId,
      nomeCliente: dados.nomeCliente,
      dataEntrega: dados.dataEntrega,
      conteudo,
      arquivoPath: caminhoArquivo,
    },
  });

  return relatorio;
}

export async function buscarPorAeronave(aeronaveId: number) {
  const aeronave = await prisma.aeronave.findUnique({ where: { id: aeronaveId } });
  if (!aeronave) throw new NotFoundError('Aeronave');

  const relatorio = await prisma.relatorio.findUnique({ where: { aeronaveId } });
  if (!relatorio) throw new NotFoundError('Relatório');

  return relatorio;
}

export async function buscarPorId(id: number) {
  const relatorio = await prisma.relatorio.findUnique({
    where: { id },
    include: { aeronave: true },
  });

  if (!relatorio) throw new NotFoundError('Relatório');
  return relatorio;
}

/**
 * Regenera o relatório mesmo que já exista (sobrescreve).
 */
export async function regenerar(aeronaveId: number, nomeCliente: string, dataEntrega: Date) {
  const aeronave = await obterDadosAeronave(aeronaveId);

  const conteudo = gerarConteudoRelatorio(aeronave, nomeCliente, dataEntrega);

  const dirRelatorios = process.env.RELATORIOS_DIR ?? './relatorios';
  if (!fs.existsSync(dirRelatorios)) {
    fs.mkdirSync(dirRelatorios, { recursive: true });
  }

  const nomeArquivo = `relatorio_aeronave_${aeronave.codigo}_${Date.now()}.txt`;
  const caminhoArquivo = path.join(dirRelatorios, nomeArquivo);
  fs.writeFileSync(caminhoArquivo, conteudo, { encoding: 'utf8' });

  const relatorio = await prisma.relatorio.upsert({
    where: { aeronaveId },
    create: {
      aeronaveId,
      nomeCliente,
      dataEntrega,
      conteudo,
      arquivoPath: caminhoArquivo,
    },
    update: {
      nomeCliente,
      dataEntrega,
      conteudo,
      arquivoPath: caminhoArquivo,
    },
  });

  return relatorio;
}
