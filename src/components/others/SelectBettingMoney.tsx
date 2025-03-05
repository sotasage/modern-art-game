import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Button } from '../ui/button'
import useGameStore from '@/store/gameStore'
import type { PublicAuction } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import useRoomStore from '@/store/roomStore'

const SelectBettingMoney = () => {
    const money = useGameStore(state => state.money);
    const myTurn = useGameStore.getState().myTurn;
    const phase = useGameStore(state => state.phase);
    const publicAuctionState = useGameStore(state => state.publicAuctionState);
    const roomId = useRoomStore.getState().roomId;

    const [betAmount, setBetAmount] = useState(0);

    let isCardVisible = false;
    let isFinishButtomDisabled = false;
    let minBet = 1000;

    if (phase === "公開競り") {
        if (!publicAuctionState[myTurn].isFinished) isCardVisible = true;

        const betSizes = publicAuctionState.map(state => state.betSize);
        const maxBet = Math.max(...betSizes);

        minBet = maxBet + 1000;
        
        if (betAmount < minBet) {
            setBetAmount(minBet);
        }

        // 賭け金が最大のプレイヤーは終了ボタンを押せないようにする
        const maxIndex = betSizes.indexOf(Math.max(...betSizes));
        if (maxIndex === myTurn && publicAuctionState[maxIndex].betSize != 0) {
            isFinishButtomDisabled = true;
        }
    }
    if (phase === "カード選択" || phase === "ダブルオークション") {
        if (betAmount !== 0) setBetAmount(0);
    }

    const handleBetChange = (values: number[]) => {
        setBetAmount(values[0]);
    };

    const dicideBetSize = async () => {
        if (phase === "公開競り") {
            if (publicAuctionState[myTurn].betSize >= betAmount) return;
            const newState: PublicAuction = { betSize: betAmount, isFinished: false };
            const newPublicAuctionState = publicAuctionState.map((state, index) => 
                index === myTurn ? newState : state
            );

            const { error } = await supabase
                .from('games')
                .update({ publicAuctionState: newPublicAuctionState })
                .eq("room_id", roomId);
                
            if (error) {
                console.error("公開競りエラー", error);
                return;
            }
        }
    }

    const finishBet = async () => {
        if (phase === "公開競り") {
            const newState: PublicAuction = { betSize: 0, isFinished: true };
            const newPublicAuctionState = publicAuctionState.map((state, index) => 
                index === myTurn ? newState : state
            );

            const { error } = await supabase
                .from('games')
                .update({ publicAuctionState: newPublicAuctionState })
                .eq("room_id", roomId);
                
            if (error) {
                console.error("公開競りエラー", error);
                return;
            }

            isCardVisible = false;
        }
    }

    return (
        <>
            {isCardVisible && (
                <Card className="fixed bottom-16 right-4 w-52 h-32 p-1 rounded-lg bg-white flex flex-col justify-between">
                    <h2 className="text-center font-semibold text-gray-900 mb-1"> 賭け金を選択</h2>
                    <Slider
                        value={[betAmount]}
                        min={minBet}
                        max={money[myTurn]}
                        step={1000}
                        onValueChange={handleBetChange}
                    />
                    <h2 className="text-center font-semibold text-gray-900 mb-1"> ${betAmount.toLocaleString()}</h2>
                    <div className='flex justify-center gap-3'>
                        <Button
                            className=' bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-r-md transition'
                            onClick={dicideBetSize}
                            disabled={minBet >= money[myTurn]}
                        >
                            決定
                        </Button>
                        {phase ==="公開競り" && <Button
                            className=' bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-r-md transition'
                            onClick={finishBet}
                            disabled={isFinishButtomDisabled}
                        >
                            終了
                        </Button>}
                    </div>
                </Card>
            )}
        </>
    )
}

export default SelectBettingMoney