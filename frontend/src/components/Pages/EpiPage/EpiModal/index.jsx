import { useEffect, useState } from "react";
import Modal from "../../../Modal";
import styles from "./style.module.css";
import { atualizarEstoqueMinimo } from "../../../../services/epiApi";

const initialState = {
  codigo: "",
  nome: "",
  tipo: "",
  ca: "",
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
      // Garantir que tenhamos as chaves esperadas
      setForm({ ...initialState, ...epi });
    } else {
      setForm(initialState);
    }
  }, [epi]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      setSaving(true);

      // Normalizar valor numérico
      const novoPP = parseFloat(String(form.estoqueMinimo || "0"));
      if (!isFinite(novoPP) || novoPP < 0) {
        setError("Valor inválido para Estoque Mínimo");
        setSaving(false);
        return;
      }

      // Chama a API para atualizar no NEXTSI e usa o retorno para atualizar status/estoque
      const resp = await atualizarEstoqueMinimo(form.codigo, novoPP);

      // Notifica o pai para atualizar a lista (onSave espera o objeto atualizado)
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
      setError(err?.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={epi ? "Editar EPI" : "Novo EPI"}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.group}>
          <label>Codigo</label>
          <input
            name="codigo"
            value={form.codigo}
            onChange={handleChange}
            readOnly
          />
        </div>
        <div className={styles.group}>
          <label>Nome</label>
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            readOnly
          />
        </div>

        <div className={styles.group}>
          <label>Tipo</label>
          <input
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            readOnly
          />
        </div>

        <div className={styles.group}>
          <label>Validade</label>
          <input
            name="validadeCA"
            value={form.validadeCA}
            onChange={handleChange}
          />
        </div>

        <div className={styles.group}>
          <label>Estoque Atual</label>
          <input
            name="estoqueAtual"
            value={form.estoqueAtual}
            onChange={handleChange}
            readOnly
          />
        </div>

        <div className={styles.group}>
          <label>Estoque Minímo</label>
          <input
            name="estoqueMinimo"
            value={form.estoqueMinimo}
            onChange={handleChange}
          />
        </div>

        {error && <div className={styles.formError}>{error}</div>}

        <div className={styles.actions}>
          <button type="button" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className={styles.primary} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
