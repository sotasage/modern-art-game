"use client"

import React, { useEffect } from 'react'
import usePlayerStore from '@/store/playerStore';
import PlayerHand from '@/components/others/PlayerHand';
import useGameStore from '@/store/gameStore';
import useRoomStore from '@/store/roomStore';

const GamePage = () => {
    const roomId = useRoomStore(state => state.roomId);
    const playerId = usePlayerStore(state => state.playerId);
    const isLoading = usePlayerStore(state => state.isLoading);
    const turn = usePlayerStore(state => state.turn);
    const setIsLoading = usePlayerStore(state => state.setIsLoading);
    const setTurn = usePlayerStore(state => state.setTurn);
    const fetchGameData = useGameStore(state => state.fetchGameData);


    useEffect(() => {
        (async () => {
            console.log(roomId);
            if (!roomId) return;

            await fetchGameData(roomId);
            const playerIndex = useGameStore.getState().players.findIndex(player => player.id === playerId);
            setTurn(playerIndex);
            setIsLoading(false);
        })();
    }, [playerId, roomId, setIsLoading, fetchGameData, setTurn])

    if (isLoading) {
        return <div>読み込み中...</div>;
    }

    return (
        <div> 
            <PlayerHand cards={useGameStore.getState().players[turn].hand} />
        </div>
    )
}

export default GamePage;