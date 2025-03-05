import React from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import useGameStore from '@/store/gameStore';
import { SpecifyAuction } from '@/lib/types';
import { getNextTurn } from '@/lib/game/gameFunctions';
import { supabase } from '@/lib/supabase';
import useRoomStore from '@/store/roomStore';

const DecidePurchase = () => {
    const phase = useGameStore(state => state.phase);
    const specifyAuctionState = useGameStore(state => state.specifyAuctionState);
    const myTurn = useGameStore.getState().myTurn;
    const players = useGameStore.getState().players;
    const roomId = useRoomStore.getState().roomId;

    let isCardVisible = phase === "指し値" && specifyAuctionState.nowPlayer === myTurn;

    const purchase = async () => {
        if (phase !== "指し値" || specifyAuctionState.nowPlayer !== myTurn) return;

        isCardVisible = false;

        const newSpecifyAuctionState: SpecifyAuction = {
            nowPlayer: getNextTurn(myTurn, players.length),
            betSize: specifyAuctionState.betSize,
            isPurchased: true,
        }

        const { error } = await supabase
            .from('games')
            .update({ specifyAuctionState: newSpecifyAuctionState })
            .eq("room_id", roomId);
            
        if (error) {
            console.error("指し値エラー", error);
            return;
        }
    }

    const pass = async () => {
        if (phase !== "指し値" || specifyAuctionState.nowPlayer !== myTurn) return;

        isCardVisible = false;

        const newSpecifyAuctionState: SpecifyAuction = {
            nowPlayer: getNextTurn(myTurn, players.length),
            betSize: specifyAuctionState.betSize,
            isPurchased: false,
        }

        const { error } = await supabase
            .from('games')
            .update({ specifyAuctionState: newSpecifyAuctionState })
            .eq("room_id", roomId);
            
        if (error) {
            console.error("指し値エラー", error);
            return;
        }
    }

    return (
        <div>
            <>
                {isCardVisible && (
                    <Card className="fixed bottom-20 right-4 w-44 h-24 p-2 rounded-lg bg-white flex flex-col justify-between">
                        <h2 className="text-center font-semibold text-gray-900 mb-1"> 購入しますか？</h2>
                        <div className='flex justify-center gap-3'>
                            <Button
                                className=' bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-r-md transition'
                                onClick={purchase}
                            >
                                はい
                            </Button>
                            <Button
                                className=' bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-r-md transition'
                                onClick={pass}
                            >
                                パス
                            </Button>
                        </div>
                    </Card>
                )}
            </>
        </div>
    )
}

export default DecidePurchase