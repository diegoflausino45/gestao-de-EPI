import React, { useState, useEffect } from "react";
import { X, User, Briefcase, Layers, Activity, Fingerprint, Save, Shield, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import styles from "./styles.module.css";
import BiometriaService from "../../../../services/BiometriaService";

const initialState = {
  nome: "",
  cpf: "",
  cargo: "",
  setor: "",
  status: "Ativo",
  biometriaTemplate: "",
  epis: [],
  ultimaEntrega: null
};

// Memoized Modal
const FuncionarioModal = React.memo(({ isOpen, onClose, onSave, employee }) => {
  const [form, setForm] = useState(initialState);
  
  // States Biometria
  const [bioStatus, setBioStatus] = useState("idle"); // idle | loading | success | error
  const [bioMessage, setBioMessage] = useState("");
  const [bioImage, setBioImage] = useState(null);

  useEffect(() => {
    if (employee) {
      setForm(employee);
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
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleCapturarDigital() {
    setBioStatus("loading");
    setBioMessage("Posicione o dedo no leitor...");
    setBioImage(null);

    try {
      const status = await BiometriaService.checkStatus();
      if (status.status === 'offline') {
        throw new Error("Driver de biometria não detectado.");
      }

      const dados = await BiometriaService.capturar();

      setForm((prev) => ({ ...prev, biometriaTemplate: dados.template }));
      setBioImage(dados.image);
      setBioStatus("success");
      setBioMessage("Leitura realizada!");
      toast.success("Digital capturada com sucesso!");

    } catch (error) {
      setBioStatus("error");
      setBioMessage(error.message || "Erro na captura");
      toast.error(error.message || "Erro ao capturar digital");
      console.error(error);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        
        <div className={styles.header}>
          <h2>
            <User size={24} className={styles.headerIcon} />
            {employee ? "Editar Funcionário" : "Novo Funcionário"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <form id="funcForm" onSubmit={handleSubmit} className={styles.formGrid}>
            
            {/* DADOS PESSOAIS */}
            <div className={`${styles.group} ${styles.fullWidth}`}>
              <label><User size={14}/> Nome Completo</label>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                required
                placeholder="Ex: João da Silva"
              />
            </div>

            <div className={styles.group}>
              <label><Shield size={14}/> CPF</label>
              <input
                name="cpf"
                value={form.cpf}
                onChange={handleChange}
                required
                placeholder="000.000.000-00"
              />
            </div>

            <div className={styles.group}>
              <label><Briefcase size={14}/> Cargo</label>
              <input
                name="cargo"
                value={form.cargo}
                onChange={handleChange}
                placeholder="Ex: Operador"
              />
            </div>

            <div className={styles.group}>
              <label><Layers size={14}/> Setor</label>
              <input
                name="setor"
                value={form.setor}
                onChange={handleChange}
                placeholder="Ex: Produção"
              />
            </div>

            <div className={styles.group}>
              <label><Activity size={14}/> Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>

            {/* SEÇÃO BIOMETRIA */}
            <div className={`${styles.bioSection} ${styles.fullWidth}`}>
              <div className={styles.bioHeader}>
                <label><Fingerprint size={16}/> Biometria do Colaborador</label>
                <span className={`${styles.bioBadge} ${styles[bioStatus]}`}>
                  {bioStatus === 'idle' && "Não capturado"}
                  {bioStatus === 'loading' && "Aguardando..."}
                  {bioStatus === 'success' && "Biometria Válida"}
                  {bioStatus === 'error' && "Erro na Leitura"}
                </span>
              </div>

              <div className={styles.bioContent}>
                <div className={styles.bioControls}>
                   <p className={styles.bioInstruction}>
                      {bioMessage || "Clique para iniciar a captura da digital."}
                   </p>
                   
                   <button 
                     type="button" 
                     onClick={handleCapturarDigital} 
                     disabled={bioStatus === 'loading'}
                     className={styles.bioBtn}
                   >
                     {bioStatus === 'loading' ? (
                       <><Loader2 size={18} className={styles.spin} /> Lendo...</>
                     ) : (
                       <><Fingerprint size={18} /> Capturar Digital</>
                     )}
                   </button>
                </div>

                <div className={styles.bioPreview}>
                   {bioImage ? (
                     <img src={bioImage} alt="Digital" />
                   ) : (
                     <div className={styles.emptyPreview}>
                       <Fingerprint size={32} strokeWidth={1} />
                     </div>
                   )}
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="funcForm" className={styles.saveBtn}>
            <Save size={18} /> Salvar
          </button>
        </div>

      </div>
    </div>
  );
});

export default FuncionarioModal;