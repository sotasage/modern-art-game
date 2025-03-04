"use client"

import React, { useEffect } from 'react'
import usePlayerStore from '@/store/playerStore';
import PlayerHand from '@/components/others/PlayerHand';
import PossessedMoney from '@/components/others/PossessedMoney';
import MarketValueTable from '@/components/others/MarketValueTable';
import NowActionedCards from '@/components/others/NowActionedCards';
import PurchasedCards from '@/components/others/PurchasedCards';
import MessageBoard from '@/components/others/MessageBoard';
import PlayCardButton from '@/components/others/PlayCardButton';
import useGameStore from '@/store/gameStore';
import useRoomStore from '@/store/roomStore';
import { supabase } from '@/lib/supabase';

const GamePage = () => {
    const isLoading = usePlayerStore(state => state.isLoading);

    useEffect(() => {
        (async () => {
            const roomId = useRoomStore.getState().roomId
            const playerId = usePlayerStore.getState().playerId;
            const setIsLoading = usePlayerStore.getState().setIsLoading;
            const setMyTurn = useGameStore.getState().setMyTurn;
            const fetchGameData = useGameStore.getState().fetchGameData;
            const setNowActionedCards = useGameStore.getState().setNowActiondCards;
            const setPhase = useGameStore.getState().setPhase;

            if (!roomId) return;

            await fetchGameData(roomId);
            const playerIndex = useGameStore.getState().players.findIndex(player => player.id === playerId);
            setMyTurn(playerIndex);
            setIsLoading(false);

            const subscription = supabase
                .channel(`game-${roomId}-updates`)
                .on(
                    'postgres_changes', 
                    { 
                        event: 'UPDATE', 
                        schema: 'public', 
                        table: 'games',
                        filter: `room_id=eq.${roomId}`
                    }, 
                    (payload) => {
                        if (payload.new.nowActionedCards !== payload.old.nowActionedCards) {
                            setNowActionedCards(payload.new.nowActionedCards);
                        }
                        if (payload.new.phase !== payload.old.phase) {
                            setPhase(payload.new.phase);
                        }
                    }
                )
                .subscribe();
            // クリーンアップ関数
            return () => {
                supabase.removeChannel(subscription);
            };
        })();
    }, [])

    if (isLoading) {
        return <div>読み込み中...</div>;
    }

    return (
        <div> 
            <PlayerHand/>
            <MarketValueTable/>
            <PossessedMoney/>
            <NowActionedCards/>
            <PurchasedCards/>
            <MessageBoard/>
            <PlayCardButton/>
        </div>
    )
}

export default GamePage;