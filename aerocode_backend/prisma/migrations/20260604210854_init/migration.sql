-- CreateTable
CREATE TABLE `aeronaves` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(50) NOT NULL,
    `modelo` VARCHAR(100) NOT NULL,
    `tipo` ENUM('COMERCIAL', 'MILITAR') NOT NULL,
    `capacidade` INTEGER NOT NULL,
    `alcance` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `aeronaves_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pecas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `tipo` ENUM('NACIONAL', 'IMPORTADA') NOT NULL,
    `fornecedor` VARCHAR(100) NOT NULL,
    `status` ENUM('EM_PRODUCAO', 'EM_TRANSPORTE', 'PRONTA') NOT NULL DEFAULT 'EM_PRODUCAO',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `aeronaveId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `funcionarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `telefone` VARCHAR(20) NOT NULL,
    `endereco` VARCHAR(255) NOT NULL,
    `usuario` VARCHAR(50) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `nivelPermissao` ENUM('ADMINISTRADOR', 'ENGENHEIRO', 'OPERADOR') NOT NULL DEFAULT 'OPERADOR',
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `funcionarios_usuario_key`(`usuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `etapas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `prazo` DATETIME(3) NOT NULL,
    `status` ENUM('PENDENTE', 'ANDAMENTO', 'CONCLUIDA') NOT NULL DEFAULT 'PENDENTE',
    `ordem` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `aeronaveId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `etapa_funcionarios` (
    `etapaId` INTEGER NOT NULL,
    `funcionarioId` INTEGER NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`etapaId`, `funcionarioId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `testes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` ENUM('ELETRICO', 'HIDRAULICO', 'AERODINAMICO') NOT NULL,
    `resultado` ENUM('APROVADO', 'REPROVADO') NOT NULL,
    `observacao` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `aeronaveId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `relatorios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nomeCliente` VARCHAR(100) NOT NULL,
    `dataEntrega` DATETIME(3) NOT NULL,
    `arquivoPath` VARCHAR(255) NULL,
    `conteudo` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `aeronaveId` INTEGER NOT NULL,

    UNIQUE INDEX `relatorios_aeronaveId_key`(`aeronaveId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pecas` ADD CONSTRAINT `pecas_aeronaveId_fkey` FOREIGN KEY (`aeronaveId`) REFERENCES `aeronaves`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `etapas` ADD CONSTRAINT `etapas_aeronaveId_fkey` FOREIGN KEY (`aeronaveId`) REFERENCES `aeronaves`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `etapa_funcionarios` ADD CONSTRAINT `etapa_funcionarios_etapaId_fkey` FOREIGN KEY (`etapaId`) REFERENCES `etapas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `etapa_funcionarios` ADD CONSTRAINT `etapa_funcionarios_funcionarioId_fkey` FOREIGN KEY (`funcionarioId`) REFERENCES `funcionarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `testes` ADD CONSTRAINT `testes_aeronaveId_fkey` FOREIGN KEY (`aeronaveId`) REFERENCES `aeronaves`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `relatorios` ADD CONSTRAINT `relatorios_aeronaveId_fkey` FOREIGN KEY (`aeronaveId`) REFERENCES `aeronaves`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
