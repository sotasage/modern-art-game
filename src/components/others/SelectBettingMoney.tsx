import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Button } from '../ui/button'
import useGameStore from '@/store/gameStore'
import type { BidAuction, OneVoiceAuction, PublicAuction, SpecifyAuction } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import useRoomStore from '@/store/roomStore'
import { getNextTurn } from '@/lib/game/gameFunctions'

const SelectBettingMoney = () => {
    const money = useGameStore(state => state.money);
    const myTurn = useGameStore.getState().myTurn;
    const phase = useGameStore(state => state.phase);
    const publicAuctionState = useGameStore(state => state.publicAuctionState);
    const oneVoiceAuctionState = useGameStore(state => state.oneVoiceAuctionState);
    const roomId = useRoomStore.getState().roomId;
    const players = useGameStore.getState().players;
    const bidAuctionState = useGameStore(state => state.bidAuctionState);
    const specifyAuctionState = useGameStore(state => state.specifyAuctionState);
    const nowTurn = useGameStore(state => state.nowTurn);

    const [betAmount, setBetAmount] = useState(0);

    let isCardVisible = false;
    let isFinishButtomDisabled = false;
    let minBet = 0;

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
    if (phase === "一声") {
        if (oneVoiceAuctionState.nowPlayer === myTurn) isCardVisible = true;
        const maxBet = oneVoiceAuctionState.maxBetSize;
        minBet = maxBet + 1000;

        if (betAmount < minBet) {
            setBetAmount(minBet);
        }
    }
    if (phase === "入札") {
        if (!bidAuctionState[myTurn].isDecided) isCardVisible = true;
    }
    if (phase === "指し値") {
        if (nowTurn === myTurn && specifyAuctionState.betSize === -1) isCardVisible = true;
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
        if (phase === "一声") {
            if (oneVoiceAuctionState.maxBetSize >= betAmount) return;

            isCardVisible = false;

            const newOneVoiceAuctionState: OneVoiceAuction = {
                nowPlayer: getNextTurn(myTurn, players.length),
                maxPlayer: myTurn,
                maxBetSize: betAmount,
            };

            const { error } = await supabase
                .from('games')
                .update({ oneVoiceAuctionState: newOneVoiceAuctionState })
                .eq("room_id", roomId);
                
            if (error) {
                console.error("一声エラー", error);
                return;
            }
        }
        if (phase === "入札") {
            isCardVisible = false;

            const newState: BidAuction = { isDecided: true, betSize: betAmount };
            const newBidAuctionState = bidAuctionState.map((state, index) => 
                index === myTurn ? newState : state
            );

            const { error } = await supabase
                .from('games')
                .update({ bidAuctionState: newBidAuctionState })
                .eq("room_id", roomId);
                
            if (error) {
                console.error("入札エラー", error);
                return;
            }
        }
        if (phase === "指し値") {
            isCardVisible = false;

            const newSpecifyAuctionState: SpecifyAuction = {
                nowPlayer: getNextTurn(myTurn, players.length),
                betSize: betAmount,
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
    }

    const finishBet = async () => {
        if (phase === "公開競り") {
            isCardVisible = false;
            
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
        }
        if (phase === "一声") {
            isCardVisible = false;

            const newOneVoiceAuctionState: OneVoiceAuction = {
                nowPlayer: getNextTurn(myTurn, players.length),
                maxPlayer: oneVoiceAuctionState.maxPlayer,
                maxBetSize: oneVoiceAuctionState.maxBetSize,
            }

            const { error } = await supabase
                .from('games')
                .update({ oneVoiceAuctionState: newOneVoiceAuctionState })
                .eq("room_id", roomId);
                
            if (error) {
                console.error("一声エラー", error);
                return;
            }
        }
    }

    return (
        <>
            {isCardVisible && (
                <Card className="fixed bottom-16 right-4 w-52 h-32 p-1 rounded-lg bg-white flex flex-col justify-between">
                    <h2 className="text-center font-semibold text-gray-900 mb-1"> 金額を選択</h2>
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
                            disabled={minBet > money[myTurn]}
                        >
                            決定
                        </Button>
                        {(phase === "公開競り" || phase === "一声") && <Button
                            className=' bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-r-md transition'
                            onClick={finishBet}
                            disabled={isFinishButtomDisabled}
                        >
                            {phase === "公開競り" ? "降りる" : "パス"}
                        </Button>}
                    </div>
                </Card>
            )}
        </>
    )
}

export default SelectBettingMoney