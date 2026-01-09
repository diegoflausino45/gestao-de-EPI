import { useEffect, useState } from "react";
import Modal from "../../../Modal";
import styles from "./style.module.css";
import BiometriaAuthModal from "../../../BiometriaAuthModal";
import { funcionariosMock } from "../../../../data/funcionarioMock"; // Caminho corrigido para 4 níveis

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

export default function EntregasModal({
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
          <form className={styles.form} onSubmit={handleSubmit}>

            {/* Grupo Funcionário */}
            <div className={styles.group}>
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