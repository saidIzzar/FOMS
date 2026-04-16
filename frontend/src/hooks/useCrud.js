import { useState, useCallback } from 'react';

export function useCrud(apiMethods) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiMethods.getAll();
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiMethods]);

  const create = useCallback(async (item) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiMethods.create(item);
      setData(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to create');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiMethods]);

  const update = useCallback(async (id, item) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiMethods.update(id, item);
      setData(prev => prev.map(d => d.id === parseInt(id) ? response.data : d));
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to update');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiMethods]);

  const remove = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiMethods.delete(id);
      setData(prev => prev.filter(d => d.id !== parseInt(id)));
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiMethods]);

  const getById = useCallback(async (id) => {
    try {
      const response = await apiMethods.getById(id);
      return response.data;
    } catch (err) {
      throw err;
    }
  }, [apiMethods]);

  const setDataDirect = useCallback((newData) => {
    setData(newData);
  }, []);

  return {
    data,
    setData: setDataDirect,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove,
    getById
  };
}

export default useCrud;