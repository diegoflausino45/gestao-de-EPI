import { useState, useEffect } from "react";
import { useFetch } from "./useFetch";
import { useAPI } from "./useAPI";
import { setoresAPI } from "../services/api";

export const useSetores = () => {
  return useFetch(() => setoresAPI.list());
};

export const useSetorById = (id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await setoresAPI.getById(id);
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

export const useCreateSetor = () => {
  return useAPI((data) => setoresAPI.create(data));
};

export const useUpdateSetor = () => {
  return useAPI(({ id, data }) => setoresAPI.update(id, data));
};

export const useDeleteSetor = () => {
  return useAPI((id) => setoresAPI.delete(id));
};
