import 'dotenv/config';
import app from './app';
import prisma from './utils/prisma';

const PORT = Number(process.env.PORT) || 3000;

async function main() {
  try {
    // Testa a conexão com o banco
    await prisma.$connect();
    console.log('✅ Conexão com o banco de dados estabelecida.');

    app.listen(PORT, () => {
      console.log(`🚀 Aerocode Backend rodando na porta ${PORT}`);
      console.log(`📋 Ambiente: ${process.env.NODE_ENV ?? 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API base: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

main();
