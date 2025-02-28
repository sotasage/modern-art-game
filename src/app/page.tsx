"use client"

import InputUserName from '@/components/InputUserName';
import usePlayerStore from '@/store/playerStore';
import { useEffect } from 'react';

export default function Home() {
  const { isLoading, setIsLoading } = usePlayerStore();
  useEffect(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <InputUserName mode="create" roomId="" />
  );
}
