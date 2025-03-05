import React from 'react'
import { Button } from '../ui/button'
import useGameStore from '@/store/gameStore';
import useRoomStore from '@/store/roomStore';
import { supabase } from '@/lib/supabase';
import { DoubleAuction, OneVoiceAuction } from '@/lib/types';
import { getNextTurn } from '@/lib/game/gameFunctions';

const PlayCardButton = () => {
  const selectedCard = useGameStore(state => state.selectedCard);
  const roomId = useRoomStore.getState().roomId;
  const phase = useGameStore(state => state.phase);
  const myTurn = useGameStore.getState().myTurn;
  const nowTurn = useGameStore(state => state.nowTurn);
  const newNowActionedCards = useGameStore(state => state.newNowActionedCards);
  const selectedDoubleAuction = useGameStore(state => state.selectedDoubleAuction);
  const setNewNowActionedCards = useGameStore.getState().setNewNowActionedCards;
  const setSelectedDoubleAuction = useGameStore.getState().setSelectedDoubleAuction;
  const setSelectedCard = useGameStore.getState().setSelectedCard;
  const discardCard = useGameStore.getState().discardCard;
  const players = useGameStore.getState().players;
  const doubleAuctionState = useGameStore(state => state.doubleAuctionState);

  const isButtonDisabled = selectedCard ? false : true;
  let isButtonVisible = (phase === "カード選択" && nowTurn === myTurn) || 
                        (phase === "ダブルオークション" && doubleAuctionState.nowPlayer === myTurn)

  const handlePlayCard = async () => {
    if (phase === "カード選択") {
      if (!selectedCard) return;
      setNewNowActionedCards([...newNowActionedCards, selectedCard]);
      discardCard(selectedCard);

      if (selectedCard.method === "ダブルオークション") {
        setSelectedDoubleAuction(selectedCard);
        setSelectedCard(null);
        return;
      }

      isButtonVisible = false;

      if (selectedCard.method === "公開競り" || selectedCard.method === "入札" || selectedCard.method === "指し値") {
        const { error } = await supabase
          .from('games')
          .update({nowActionedCards: useGameStore.getState().newNowActionedCards, phase: selectedCard.method})
          .eq("room_id", roomId);
          
        if (error) {
            console.error("カードプレイエラー", error);
            return;
        }
      }
      else if (selectedCard.method === "一声") {
        isButtonVisible = false;

        const newOneVoiceAuctionState: OneVoiceAuction = {
          nowPlayer: getNextTurn(myTurn, useGameStore.getState().players.length),
          maxPlayer: myTurn,
          maxBetSize: 0,
        };

        const { error } = await supabase
          .from('games')
          .update({
            nowActionedCards: useGameStore.getState().newNowActionedCards,
            phase: selectedCard.method,
            oneVoiceAuctionState: newOneVoiceAuctionState,
          })
          .eq("room_id", roomId);
          
        if (error) {
            console.error("カードプレイエラー", error);
            return;
        }
      }

      setSelectedCard(null);
      setSelectedDoubleAuction(null);
      setNewNowActionedCards([]);
    }
    else if (phase === "ダブルオークション") {
      if (!selectedCard) return;

      isButtonVisible = false;

      discardCard(selectedCard);

      const newDoubleAuctionState: DoubleAuction = {
        nowPlayer: getNextTurn(myTurn, players.length),
        daCard: doubleAuctionState.daCard,
        selectCard: selectedCard,
      }

      const { error } = await supabase
        .from('games')
        .update({doubleAuctionState: newDoubleAuctionState,})
        .eq("room_id", roomId);
        
      if (error) {
          console.error("カードプレイエラー", error);
          return;
      }

      setSelectedCard(null);
    }
  }

  const pass = async () => {
    if (phase === "カード選択") {
      if (!selectedDoubleAuction) return;

      isButtonVisible = false;

      const newDoubleAuctionState: DoubleAuction = {
        nowPlayer: getNextTurn(myTurn, players.length),
        daCard: selectedDoubleAuction,
        selectCard: null,
      }

      const { error } = await supabase
        .from('games')
        .update({
          nowActionedCards: useGameStore.getState().newNowActionedCards,
          phase: "ダブルオークション",
          doubleAuctionState: newDoubleAuctionState,
        })
        .eq("room_id", roomId);
        
      if (error) {
          console.error("カードプレイエラー", error);
          return;
      }

      setSelectedDoubleAuction(null);
      setNewNowActionedCards([]);
    }
    else if (phase === "ダブルオークション") {
      isButtonVisible = false;

      const newDoubleAuctionState: DoubleAuction = {
        nowPlayer: getNextTurn(myTurn, players.length),
        daCard: doubleAuctionState.daCard,
        selectCard: null,
      }

      const { error } = await supabase
        .from('games')
        .update({doubleAuctionState: newDoubleAuctionState,})
        .eq("room_id", roomId);
        
      if (error) {
          console.error("カードプレイエラー", error);
          return;
      }
    }
  }

  return (
    <>
      {isButtonVisible && (
        <div className='flex justify-center gap-3 fixed bottom-28 right-6'>
          <Button
            disabled={isButtonDisabled}
            onClick={handlePlayCard}
            className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-r-md transition'
          >
            カードを出す
          </Button>
          {(selectedDoubleAuction || phase === "ダブルオークション") && <Button
              className=' bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-r-md transition'
              onClick={pass}
          >
              出さない
          </Button>}
        </div>
      )}
    </>
  )
}

export default PlayCardButton