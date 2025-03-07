import React from 'react'
import { Button } from '../ui/button'
import useRoomStore from '@/store/roomStore';
import usePlayerStore from '@/store/playerStore';
import { startGame } from '@/lib/game/gameFunctions';
import { supabase } from '@/lib/supabase';
import type { BidAuction, Card, OneVoiceAuction, Phase, PublicAuction, SpecifyAuction } from '@/lib/types';
import { sortCard } from '@/lib/game/cardFunctions';
import { DoubleAuction } from '../../lib/types';

const GameStartButton = () => {
  const roomId = useRoomStore.getState().roomId;
  const members = useRoomStore(state => state.members);
  const setIsLoading = usePlayerStore.getState().setIsLoading;
  const isRoomMaster = usePlayerStore(state => state.isRoomMaster);

  const isButtonEnabled = members.length >= 3;

  const money: number[] = Array.from({ length: members.length }, () => 100000);
  const marketValueList = Array.from({ length: 4 }, () => ({
    diamond: null,
    emerald: null,
    sapphire: null,
    ruby: null,
    amethyst: null
  }));
  const purchasedCards: Card[][] = Array.from({ length: members.length }, () => []);
  const nowActionedCards: Card[] = [];
  const phase: Phase = "カード選択";
  const publicAuctionState: PublicAuction[] = Array.from({ length: members.length }, () => ({
    betSize: 0,
    isFinished: false,
  }));
  const oneVoiceAuctionState: OneVoiceAuction = { nowPlayer: -1, maxPlayer: -1, maxBetSize: -1 };
  const bidAuctionState:  BidAuction[] = Array.from({ length: members.length }, () => ({
    isDecided: false,
    betSize: 0,
  }));
  const specifyAuctionState: SpecifyAuction = { nowPlayer: -1, betSize: -1, isPurchased: false };
  const doubleAuctionState: DoubleAuction = { nowPlayer: -1, daCard: null, selectCard: null };

  const handleGameStart = async () => {
    setIsLoading(true);

    const { updatedPlayers, updatedHands, remainingDeck } = startGame(members);
    const newHands = updatedHands.map(hand => sortCard(hand));

    if (isRoomMaster) {
      const { error: gameSettingError } = await supabase
        .from("games")
        .insert({
          room_id: roomId,
          deck: remainingDeck,
          hands: newHands,
          players: updatedPlayers,
          money: money,
          marketValueList: marketValueList,
          purchasedCards: purchasedCards,
          nowActionedCards: nowActionedCards,
          phase: phase,
          publicAuctionState: publicAuctionState,
          oneVoiceAuctionState: oneVoiceAuctionState,
          bidAuctionState: bidAuctionState,
          specifyAuctionState: specifyAuctionState,
          doubleAuctionState: doubleAuctionState,
          round: 0,
        });
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