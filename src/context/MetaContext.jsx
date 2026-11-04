import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const MetaContext = createContext(null);

export function MetaProvider({ children }) {
  const { admin } = useAuth();
  const [entities, setEntities] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!admin) {
      setEntities([]);
      setGroups([]);
      setLoaded(false);
      return;
    }
    api.get('/meta').then(({ data }) => {
      const list = data.data.entities;
      setEntities(list);
      const groupOrder = [];
      list.forEach((e) => {
        if (!groupOrder.includes(e.group)) groupOrder.push(e.group);
      });
      setGroups(groupOrder.map((g) => ({ name: g, entities: list.filter((e) => e.group === g) })));
      setLoaded(true);
    });
  }, [admin]);

  const getEntity = (key) => entities.find((e) => e.key === key);

  return (
    <MetaContext.Provider value={{ entities, groups, loaded, getEntity }}>
      {children}
    </MetaContext.Provider>
  );
}

export const useMeta = () => useContext(MetaContext);
