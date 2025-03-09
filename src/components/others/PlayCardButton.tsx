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
  const selectedCardIndex = useGameStore(state => state.selectedCardIndex);
  const setSelectedCardIndex = useGameStore.getState().setSelectedCardIndex;

  const isButtonDisabled = selectedCard ? false : true;
  let isButtonVisible = (phase === "カード選択" && nowTurn === myTurn) || 
                        (phase === "ダブルオークション" && doubleAuctionState.nowPlayer === myTurn)

  const handlePlayCard = async () => {
    if (phase === "カード選択") {
      if (!selectedCard || selectedCardIndex === null ) return;
      setNewNowActionedCards([...newNowActionedCards, selectedCard]);
      discardCard(selectedCardIndex);

      if (selectedCard.method === "ダブルオークション") {
        setSelectedDoubleAuction(selectedCard);
        setSelectedCard(null);
        setSelectedCardIndex(null);

        return;
      }

      isButtonVisible = false;

      if (selectedCard.method === "公開競り" || selectedCard.method === "入札" || selectedCard.method === "指し値") {
        const hands = useGameStore.getState().hands;

        const { error } = await supabase
          .from('games')
          .update({nowActionedCards: useGameStore.getState().newNowActionedCards, phase: selectedCard.method, hands: hands})
          .eq("room_id", roomId);
          
        if (error) {
            console.error("カードプレイエラー", error);
            return;
        }
      }
      else if (selectedCard.method === "一声") {
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
            hands: useGameStore.getState().hands,
            oneVoiceAuctionState: newOneVoiceAuctionState,
          })
          .eq("room_id", roomId);
          
        if (error) {
            console.error("カードプレイエラー", error);
            return;
        }
      }

      setSelectedCard(null);
      setSelectedCardIndex(null);
      setSelectedDoubleAuction(null);
      setNewNowActionedCards([]);
    }
    else if (phase === "ダブルオークション") {
      if (!selectedCard || selectedCardIndex === null) return;

      isButtonVisible = false;

      discardCard(selectedCardIndex);

      const newDoubleAuctionState: DoubleAuction = {
        nowPlayer: getNextTurn(myTurn, players.length),
        daCard: doubleAuctionState.daCard,
        selectCard: selectedCard,
      }

      const { error } = await supabase
        .from('games')
        .update({hands: useGameStore.getState().hands,  doubleAuctionState: newDoubleAuctionState,})
        .eq("room_id", roomId);
        
      if (error) {
          console.error("カードプレイエラー", error);
          return;
      }

      setSelectedCard(null);
      setSelectedCardIndex(null);
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
          hands: useGameStore.getState().hands,
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