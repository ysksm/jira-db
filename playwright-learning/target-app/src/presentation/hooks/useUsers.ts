import { useState, useEffect, useCallback } from 'react';
import { User } from '../../domain/entities/User';
import { useContainer } from '../../di/ContainerContext';

export function useUsers() {
  const { userRepository } = useContainer();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await userRepository.findAll();
    setUsers(data);
    setLoading(false);
  }, [userRepository]);

  useEffect(() => { load(); }, [load]);

  const deleteUser = async (id: string) => {
    await userRepository.delete(id);
    await load();
  };

  const saveUser = async (user: User) => {
    await userRepository.save(user);
    await load();
  };

  return { users, loading, deleteUser, saveUser, reload: load };
}
