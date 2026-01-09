import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import table from "./table.module.css";
import modalcss from "./modal.module.css";

import SearchBar from "../../components/SearchBar";
import Modal from "../../components/Modal";
import { epiMock } from "../../data/epiMock";


const initialState = {
  nome: "",
  categoria: "",
  ca: "",
  validadeCA: "",
  estoqueAtual: 0,
  estoqueMinimo: 0,
  status: "OK"
};

function EpiModal({
  isOpen,
  onClose,
  onSave,
  epi
}) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (epi) {
      setForm(epi);
    } else {
      setForm(initialState);
    }
  }, [epi]);
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      title={epi ? "Editar EPI" : "Novo EPI"}
    >
      <form className={modalcss.form} onSubmit={handleSubmit}>
        <div className={modalcss.group}>
          <label>Nome</label>
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
          />
        </div>

        <div className={modalcss.group}>
          <label>Tipo</label>
          <input
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            required
          />
        </div>

        <div className={modalcss.group}>
          <label>Validade</label>
          <input
            name="validadeCA"
            value={form.validadeCA}
            onChange={handleChange}
          />
        </div>

        <div className={modalcss.group}>
          <label>Estoque Atual</label>
          <input
            name="estoqueAtual"
            value={form.estoqueAtual}
            onChange={handleChange}
          />
        </div>

        <div className={modalcss.group}>
          <label>Estoque Minímo</label>
          <input
            name="estoqueMinimo"
            value={form.estoqueMinimo}
            onChange={handleChange}
          />
        </div>

        <div className={modalcss.actions}>
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className={modalcss.primary}>
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EpiTable({dados, onEdit}) {

  return (
    <div className={table.tableWrapper}>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Validade</th>
            <th>Estoque Atual</th>
            <th>Estoque Minimo</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {dados.map(f => (
            <tr key={f.id} >
              <td>{f.nome}</td>
              <td>{f.categoria}</td>
              <td>{f.validadeCA}</td>
              <td>{f.estoqueAtual}</td>
              <td>{f.estoqueMinimo}</td>
              <td>{f.status}</td>
              <td className={table.actions}>
                <button className={table.editBtn} onClick={() => onEdit(f)}>
                  Editar
                </button>

                <button className={table.deleteBtn}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EPIs() {
  const [search, setSearch] = useState("");

  const [epi, setEpi] = useState(epiMock);
  const [openModal, setOpenModal] = useState(false);
  const [selectedEpi, setSelectedEpi] = useState(null);

  const epiFiltrados = epiMock.filter(e =>
    e.nome.toLowerCase().includes(search.toLowerCase()) ||
    e.categoria.toLowerCase().includes(search.toLowerCase())
  );


    function handleAdd() {
    setSelectedEpi(null);
    setOpenModal(true);
  }

  function handleEdit(epi) {
    setSelectedEpi(epi);
    setOpenModal(true);
  }

  function handleSave(data) {
    if (selectedEpi) {
      // editar
      setEpi(prev =>
        prev.map(f =>
          f.id === selectedEpi.id
            ? { ...data, id: f.id }
            : f
        )
      );
    } else {
      // adicionar
      setEpi(prev => [
        ...prev,
        { ...data, id: Date.now(), status: "OK" }
      ]);
    }
  }


  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>EPIs</h1>
        <button className={styles.addBtn} onClick={handleAdd}>
          + Adicionar EPI
        </button>
      </header>

      <SearchBar value={search} onChange={setSearch} placeholder={"Buscar EPI..."}/>

      <EpiTable
        dados={epiFiltrados} 
        onEdit={handleEdit}
      />

      <EpiModal 
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSave={handleSave}
        epi={selectedEpi}/>
    </div>
  );
}



export default EPIs