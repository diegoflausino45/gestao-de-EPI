import { useState, useEffect } from "react";
import { useFetch } from "./useFetch";
import { useAPI } from "./useAPI";
import { usuariosAPI } from "../services/api";

export const useUsuarios = () => {
  return useFetch(() => usuariosAPI.list());
};

export const useUsuarioById = (id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await usuariosAPI.getById(id);
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

export const useCreateUsuario = () => {
  return useAPI((data) => usuariosAPI.create(data));
};

export const useUpdateUsuario = () => {
  return useAPI(({ id, data }) => usuariosAPI.update(id, data));
};

export const useDeleteUsuario = () => {
  return useAPI((id) => usuariosAPI.delete(id));
};
