BEGIN TRY

BEGIN TRAN;

-- CreateSchema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'dbo') EXEC sp_executesql N'CREATE SCHEMA [dbo];';

-- CreateTable
CREATE TABLE [dbo].[Funcionario] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nome] NVARCHAR(1000) NOT NULL,
    [cargo] NVARCHAR(1000) NOT NULL,
    [setor] NVARCHAR(1000) NOT NULL,
    [ativo] BIT NOT NULL CONSTRAINT [Funcionario_ativo_df] DEFAULT 1,
    [status] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Funcionario_pkey] PRIMARY KEY CLUSTERED ([id])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

