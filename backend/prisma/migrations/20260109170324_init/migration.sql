/*
  Warnings:

  - You are about to drop the column `setor` on the `Funcionario` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Funcionario` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[biometria]` on the table `Funcionario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `atualizadoEm` to the `Funcionario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `setorId` to the `Funcionario` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Funcionario] DROP COLUMN [setor];
ALTER TABLE [dbo].[Funcionario] ADD CONSTRAINT [Funcionario_status_df] DEFAULT 'ATIVO' FOR [status];
ALTER TABLE [dbo].[Funcionario] ADD [atualizadoEm] DATETIME2 NOT NULL,
[biometria] NVARCHAR(1000),
[criadoEm] DATETIME2 NOT NULL CONSTRAINT [Funcionario_criadoEm_df] DEFAULT CURRENT_TIMESTAMP,
[email] NVARCHAR(1000),
[setorId] INT NOT NULL;

-- CreateTable
CREATE TABLE [dbo].[Usuario] (
    [id] INT NOT NULL IDENTITY(1,1),
    [email] NVARCHAR(1000) NOT NULL,
    [senha] NVARCHAR(1000) NOT NULL,
    [nome] NVARCHAR(1000) NOT NULL,
    [perfil] NVARCHAR(1000) NOT NULL CONSTRAINT [Usuario_perfil_df] DEFAULT 'USER',
    [ativo] BIT NOT NULL CONSTRAINT [Usuario_ativo_df] DEFAULT 1,
    [criadoEm] DATETIME2 NOT NULL CONSTRAINT [Usuario_criadoEm_df] DEFAULT CURRENT_TIMESTAMP,
    [atualizadoEm] DATETIME2 NOT NULL,
    CONSTRAINT [Usuario_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Usuario_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Setor] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nome] NVARCHAR(1000) NOT NULL,
    [descricao] NVARCHAR(1000),
    CONSTRAINT [Setor_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Setor_nome_key] UNIQUE NONCLUSTERED ([nome])
);

-- CreateTable
CREATE TABLE [dbo].[TipoEPI] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nome] NVARCHAR(1000) NOT NULL,
    [descricao] NVARCHAR(1000),
    [categoria] NVARCHAR(1000) NOT NULL,
    [ativo] BIT NOT NULL CONSTRAINT [TipoEPI_ativo_df] DEFAULT 1,
    [criadoEm] DATETIME2 NOT NULL CONSTRAINT [TipoEPI_criadoEm_df] DEFAULT CURRENT_TIMESTAMP,
    [atualizadoEm] DATETIME2 NOT NULL,
    CONSTRAINT [TipoEPI_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [TipoEPI_nome_key] UNIQUE NONCLUSTERED ([nome])
);

-- CreateTable
CREATE TABLE [dbo].[EPI] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nome] NVARCHAR(1000) NOT NULL,
    [tipoEPIId] INT NOT NULL,
    [ca] NVARCHAR(1000),
    [validadeCA] DATETIME2,
    [estoqueAtual] INT NOT NULL CONSTRAINT [EPI_estoqueAtual_df] DEFAULT 0,
    [estoqueMinimo] INT NOT NULL CONSTRAINT [EPI_estoqueMinimo_df] DEFAULT 5,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [EPI_status_df] DEFAULT 'OK',
    [ativo] BIT NOT NULL CONSTRAINT [EPI_ativo_df] DEFAULT 1,
    [criadoEm] DATETIME2 NOT NULL CONSTRAINT [EPI_criadoEm_df] DEFAULT CURRENT_TIMESTAMP,
    [atualizadoEm] DATETIME2 NOT NULL,
    CONSTRAINT [EPI_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Entrega] (
    [id] INT NOT NULL IDENTITY(1,1),
    [funcionarioId] INT NOT NULL,
    [epiId] INT NOT NULL,
    [quantidade] INT NOT NULL,
    [dataEntrega] DATETIME2 NOT NULL CONSTRAINT [Entrega_dataEntrega_df] DEFAULT CURRENT_TIMESTAMP,
    [observacoes] NVARCHAR(1000),
    [criadoEm] DATETIME2 NOT NULL CONSTRAINT [Entrega_criadoEm_df] DEFAULT CURRENT_TIMESTAMP,
    [atualizadoEm] DATETIME2 NOT NULL,
    CONSTRAINT [Entrega_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Devolucao] (
    [id] INT NOT NULL IDENTITY(1,1),
    [funcionarioId] INT NOT NULL,
    [epiId] INT NOT NULL,
    [quantidade] INT NOT NULL,
    [dataDevolucao] DATETIME2 NOT NULL CONSTRAINT [Devolucao_dataDevolucao_df] DEFAULT CURRENT_TIMESTAMP,
    [motivo] NVARCHAR(1000),
    [condicao] NVARCHAR(1000),
    [criadoEm] DATETIME2 NOT NULL CONSTRAINT [Devolucao_criadoEm_df] DEFAULT CURRENT_TIMESTAMP,
    [atualizadoEm] DATETIME2 NOT NULL,
    CONSTRAINT [Devolucao_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [EPI_tipoEPIId_idx] ON [dbo].[EPI]([tipoEPIId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Entrega_funcionarioId_idx] ON [dbo].[Entrega]([funcionarioId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Entrega_epiId_idx] ON [dbo].[Entrega]([epiId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Devolucao_funcionarioId_idx] ON [dbo].[Devolucao]([funcionarioId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Devolucao_epiId_idx] ON [dbo].[Devolucao]([epiId]);

-- CreateIndex
ALTER TABLE [dbo].[Funcionario] ADD CONSTRAINT [Funcionario_email_key] UNIQUE NONCLUSTERED ([email]);

-- CreateIndex
ALTER TABLE [dbo].[Funcionario] ADD CONSTRAINT [Funcionario_biometria_key] UNIQUE NONCLUSTERED ([biometria]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Funcionario_setorId_idx] ON [dbo].[Funcionario]([setorId]);

-- AddForeignKey
ALTER TABLE [dbo].[Funcionario] ADD CONSTRAINT [Funcionario_setorId_fkey] FOREIGN KEY ([setorId]) REFERENCES [dbo].[Setor]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[EPI] ADD CONSTRAINT [EPI_tipoEPIId_fkey] FOREIGN KEY ([tipoEPIId]) REFERENCES [dbo].[TipoEPI]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Entrega] ADD CONSTRAINT [Entrega_funcionarioId_fkey] FOREIGN KEY ([funcionarioId]) REFERENCES [dbo].[Funcionario]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Entrega] ADD CONSTRAINT [Entrega_epiId_fkey] FOREIGN KEY ([epiId]) REFERENCES [dbo].[EPI]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Devolucao] ADD CONSTRAINT [Devolucao_funcionarioId_fkey] FOREIGN KEY ([funcionarioId]) REFERENCES [dbo].[Funcionario]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Devolucao] ADD CONSTRAINT [Devolucao_epiId_fkey] FOREIGN KEY ([epiId]) REFERENCES [dbo].[EPI]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
