"use client"

import React, { useEffect } from 'react'
import usePlayerStore from '@/store/playerStore';
import PlayerHand from '@/components/others/PlayerHand';
import PossessedMoney from '@/components/others/PossessedMoney';
import MarketValueTable from '@/components/others/MarketValueTable';
import useGameStore from '@/store/gameStore';
import useRoomStore from '@/store/roomStore';

const GamePage = () => {
    const isLoading = usePlayerStore(state => state.isLoading);
    const turn = usePlayerStore(state => state.turn);
    const players = useGameStore(state => state.players);
    const money = useGameStore(state => state.money);
    const marketValueList = useGameStore(state => state.marketValueList);

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
            <PlayerHand cards={players[turn].hand} />
            <MarketValueTable marketValueList={marketValueList} />
            <PossessedMoney money={money[turn]} />
        </div>
    )
}

export default GamePage;