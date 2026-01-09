import { FiArrowDown } from "react-icons/fi";
import styles from "./styles.module.css";
import relatorio from "./relatorio.module.css";

import { EntregasModal } from "../Entregas";
import { EntregasTable } from "../Entregas";

import { useState } from "react";
import { entregasMock } from "../../data/entregasMock";

function RelatorioTable() {

  return (
    <div className={relatorio.tableWrapper}>

      <div className={relatorio.header}>
        <h3>Filtros</h3>
      </div>

      <div className={relatorio.row}>
        <div className={`${relatorio.field} ${relatorio.periodo}`}>
          <label>Período</label>
          <div className={relatorio.periodoInputs}>
            <input type="date" className={relatorio.date} />
            <input type="date" className={relatorio.date} />
          </div>
        </div>
      </div>

      <div className={relatorio.row}>
        <div className={relatorio.field}>
          <label>Funcionário</label>
          <select>
            <option value="">- Selecione -</option>
            <option>João Silva</option>
            <option>Maria Souza</option>
          </select>
        </div>

        <div className={relatorio.field}>
          <label>Setor</label>
          <select>
            <option value="">- Selecione -</option>
            <option>Produção</option>
            <option>Administrativo</option>
            <option>Logística</option>
          </select>
        </div>
      </div>

      <button className={relatorio.button}>Gerar Relatório</button>

    </div>

  );
}



export default function Relatorios() {
  const [entregas, setEntregas] = useState(entregasMock);
  const [openModal, setOpenModal] = useState(false);
  const [selectedEntrega, setSelectedEntrega] = useState(null);
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
        <h1>Relatórios</h1>
        <button className={styles.addBtn}>
          <FiArrowDown/> Exportar...
        </button>
      </header>

      

      <RelatorioTable/>

      <br/>
      <EntregasTable
        dados={entregas}
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
