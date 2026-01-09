import { useState, useEffect } from "react";
import { useFetch } from "./useFetch";
import { useAPI } from "./useAPI";
import { episAPI, entregasAPI, devolucoesAPI, tiposEpiAPI } from "../services/api";

export const useEPIs = () => {
  return useFetch(() => episAPI.list());
};

export const useEPIById = (id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await episAPI.getById(id);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  return { data, loading, error };
};

export const useCreateEPI = () => {
  return useAPI((data) => episAPI.create(data));
};

export const useUpdateEPI = () => {
  return useAPI(({ id, data }) => episAPI.update(id, data));
};

export const useDeleteEPI = () => {
  return useAPI((id) => episAPI.delete(id));
};

export const useTiposEPI = () => {
  return useFetch(() => tiposEpiAPI.list());
};

export const useEntregas = () => {
  return useFetch(() => entregasAPI.list());
};

export const useEntregasByFuncionario = (funcionarioId) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await entregasAPI.getByFuncionario(funcionarioId);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    if (funcionarioId) fetchData();
  }, [funcionarioId]);

  return { data, loading, error };
};

export const useCreateEntrega = () => {
  return useAPI((data) => entregasAPI.create(data));
};

export const useDeleteEntrega = () => {
  return useAPI((id) => entregasAPI.delete(id));
};

export const useDevolucoes = () => {
  return useFetch(() => devolucoesAPI.list());
};

export const useDevolucoessByFuncionario = (funcionarioId) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await devolucoesAPI.getByFuncionario(funcionarioId);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    if (funcionarioId) fetchData();
  }, [funcionarioId]);

  return { data, loading, error };
};

export const useCreateDevolucao = () => {
  return useAPI((data) => devolucoesAPI.create(data));
};

export const useDeleteDevolucao = () => {
  return useAPI((id) => devolucoesAPI.delete(id));
};
