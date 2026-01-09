import { useEffect, useState } from "react";
import Modal from "../../../Modal";
import styles from "./style.module.css";
// Certifique-se de ter instalado: npm install react-icons
import { FaFingerprint, FaCheckCircle, FaExclamationTriangle, FaSpinner } from "react-icons/fa";

// IMPORTANDO O SERVIÇO DE BIOMETRIA
import BiometriaService from "../../../../services/BiometriaService";

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

export default function FuncionarioModal({ isOpen, onClose, onSave, employee }) {
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
        <form className={styles.form} onSubmit={handleSubmit}>

          {/* --- DADOS PESSOAIS --- */}
          <div className={styles.group}>
            <label>Nome Completo</label>
            <input
                name="nome"
                value={form.nome || ""}
                onChange={handleChange}
                required
                placeholder="Ex: João da Silva"
            />
          </div>

          <div className={styles.group}>
            <label>CPF</label>
            <input
                name="cpf"
                value={form.cpf || ""}
                onChange={handleChange}
                required
                placeholder="000.000.000-00"
            />
          </div>

          <div className={styles.group}>
            <label>Cargo</label>
            <input
                name="cargo"
                value={form.cargo || ""}
                onChange={handleChange}
                placeholder="Ex: Operador de Máquinas"
            />
          </div>

          <div className={styles.group}>
            <label>Setor</label>
            <input
                name="setor"
                value={form.setor || ""}
                onChange={handleChange}
                placeholder="Ex: Produção"
            />
          </div>

          <div className={styles.group}>
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
          <div className={styles.biometriaSection}>
            <label>Biometria</label>

            <div className={styles.biometriaContainer}>
              {/* Botão de Captura */}
              <button
                  type="button"
                  onClick={handleCapturarDigital}
                  disabled={bioStatus === 'loading'}
                  className={`${styles.btnBio} ${styles[bioStatus] || ''}`}
              >
                {bioStatus === 'loading' ? <FaSpinner className={styles.spin} /> : <FaFingerprint />}
                {bioStatus === 'loading' ? "Lendo..." : "Capturar Digital"}
              </button>

              {/* Feedback Visual (Mensagem) */}
              <div className={styles.bioFeedback}>
                {bioStatus === 'success' && <FaCheckCircle className={styles.iconSuccess} />}
                {bioStatus === 'error' && <FaExclamationTriangle className={styles.iconError} />}
                <span>{bioMessage}</span>
              </div>
            </div>

            {/* Preview da Imagem da Digital */}
            {bioImage && (
                <div className={styles.digitalPreview}>
                  <p>Digital Capturada:</p>
                  <img src={bioImage} alt="Preview Digital" />
                </div>
            )}
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.primary}>Salvar</button>
          </div>
        </form>
      </Modal>
  );
}