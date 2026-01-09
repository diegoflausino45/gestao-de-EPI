import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Iniciando seed...");

    // Limpar dados antigos
    await prisma.devolucao.deleteMany();
    await prisma.entrega.deleteMany();
    await prisma.epi.deleteMany();
    await prisma.tipoEPI.deleteMany();
    await prisma.funcionario.deleteMany();
    await prisma.setor.deleteMany();
    await prisma.usuario.deleteMany();
    console.log("✓ Dados antigos removidos");

    // Criar Setores
    const setorProducao = await prisma.setor.create({
      data: {
        nome: "Produção",
        descricao: "Setor de produção"
      }
    });

    const setorAdministrativo = await prisma.setor.create({
      data: {
        nome: "Administrativo",
        descricao: "Setor administrativo"
      }
    });

    const setorLogistica = await prisma.setor.create({
      data: {
        nome: "Logística",
        descricao: "Setor de logística"
      }
    });

    console.log("✓ Setores criados");

    // Criar Usuários
    await prisma.usuario.create({
      data: {
        email: "admin@empresa.com",
        senha: "senha123",
        nome: "Administrador",
        perfil: "ADMIN",
        ativo: true
      }
    });

    console.log("✓ Usuários criados");

    // Criar Funcionários
    const func1 = await prisma.funcionario.create({
      data: {
        nome: "João Silva",
        email: "joao@empresa.com",
        cargo: "Operador de Máquinas",
        setorId: setorProducao.id,
        status: "ATIVO",
        ativo: true
      }
    });

    const func2 = await prisma.funcionario.create({
      data: {
        nome: "Maria Santos",
        email: "maria@empresa.com",
        cargo: "Supervisora",
        setorId: setorProducao.id,
        status: "ATIVO",
        ativo: true
      }
    });

    const func3 = await prisma.funcionario.create({
      data: {
        nome: "Carlos Costa",
        email: "carlos@empresa.com",
        cargo: "Assistente Administrativo",
        setorId: setorAdministrativo.id,
        status: "ATIVO",
        ativo: true
      }
    });

    const func4 = await prisma.funcionario.create({
      data: {
        nome: "Ana Oliveira",
        email: "ana@empresa.com",
        cargo: "Gerente de Logística",
        setorId: setorLogistica.id,
        status: "ATIVO",
        ativo: true
      }
    });

    console.log("✓ Funcionários criados");

    // Criar Tipos de EPI
    const tipoCapacete = await prisma.tipoEPI.create({
      data: {
        nome: "Capacete",
        descricao: "Proteção para a cabeça",
        categoria: "Proteção da Cabeça",
        ativo: true
      }
    });

    const tipoOculos = await prisma.tipoEPI.create({
      data: {
        nome: "Óculos de Proteção",
        descricao: "Proteção para os olhos",
        categoria: "Proteção dos Olhos",
        ativo: true
      }
    });

    const tipoLuva = await prisma.tipoEPI.create({
      data: {
        nome: "Luva de Segurança",
        descricao: "Proteção para as mãos",
        categoria: "Proteção das Mãos",
        ativo: true
      }
    });

    const tipoBotas = await prisma.tipoEPI.create({
      data: {
        nome: "Botas de Segurança",
        descricao: "Proteção para os pés",
        categoria: "Proteção dos Pés",
        ativo: true
      }
    });

    const tipoMascara = await prisma.tipoEPI.create({
      data: {
        nome: "Máscara de Proteção",
        descricao: "Proteção respiratória",
        categoria: "Proteção Respiratória",
        ativo: true
      }
    });

    console.log("✓ Tipos de EPI criados");

    // Criar EPIs
    await prisma.epi.create({
      data: {
        nome: "Capacete de Segurança Branco",
        tipoEPIId: tipoCapacete.id,
        ca: "CA 15945",
        validadeCA: new Date("2025-12-31"),
        estoqueAtual: 50,
        estoqueMinimo: 5,
        status: "OK",
        ativo: true
      }
    });

    await prisma.epi.create({
      data: {
        nome: "Óculos de Proteção Incolor",
        tipoEPIId: tipoOculos.id,
        ca: "CA 33656",
        validadeCA: new Date("2026-06-30"),
        estoqueAtual: 80,
        estoqueMinimo: 10,
        status: "OK",
        ativo: true
      }
    });

    await prisma.epi.create({
      data: {
        nome: "Luva de Nitrila Preta",
        tipoEPIId: tipoLuva.id,
        ca: "CA 30350",
        validadeCA: new Date("2026-03-15"),
        estoqueAtual: 120,
        estoqueMinimo: 20,
        status: "OK",
        ativo: true
      }
    });

    await prisma.epi.create({
      data: {
        nome: "Botas de Segurança Marrom",
        tipoEPIId: tipoBotas.id,
        ca: "CA 27980",
        validadeCA: new Date("2027-01-10"),
        estoqueAtual: 35,
        estoqueMinimo: 5,
        status: "OK",
        ativo: true
      }
    });

    await prisma.epi.create({
      data: {
        nome: "Máscara N95",
        tipoEPIId: tipoMascara.id,
        ca: "CA 35237",
        validadeCA: new Date("2025-09-20"),
        estoqueAtual: 200,
        estoqueMinimo: 50,
        status: "OK",
        ativo: true
      }
    });

    console.log("✓ EPIs criados");

    // Criar algumas Entregas
    await prisma.entrega.create({
      data: {
        funcionarioId: func1.id,
        epiId: 1,
        quantidade: 2,
        observacoes: "Entrega padrão de capacete"
      }
    });

    await prisma.entrega.create({
      data: {
        funcionarioId: func2.id,
        epiId: 2,
        quantidade: 1,
        observacoes: "Óculos de proteção"
      }
    });

    await prisma.entrega.create({
      data: {
        funcionarioId: func3.id,
        epiId: 3,
        quantidade: 3,
        observacoes: "Luvas para uso administrativo"
      }
    });

    console.log("✓ Entregas criadas");

    console.log("\n✅ Seed completado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
