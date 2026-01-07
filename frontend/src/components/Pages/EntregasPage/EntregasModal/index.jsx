import { useEffect, useState } from "react";
import Modal from "../../../Modal"; // Verifique se o caminho do seu componente Modal está correto aqui
import styles from "./style.module.css";

const initialState = {
  funcionario: {
    nome: ""
  },
  epi: {
    nome: ""
  },
  quantidade: 1, // Melhor começar com 1 do que 0
  dataEntrega: "", // String vazia é o padrão correto para input type="date"
  responsavel: ""
};

export default function EntregasModal({
                                        isOpen,
                                        onClose,
                                        onSave,
                                        entrega
                                      }) {
  const [form, setForm] = useState(initialState);

  // Carrega os dados quando abre o modal para edição
  useEffect(() => {
    if (entrega) {
      setForm(entrega);
    } else {
      setForm(initialState);
    }
  }, [entrega, isOpen]); // Adicionei isOpen para garantir reset ao abrir

  function handleChange(e) {
    const { name, value } = e.target;

    // Lógica específica para o objeto aninhado 'funcionario'
    if (name === "nome") {
      setForm((prev) => ({
        ...prev,
        funcionario: {
          ...prev.funcionario,
          nome: value
        }
      }));
      return;
    }

    // Lógica específica para o objeto aninhado 'epi'
    if (name === "epi.nome") {
      setForm((prev) => ({
        ...prev,
        epi: {
          ...prev.epi,
          nome: value
        }
      }));
      return;
    }

    // Lógica padrão para campos simples (quantidade, data, responsavel)
    setForm((prev) => ({ ...prev, [name]: value }));
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
          title={entrega ? "Editar Entrega" : "Nova Entrega"}
      >
        <form className={styles.form} onSubmit={handleSubmit}>

          {/* Grupo Funcionário */}
          <div className={styles.group}>
            <label>Funcionário</label>
            <input
                name="nome"
                placeholder="Nome do Colaborador"
                value={form.funcionario.nome}
                onChange={handleChange}
                required
            />
          </div>

          {/* Grupo EPI */}
          <div className={styles.group}>
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
          <div className={styles.group}>
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
          <div className={styles.group}>
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
          <div className={styles.group}>
            <label>Responsável pela Entrega</label>
            <input
                name="responsavel"
                placeholder="Ex: Almoxarife"
                value={form.responsavel}
                onChange={handleChange}
                required
            />
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.primary}>
              Salvar
            </button>
          </div>
        </form>
      </Modal>
  );
}