import React from 'react'
import { Button } from './ui/button'
import { useRouter } from "next/navigation";
import useRoomStore from '@/store/roomStore';

const GameStartButton = () => {
  const router = useRouter();
  const { roomId } = useRoomStore();
  const handleGameStart = async () => {
    router.push(`/game/${roomId}`);
  }
  return (
    <Button
      onClick={handleGameStart}
      className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md transition'
    >
        開始
    </Button>
  )
}

export default GameStartButton