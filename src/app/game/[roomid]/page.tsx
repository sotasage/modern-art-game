"use client"

import React, { useEffect } from 'react'
import usePlayerStore from '@/store/playerStore';
import PlayerHand from '@/components/others/PlayerHand';
import PossessedMoney from '@/components/others/PossessedMoney';
import MarketValueTable from '@/components/others/MarketValueTable';
import NowActionedCards from '@/components/others/NowActionedCards';
import PurchasedCards from '@/components/others/PurchasedCards';
import MessageBoard from '@/components/others/MessageBoard';
import useGameStore from '@/store/gameStore';
import useRoomStore from '@/store/roomStore';

const GamePage = () => {
    const isLoading = usePlayerStore(state => state.isLoading);

    useEffect(() => {
        (async () => {
            const roomId = useRoomStore.getState().roomId
            const playerId = usePlayerStore.getState().playerId;
            const setIsLoading = usePlayerStore.getState().setIsLoading;
            const setTurn = usePlayerStore.getState().setTurn;
            const fetchGameData = useGameStore.getState().fetchGameData;

            if (!roomId) return;

            await fetchGameData(roomId);
            const playerIndex = useGameStore.getState().players.findIndex(player => player.id === playerId);
            setTurn(playerIndex);
            setIsLoading(false);
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
        </div>
    )
}

export default GamePage;