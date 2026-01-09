import { useState, useEffect } from "react";
import { useFetch } from "./useFetch";
import { useAPI } from "./useAPI";
import { funcionariosAPI } from "../services/api";

export const useFuncionarios = () => {
  return useFetch(() => funcionariosAPI.list());
};

export const useFuncionarioById = (id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await funcionariosAPI.getById(id);
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

export const useCreateFuncionario = () => {
  return useAPI((data) => funcionariosAPI.create(data));
};

export const useUpdateFuncionario = () => {
  return useAPI(({ id, data }) => funcionariosAPI.update(id, data));
};

export const useDeleteFuncionario = () => {
  return useAPI((id) => funcionariosAPI.delete(id));
};
