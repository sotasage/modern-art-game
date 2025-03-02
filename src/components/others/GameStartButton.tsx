import React from 'react'
import { Button } from '../ui/button'
import useRoomStore from '@/store/roomStore';
import usePlayerStore from '@/store/playerStore';
import useGameStore from '@/store/gameStore';
import { startGame } from '@/lib/game/gameFunctions';
import { supabase } from '@/lib/supabase';

const GameStartButton = () => {
  const roomId = useRoomStore(state => state.roomId);
  const members = useRoomStore(state => state.members);
  const setIsLoading = usePlayerStore(state => state.setIsLoading);
  const isRoomMaster = usePlayerStore(state => state.isRoomMaster);
  const marketValueList = useGameStore(state => state.marketValueList);

  const isButtonEnabled = members.length >= 3;

  const money: number[] = Array.from({ length: members.length }, () => 100000);

  const handleGameStart = async () => {
    setIsLoading(true);

    const { updatedPlayers, remainingDeck } = startGame(members);
    if (isRoomMaster) {
      const { error: gameSettingError } = await supabase
        .from("games")
        .insert({room_id: roomId, deck: remainingDeck, players: updatedPlayers, money: money, marketValueList: marketValueList});
      if (gameSettingError) {
          console.error("ゲーム設定エラー", gameSettingError);
          return;
      }

      const { error: gameStartError } = await supabase
        .from("rooms")
        .update({status: "start"})
        .eq("id", roomId);
      if (gameStartError) {
          console.error("ゲーム開始エラー", gameStartError);
          return;
      }
    }
  }
  return (
    <Button
      disabled={!isButtonEnabled}
      onClick={handleGameStart}
      className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md transition'
    >
        開始
    </Button>
  )
}

export default GameStartButton