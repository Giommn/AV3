import { PrismaClient, NivelPermissao } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Cria administrador padrão
  const senhaHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.funcionario.upsert({
    where: { usuario: 'admin' },
    update: {},
    create: {
      nome: 'Administrador do Sistema',
      telefone: '(12) 99999-0000',
      endereco: 'São José dos Campos, SP',
      usuario: 'admin',
      senha: senhaHash,
      nivelPermissao: NivelPermissao.ADMINISTRADOR,
    },
  });

  console.log(`✅ Usuário administrador criado: ${admin.usuario}`);
  console.log('🔑 Credenciais padrão: usuario=admin / senha=admin123');
  console.log('⚠️  Altere a senha padrão em produção!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
