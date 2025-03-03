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
import SelectBettingMoney from '@/components/others/SelectBettingMoney';
import useGameStore from '@/store/gameStore';
import useRoomStore from '@/store/roomStore';
import { supabase } from '@/lib/supabase';
import { getNextTurn } from '@/lib/game/gameFunctions';
import { Card } from '@/lib/types';
import { publicAuction } from '../../../lib/types';

const GamePage = () => {
    const isLoading = usePlayerStore(state => state.isLoading);

    useEffect(() => {
        (async () => {
            const roomId = useRoomStore.getState().roomId
            const playerId = usePlayerStore.getState().playerId;
            const setIsLoading = usePlayerStore.getState().setIsLoading;
            const setMyTurn = useGameStore.getState().setMyTurn;
            const fetchGameData = useGameStore.getState().fetchGameData;
            const addMessage = useGameStore.getState().addMessage;

            if (!roomId) return;

            await fetchGameData(roomId);
            const playerIndex = useGameStore.getState().players.findIndex(player => player.id === playerId);
            setMyTurn(playerIndex);
            setIsLoading(false);
            addMessage("ゲーム開始！");
            addMessage(`${useGameStore.getState().players[0].name}はカードを選んでください。`)

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
                    async (payload) => {
                        if (JSON.stringify(payload.new.nowActionedCards) !== JSON.stringify(payload.old.nowActionedCards)) {
                            const setNowActionedCards = useGameStore.getState().setNowActionedCards;
                            setNowActionedCards(payload.new.nowActionedCards);
                        }
                        if (JSON.stringify(payload.new.phase) !== JSON.stringify(payload.old.phase)) {
                            const setPhase = useGameStore.getState().setPhase;
                            setPhase(payload.new.phase);
                            const players = useGameStore.getState().players;

                            if (payload.new.phase === "カード選択") {
                                addMessage(`${players[payload.new.nowTurn].name}はカードを選んでください。`);
                            }
                            if (payload.new.phase === "公開競り") {
                                addMessage(`${players[payload.new.nowTurn].name}がカードを出しました。\n賭け金を選択してください。`);
                            }
                            
                        }
                        if (JSON.stringify(payload.new.publicAuctionState) !== JSON.stringify(payload.old.publicAuctionState)) {
                            const setPublicAuctionState = useGameStore.getState().setPublicAuctionState;
                            setPublicAuctionState(payload.new.publicAuctionState);

                            if (useGameStore.getState().phase === "公開競り") {
                                // 最大金額を賭けているプレイヤーと降りたプレイヤーの人数を記録
                                const publicAuctionState = useGameStore.getState().publicAuctionState;
                                const players = useGameStore.getState().players;
                                let maxBetPlayerIndex = 0;
                                let maxBetSize = 0;
                                let finishCount = 0;
                                publicAuctionState.map((state, index) => {
                                    if (state.isFinished) {
                                        finishCount++;
                                    }
                                    else if (maxBetSize < state.betSize) {
                                        maxBetPlayerIndex = index;
                                        maxBetSize = state.betSize;
                                    }
                                })

                                // 誰かが降りた場合
                                if (
                                    JSON.stringify(payload.new.publicAuctionState.map((state: publicAuction) => state.isFinished)) !==
                                    JSON.stringify(payload.old.publicAuctionState.map((state: publicAuction) => state.isFinished))
                                ) {
                                    let falledIndex = -1;
                                    for (let i = 0; i < players.length; i++) {
                                        if (
                                            payload.new.publicAuctionState[i].isFinished !==
                                            payload.old.publicAuctionState[i].isFinished
                                        ) {
                                            falledIndex = i;
                                        }
                                    }

                                    if (falledIndex !== -1) addMessage(`${players[falledIndex].name}が降りました。`);
                                }
                                // 誰かが賭け金を吊り上げた場合
                                else {
                                    addMessage(`${players[maxBetPlayerIndex].name}が賭け金を$${maxBetSize}に吊り上げました。`);
                                }
                                // 残りのプレイヤーが1人の場合は終了
                                if (finishCount >= players.length - 1) {
                                    const nowMoney = useGameStore.getState().money;
                                    const nowTurn = useGameStore.getState().nowTurn;
                                    const nowPurchasedCards = useGameStore.getState().purchasedCards;
                                    const nowActionedCards = useGameStore.getState().nowActionedCards;
                    
                                    const newMoney = nowMoney.map((money, index) =>
                                        index === maxBetPlayerIndex ? money - maxBetSize : index === nowTurn ? money + maxBetSize : money
                                    );
                                    const newPurchasdCards = nowPurchasedCards.map((cards, index) => 
                                        index === maxBetPlayerIndex ? [...cards, ...nowActionedCards] : cards
                                    );
                                    const newNowActionedCards: Card[] = [];
                                    const newPublicAuctionState = Array.from({ length: players.length }, () => ({
                                        betSize: 0,
                                        isFinished: false,
                                    }));
                                    const newPhase = "カード選択";
                                    const newTurn = getNextTurn(nowTurn, players.length);
                    
                                    const { error } = await supabase
                                        .from('games')
                                        .update({
                                                money: newMoney,
                                                purchasedCards: newPurchasdCards,
                                                nowActionedCards: newNowActionedCards,
                                                publicAuctionState: newPublicAuctionState,
                                                phase: newPhase,
                                                nowTurn: newTurn
                                        })
                                        .eq("room_id", roomId)
                                        .select()
                                        .single();
                                    if (error) {
                                        console.error("公開競り終了エラー", error);
                                        return;
                                    }

                                    addMessage("競売が終了しました。");
                                }
                            }
                        }
                        if (JSON.stringify(payload.new.money) !== JSON.stringify(payload.old.money)) {
                            const setMoney = useGameStore.getState().setMoney;
                            setMoney(payload.new.money);
                        }
                        if (JSON.stringify(payload.new.purchasedCards) !== JSON.stringify(payload.old.purchasedCards)) {
                            const setPurchasedCards = useGameStore.getState().setPurchasedCards;
                            setPurchasedCards(payload.new.purchasedCards);
                        }
                        if (JSON.stringify(payload.new.nowTurn) !== JSON.stringify(payload.old.nowTurn)) {
                            const setNowTurn = useGameStore.getState().setNowTurn;
                            setNowTurn(payload.new.nowTurn);
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
            <SelectBettingMoney/>
        </div>
    )
}

export default GamePage;