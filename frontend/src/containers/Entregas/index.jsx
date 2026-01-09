import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import modalcss from "./modalcss.module.css";
import table from "./table.module.css";

import SearchBar from "../../components/SearchBar";
import Modal from "../../components/Modal";
import BiometriaAuthModal from "../../components/BiometriaAuthModal";

import { entregasMock } from "../../data/entregasMock";
import { funcionariosMock } from "../../data/funcionarioMock"; // Caminho corrigido para 4 níveis


const initialState = {
  funcionario: {
    nome: ""
  },
  epi: {
    nome: ""
  },
  quantidade: 1,
  dataEntrega: "",
  responsavel: ""
};

function EntregasModal({
                                        isOpen,
                                        onClose,
                                        onSave,
                                        entrega
                                      }) {
  const [form, setForm] = useState(initialState);
  
  // Controle da Autenticação Biométrica
  const [showBioAuth, setShowBioAuth] = useState(false);
  const [currentUserTemplate, setCurrentUserTemplate] = useState(null);

  // Carrega os dados quando abre o modal para edição
  useEffect(() => {
    if (entrega) {
      setForm(entrega);
    } else {
      setForm(initialState);
    }
    // Resetar estados auxiliares ao abrir/fechar
    setShowBioAuth(false);
    setCurrentUserTemplate(null);
  }, [entrega, isOpen]);

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "nome") {
      setForm((prev) => ({
        ...prev,
        funcionario: { ...prev.funcionario, nome: value }
      }));
      return;
    }

    if (name === "epi.nome") {
      setForm((prev) => ({
        ...prev,
        epi: { ...prev.epi, nome: value }
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    
    // 1. Busca o funcionário no Mock para ver se tem digital
    // (Num sistema real, o backend retornaria isso ou o ID viria de um select)
    const funcionarioEncontrado = funcionariosMock.find(
        f => f.nome.toLowerCase() === form.funcionario.nome.toLowerCase()
    );

    if (funcionarioEncontrado && funcionarioEncontrado.biometriaTemplate) {
      // TEM DIGITAL: Exige autenticação
      setCurrentUserTemplate(funcionarioEncontrado.biometriaTemplate);
      setShowBioAuth(true);
    } else {
      // NÃO TEM DIGITAL ou NÃO ACHOU: Salva direto (ou poderia bloquear)
      // Aqui vamos permitir salvar mas com um aviso no console
      console.warn("Funcionário sem digital ou não encontrado. Salvando sem biometria.");
      finalizarSalvamento();
    }
  }

  function finalizarSalvamento() {
    onSave(form);
    onClose();
    setShowBioAuth(false);
  }

  return (
      <>
        {/* Modal Principal de Edição */}
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={entrega ? "Editar Entrega" : "Nova Entrega"}
        >
          <form className={modalcss.form} onSubmit={handleSubmit}>

            {/* Grupo Funcionário */}
            <div className={modalcss.group}>
              <label>Funcionário</label>
              <input
                  name="nome"
                  placeholder="Nome do Colaborador (Ex: Carlos Souza)"
                  value={form.funcionario.nome}
                  onChange={handleChange}
                  required
                  list="funcionarios-list" // Datalist para facilitar teste
              />
              <datalist id="funcionarios-list">
                {funcionariosMock.map(f => <option key={f.id} value={f.nome} />)}
              </datalist>
            </div>

            {/* Grupo EPI */}
            <div className={modalcss.group}>
              <label>EPI</label>
              <input
                  name="epi.nome"
                  placeholder="Nome do Equipamento"
                  value={form.epi.nome}
                  onChange={handleChange}
                  required
              />
            </div>

            {/* Grupo Quantidade (Number) */}
            <div className={modalcss.group}>
              <label>Quantidade</label>
              <input
                  name="quantidade"
                  type="number"
                  min="1"
                  value={form.quantidade}
                  onChange={handleChange}
                  required
              />
            </div>

            {/* Grupo Data (Date Picker) */}
            <div className={modalcss.group}>
              <label>Data da Entrega</label>
              <input
                  name="dataEntrega"
                  type="date"
                  value={form.dataEntrega}
                  onChange={handleChange}
                  required
              />
            </div>

            {/* Grupo Responsável */}
            <div className={modalcss.group}>
              <label>Responsável pela Entrega</label>
              <input
                  name="responsavel"
                  placeholder="Ex: Almoxarife"
                  value={form.responsavel}
                  onChange={handleChange}
                  required
              />
            </div>

            <div className={modalcss.actions}>
              <button type="button" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className={modalcss.primary}>
                Confirmar Entrega
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal de Autenticação Biométrica (Overlay) */}
        <BiometriaAuthModal 
            isOpen={showBioAuth}
            onClose={() => setShowBioAuth(false)}
            onSuccess={finalizarSalvamento}
            userTemplate={currentUserTemplate}
            userName={form.funcionario.nome}
        />
      </>
  );
}

function EntregasTable({ dados = [], onView }) { // Valor padrão para evitar erro se dados for undefined

  // Verifica se a lista está vazia para mostrar mensagem amigável
  if (dados.length === 0) {
    return (
        <div className={table.tableWrapper}>
          <p className={table.emptyMessage}>Nenhuma entrega encontrada.</p>
        </div>
    );
  }

  return (
      <div className={table.tableWrapper}>
        <table>
          <thead>
          <tr>
            <th>Funcionário</th>
            <th>EPI</th>
            <th>Quantidade</th>
            <th>Data</th>
            <th>Responsável</th>
            <th>Ações</th>
          </tr>
          </thead>

          <tbody>
          {dados.map((f) => (
              <tr key={f.id}>
                {/* O ?. evita erro se o objeto for nulo */}
                <td>{f.funcionario?.nome || "---"}</td>
                <td>{f.epi?.nome || "---"}</td>
                <td>{f.quantidade}</td>
                {/* Sugestão: Formatar a data para o padrão BR aqui ou no backend */}
                <td>{f.dataEntrega}</td>
                <td>{f.responsavel}</td>
                <td className={table.actions}>
                  <button className={table.viewBtn} onClick={() => onView(f)}>
                    Visualizar
                  </button>
                </td>
              </tr>
          ))}
          </tbody>
        </table>
      </div>
  );
}



function Entregas() {
  const [entregas, setEntregas] = useState(entregasMock);
  const [openModal, setOpenModal] = useState(false);
  const [selectedEntrega, setSelectedEntrega] = useState(null);
  const [search, setSearch] = useState("");
  const entregasFiltradas = entregas.filter(e =>
    e.funcionario.nome.toLowerCase().includes(search.toLowerCase()) ||
    e.epi.nome.toLowerCase().includes(search.toLowerCase()) ||
    e.responsavel.toLowerCase().includes(search.toLowerCase())
  );



    function handleAdd() {
    setSelectedEntrega(null);
    setOpenModal(true);
  }

  function handleEdit(entregas) {
    setSelectedEntrega(entregas);
    setOpenModal(true);
  }

  function handleSave(data) {
    if (selectedEntrega) {
      // editar
      setEntregas(prev =>
        prev.map(f =>
          f.id === selectedEntrega.id
            ? { ...data, id: f.id }
            : f
        )
      );
    } else {
      // adicionar
      setEntregas(prev => [
        ...prev,
        { ...data, id: Date.now(), status: "ativo" }
      ]);
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Entregas</h1>
        <button className={styles.addBtn} onClick={handleAdd}>
          + Nova Entrega
        </button>
      </header>

      <SearchBar value={search} onChange={setSearch} placeholder={"Buscar entrega..."} />

      <EntregasTable
        dados={entregasFiltradas}
        onView={handleEdit}
      />

      <EntregasModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSave={handleSave}
        entrega={selectedEntrega}
      />
    </div>
  );
}


export  {EntregasTable, EntregasModal}
export default Entregas