import { useState, useEffect } from "react";
import { X, Package, Tag, Calendar, Database, AlertCircle, Save, Hash } from "lucide-react";
import styles from "./styles.module.css";
import { atualizarEstoqueMinimo } from "../../../../services/epiApi";

const initialState = {
  codigo: "",
  nome: "",
  tipo: "",
  validadeCA: "",
  estoqueAtual: 0,
  estoqueMinimo: 0,
  status: "OK",
};

export default function EpiModal({ isOpen, onClose, onSave, epi }) {
  const [form, setForm] = useState(initialState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (epi) {
      setForm({ ...initialState, ...epi });
    } else {
      setForm(initialState);
    }
    setError(null);
  }, [epi, isOpen]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      setSaving(true);

      const novoPP = parseFloat(String(form.estoqueMinimo || "0"));
      if (!isFinite(novoPP) || novoPP < 0) {
        setError("Valor inválido para Estoque Mínimo");
        setSaving(false);
        return;
      }

      // Chama a API para atualizar no NEXTSI
      const resp = await atualizarEstoqueMinimo(form.codigo, novoPP);

      if (typeof onSave === "function") {
        const updated = {
          ...form,
          estoqueMinimo: novoPP,
          estoqueAtual: resp.estoqueAtual ?? form.estoqueAtual,
          status: resp.status ?? form.status,
        };
        onSave(updated);
      }

      onClose();
    } catch (err) {
      console.error(err);
      setError(err?.message || "Erro ao salvar alterações no ERP");
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        
        <div className={styles.header}>
          <h2>
            <Package size={24} className={styles.headerIcon} />
            {epi ? "Configurar EPI" : "Novo EPI"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <form id="epiForm" onSubmit={handleSubmit} className={styles.formGrid}>
            
            <div className={styles.group}>
              <label><Hash size={14}/> Código ERP</label>
              <input
                name="codigo"
                value={form.codigo}
                onChange={handleChange}
                readOnly
                className={styles.readOnlyInput}
              />
            </div>

            <div className={styles.group}>
              <label><Tag size={14}/> Nome do Equipamento</label>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                readOnly
                className={styles.readOnlyInput}
              />
            </div>

            <div className={styles.group}>
              <label><Package size={14}/> Tipo/Categoria</label>
              <input
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                readOnly
                className={styles.readOnlyInput}
              />
            </div>

            <div className={styles.group}>
              <label><Calendar size={14}/> Validade CA</label>
              <input
                name="validadeCA"
                value={form.validadeCA}
                onChange={handleChange}
                placeholder="AAAA-MM-DD"
              />
            </div>

            <div className={styles.group}>
              <label><Database size={14}/> Estoque Atual (ERP)</label>
              <input
                name="estoqueAtual"
                value={form.estoqueAtual}
                onChange={handleChange}
                readOnly
                className={styles.readOnlyInput}
              />
            </div>

            <div className={styles.group}>
              <label><AlertCircle size={14}/> Estoque Mínimo (Alerta)</label>
              <input
                name="estoqueMinimo"
                type="number"
                value={form.estoqueMinimo}
                onChange={handleChange}
                placeholder="Ex: 10"
                required
              />
            </div>

            {error && (
              <div className={styles.errorBanner}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </form>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" form="epiForm" className={styles.saveBtn} disabled={saving}>
            {saving ? "Sincronizando..." : (
              <>
                <Save size={18} /> Salvar Alterações
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
