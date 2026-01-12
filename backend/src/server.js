import app from './app.js'

const PORT = 3333

app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`)
})




























//import express from "express"

//import cors from "cors"

//const app = express()

//app.use(cors())
//app.use(express.json())




//// Teste rápido
//app.get("/", (req, res) => {
//  res.json({ status: "Servidor local rodando 🚀" })
//})


// SUA consulta Prisma aqui 👇
//app.get("/funcionarios", async (req, res) => {
//  try {
//    const funcionarios = await prisma.funcionario.findMany()
//    res.json(funcionarios)
//  } catch (error) {
//    console.error(error)
//    res.status(500).json({ error: "Erro ao buscar funcionários" })
//  }
//})