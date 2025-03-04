import React from 'react'
import { Button } from '../ui/button'
import useGameStore from '@/store/gameStore';
import useRoomStore from '@/store/roomStore';
import { supabase } from '@/lib/supabase';
import type { Phase } from '@/lib/types';

const PlayCardButton = () => {
  const selectedCard = useGameStore(state => state.selectedCard);
  const roomId = useRoomStore.getState().roomId;
  const phase = useGameStore(state => state.phase);
  const myTurn = useGameStore.getState().myTurn;
  const nowTurn = useGameStore(state => state.nowTurn);
  const newNowActionedCards = useGameStore(state => state.newNowActionedCards);
  const setNewNowActionedCards = useGameStore.getState().setNewNowActionedCards;
  const setSelectedDoubleAuction = useGameStore.getState().setSelectedDoubleAuction;
  const setSelectedCard = useGameStore.getState().setSelectedCard;
  const discardCard = useGameStore.getState().discardCard;

  const isButtonDisabled = selectedCard ? false : true;

  const handlePlayCard = async () => {
    if (!selectedCard) return;
    setNewNowActionedCards([...newNowActionedCards, selectedCard]);
    discardCard(selectedCard);

    if (selectedCard.method === "ダブルオークション") {
      setSelectedDoubleAuction(selectedCard);
      setSelectedCard(null);
      return;
    }

    setSelectedCard(null);
    setSelectedDoubleAuction(null);
    
    const phase: Phase = selectedCard.method;

    const { error } = await supabase
      .from('games')
      .update({ nowActionedCards: useGameStore.getState().newNowActionedCards, phase: phase})
      .eq("room_id", roomId);
        
    if (error) {
        console.error("カードプレイエラー", error);
        return;
    }
    setNewNowActionedCards([]);
  }

  return (
    <>
      {(phase == "カード選択") && (nowTurn == myTurn) && (
        <Button
          disabled={isButtonDisabled}
          onClick={handlePlayCard}
          className='fixed bottom-28 right-12 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-r-md transition'
        >
          カードを出す
        </Button>
      )}
    </>
  )
}

export default PlayCardButton