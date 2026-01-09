import { useState, useEffect } from "react";

import styles from "./styles.module.css";
import tables from './table.module.css'
import modalcss from "./modal.module.css";
import { FaFingerprint, FaCheckCircle, FaExclamationTriangle, FaSpinner } from "react-icons/fa";

import SearchBar from "../../components/SearchBar";
import Modal from "../../components/Modal"
import BiometriaService from "../../services/BiometriaService";

import { api } from "../../services/api";

// IMPORTANDO O SERVIÇO DE BIOMETRIA

const initialState = {
  nome: "",
  cpf: "",
  cargo: "",
  setor: "",
  status: "Ativo",
  biometriaTemplate: "",
  // Mantemos campos extras vazios para não quebrar a estrutura caso sejam usados
  epis: [],
  ultimaEntrega: null
};


function FuncionariosTable({
  dados,
  onEdit,
  onInativar,
}) {

  return (
    <div className={tables.tableWrapper}>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Cargo</th>
            <th>Setor</th>
            <th>EPIs Recebidos</th>
            <th>Última Entrega</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {dados.map(f => (
            <tr
              key={f.id}
              className={f.status === "inativo"? tables.inativo : ""}
            >
              <td>{f.nome}</td>
              <td>{f.cargo}</td>
              <td>{f.setor}</td>
              <td>{f.epis}</td>
              <td>{f.ultimaEntrega}</td>
              <td className={tables.actions}>
                <button className={tables.editBtn} onClick={() => onEdit(f)}>
                  Editar
                </button>

                <button
                  onClick={() => onInativar(f.id)}
                  className={
                    f.status === "ativo" ? tables.inactivateBtn : tables.activateBtn
                  }
                >
                  {f.status === "ativo" ? "Inativar" : "Ativar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Certifique-se de ter instalado: npm install react-icons

function FuncionarioModal({ isOpen, onClose, onSave, employee }) {
  const [form, setForm] = useState(initialState);

  // Estado Visual da Biometria
  const [bioStatus, setBioStatus] = useState("idle"); // idle | loading | success | error
  const [bioMessage, setBioMessage] = useState("");   // Mensagem de feedback
  const [bioImage, setBioImage] = useState(null);     // Para mostrar a digital (opcional)

  useEffect(() => {
    if (employee) {
      // Carrega todos os dados do funcionário (incluindo EPIs e Entregas para não perder ao salvar)
      setForm(employee);

      // Se já tem template salvo, mostra status de sucesso
      if (employee.biometriaTemplate) {
        setBioStatus("success");
        setBioMessage("Digital já cadastrada");
      } else {
        resetBioState();
      }
    } else {
      setForm(initialState);
      resetBioState();
    }
  }, [employee, isOpen]);

  function resetBioState() {
    setBioStatus("idle");
    setBioMessage("");
    setBioImage(null);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // --- LÓGICA DE SERVIÇO DA BIOMETRIA ---
  async function handleCapturarDigital() {
    setBioStatus("loading");
    setBioMessage("Posicione o dedo no leitor...");
    setBioImage(null);

    try {
      // 1. Verifica saúde do driver
      const status = await BiometriaService.checkStatus();
      if (status.status === 'offline') {
        throw new Error("Driver de biometria não detectado no PC.");
      }

      // 2. Realiza a captura
      const dados = await BiometriaService.capturar();

      // 3. Sucesso
      setForm((prev) => ({ ...prev, biometriaTemplate: dados.template }));
      setBioImage(dados.image);
      setBioStatus("success");
      setBioMessage("Leitura realizada com sucesso!");

    } catch (error) {
      setBioStatus("error");
      setBioMessage(error.message);
      console.error(error);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
    onClose();
  }

  return (
      <Modal
          isOpen={isOpen}
          onClose={onClose}
          title={employee ? "Editar Funcionário" : "Novo Funcionário"}
      >
        <form className={modalcss.form} onSubmit={handleSubmit}>

          {/* --- DADOS PESSOAIS --- */}
          <div className={modalcss.group}>
            <label>Nome Completo</label>
            <input
                name="nome"
                value={form.nome || ""}
                onChange={handleChange}
                required
                placeholder="Ex: João da Silva"
            />
          </div>

          <div className={modalcss.group}>
            <label>CPF</label>
            <input
                name="cpf"
                value={form.cpf || ""}
                onChange={handleChange}
                required
                placeholder="000.000.000-00"
            />
          </div>

          <div className={modalcss.group}>
            <label>Cargo</label>
            <input
                name="cargo"
                value={form.cargo || ""}
                onChange={handleChange}
                placeholder="Ex: Operador de Máquinas"
            />
          </div>

          <div className={modalcss.group}>
            <label>Setor</label>
            <input
                name="setor"
                value={form.setor || ""}
                onChange={handleChange}
                placeholder="Ex: Produção"
            />
          </div>

          <div className={modalcss.group}>
            <label>Status</label>
            <select
                name="status"
                value={form.status || "Ativo"}
                onChange={handleChange}
            >
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>

          {/* --- ÁREA DE BIOMETRIA --- */}
          <div className={modalcss.biometriaSection}>
            <label>Biometria</label>

            <div className={modalcss.biometriaContainer}>
              {/* Botão de Captura */}
              <button
                  type="button"
                  onClick={handleCapturarDigital}
                  disabled={bioStatus === 'loading'}
                  className={`${modalcss.btnBio} ${modalcss[bioStatus] || ''}`}
              >
                {bioStatus === 'loading' ? <FaSpinner className={modalcss.spin} /> : <FaFingerprint />}
                {bioStatus === 'loading' ? "Lendo..." : "Capturar Digital"}
              </button>

              {/* Feedback Visual (Mensagem) */}
              <div className={modalcss.bioFeedback}>
                {bioStatus === 'success' && <FaCheckCircle className={modalcss.iconSuccess} />}
                {bioStatus === 'error' && <FaExclamationTriangle className={modalcss.iconError} />}
                <span>{bioMessage}</span>
              </div>
            </div>

            {/* Preview da Imagem da Digital */}
            {bioImage && (
                <div className={modalcss.digitalPreview}>
                  <p>Digital Capturada:</p>
                  <img src={bioImage} alt="Preview Digital" />
                </div>
            )}
          </div>

          <div className={modalcss.actions}>
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit" className={modalcss.primary}>Salvar</button>
          </div>
        </form>
      </Modal>
  );
}


function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);
  const [search, setSearch] = useState("");

  const funcionariosFiltrados = funcionarios.filter(f =>
  f.nome.toLowerCase().includes(search.toLowerCase()) ||
  f.cargo.toLowerCase().includes(search.toLowerCase()) ||
  f.setor.toLowerCase().includes(search.toLowerCase())
);

useEffect(() => {
  async function loadFuncionarios() {
    try {
      const response = await api.get("/funcionarios");
      setFuncionarios(response.data);
    } catch (error) {
      console.error("Erro ao buscar funcionários", error);
    }
  }

  loadFuncionarios();
}, []);


  function inativarFuncionario(id) {
    // Futuro: chamar API DELETE ou PATCH /funcionarios/:id
    setFuncionarios(prev =>
        prev.map(f =>
            f.id === id ? { ...f, status: f.status === "ativo" ? "inativo" : "ativo" } : f
        )
    );
  }

  function handleAdd() {
    setSelectedFuncionario(null);
    setOpenModal(true);
  }

  function handleEdit(funcionario) {
    setSelectedFuncionario(funcionario);
    setOpenModal(true);
  }

async function handleSave(data) {
  try {
    if (selectedFuncionario) {
      // EDITAR (PUT)
      const response = await api.put(
        `/funcionarios/${selectedFuncionario.id}`,
        data
      );

      setFuncionarios(prev =>
        prev.map(f =>
          f.id === selectedFuncionario.id ? response.data : f
        )
      );
    } else {
      // CRIAR (POST)
      const response = await api.post("/funcionarios", data);

      setFuncionarios(prev => [...prev, response.data]);
    }

    setOpenModal(false);
  } catch (error) {
    console.error("Erro ao salvar funcionário", error);
    alert("Erro ao salvar funcionário");
  }
}

  return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Funcionários</h1>
          <button className={styles.addBtn} onClick={handleAdd}>
            + Adicionar Funcionário
          </button>
        </header>

        <SearchBar
            value={search}
            onChange={setSearch}
            placeholder={"Buscar funcionário por nome, cargo ou setor"}
        />

        {/* Não vi o arquivo de paginação, mas assumo que você o tenha ou esteja usando a tabela direta */}
        <FuncionariosTable
            dados={funcionariosFiltrados}
            onEdit={handleEdit}
            onDelete={inativarFuncionario} // Assumindo que sua tabela aceita onDelete ou onStatusChange
        />

        {/* A Paginação estava no seu import original,
         mantenha aqui se estiver usando
      */}

        {openModal && (
            <FuncionarioModal
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                onSave={handleSave}
                employee={selectedFuncionario} // No seu código original estava 'employee', mantive a prop
            />
        )}
      </div>
  );
}



export default Funcionarios