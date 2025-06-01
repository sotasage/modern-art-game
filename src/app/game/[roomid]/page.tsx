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
import DecidePurchase from '@/components/others/DecidePurchase';
import useGameStore from '@/store/gameStore';
import useRoomStore from '@/store/roomStore';
import { supabase } from '@/lib/supabase';
import { getGemsValue, getNextTurn, getPlayerEarnings, getTopThreeGems } from '@/lib/game/gameFunctions';
import { BidAuction, Card, DoubleAuction, Gem, MarketValue, OneVoiceAuction, SpecifyAuction } from '@/lib/types';
import { PublicAuction } from '../../../lib/types';
import { dealCards, sortCard } from '@/lib/game/cardFunctions';
import Result from '@/components/others/Result';
import { useRouter } from "next/navigation";

const GamePage = () => {
    const isLoading = usePlayerStore(state => state.isLoading);
    const router = useRouter();

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
            addMessage(`${useGameStore.getState().players[0].name}はカードを選択してください。`)

            const subscription1 = supabase
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
                        if (JSON.stringify(payload.new.round) !== JSON.stringify(payload.old.round)) {
                            const setRound = useGameStore.getState().setRound;
                            setRound(payload.new.round);

                            if (payload.new.round === 4) {
                                const setNowTurn = useGameStore.getState().setNowTurn;
                                addMessage("ゲーム終了");
                                setNowTurn(-1);

                                return;
                            }
                        }
                        if (JSON.stringify(payload.new.nowActionedCards) !== JSON.stringify(payload.old.nowActionedCards)) {
                            if (payload.new.phase === "公開競り" ||
                                payload.new.phase === "一声" ||
                                payload.new.phase === "入札" ||
                                payload.new.phase === "指し値" ||
                                payload.new.phase === "ダブルオークション"
                            ) {
                                const gemCounts = useGameStore.getState().gemCounts;
                                const nowActionedCards: Card[] = payload.new.nowActionedCards;

                                nowActionedCards.forEach(card => {
                                    gemCounts[card.gem]++;
                                });

                                // ダブルオークション単体で出したときに1枚計測されているため1マイナス
                                if (payload.old.phase === "ダブルオークション") {
                                    gemCounts[nowActionedCards[0].gem]--;
                                }
    
                                // 同じ宝石が5枚以上場に出たらラウンド終了
                                let isRoundChange = false;
                                (Object.keys(gemCounts) as Gem[]).forEach(gem => {
                                    if (gemCounts[gem] >= 5) {
                                        isRoundChange = true;
                                    }
                                });
    
                                if (isRoundChange) {
                                    const players = useGameStore.getState().players;
                                    const nowTurn = payload.new.nowTurn;
                                    const round = payload.new.round;
                                    const marketValueList: MarketValue[] = payload.new.marketValueList
                                    const money = payload.new.money;
                                    const purchasedCards = payload.new.purchasedCards;
                                    const hands = payload.new.hands;
                                    const deck = payload.new.deck;
                                    const setGemCounts = useGameStore.getState().setGemCounts;

                                    if (nowActionedCards.length === 2) {
                                        addMessage(`${players[nowTurn].name}が
                                                    ${nowActionedCards[0].gem}の${nowActionedCards[0].method}と
                                                    ${nowActionedCards[1].gem}の${nowActionedCards[1].method}を
                                                    出してラウンドを終わらせました。`
                                        )
                                    }
                                    else {
                                        addMessage(`${players[nowTurn].name}が
                                            ${nowActionedCards[0].gem}の${nowActionedCards[0].method}を
                                            出してラウンドを終わらせました。`
                                        )
                                    }

                                    // 市場価値の確定
                                    const topThreeGems = getTopThreeGems(gemCounts);
                                    const newMarketValue: MarketValue = {
                                        diamond: 0,
                                        emerald: 0,
                                        sapphire: 0,
                                        ruby: 0,
                                        amethyst: 0
                                    }
                                    const values = [30000, 20000, 10000];
                                    topThreeGems.forEach((gem, index) => {
                                        newMarketValue[gem] = values[index];
                                    });
                                    const newMarketValueList = marketValueList.map((value, index) => 
                                        index === round ? newMarketValue : value
                                    );

                                    // お金の処理
                                    const gemsValue = getGemsValue(newMarketValueList, round);
                                    const playerEarnings = getPlayerEarnings(gemsValue, purchasedCards);

                                    console.log(playerEarnings);

                                    const newMoney: number[] = money;

                                    playerEarnings.forEach((earning, index) => {
                                        newMoney[index] += earning;
                                    });

                                    // カード配布
                                    let number: number = 0;
                                    if (round === 0) {
                                        if (players.length === 3) number = 6;
                                        else if (players.length === 4) number = 4;
                                        else if (players.length === 5) number = 3;
                                    }
                                    else if (round === 1) {
                                        if (players.length === 3) number = 6;
                                        else if (players.length === 4) number = 4;
                                        else if (players.length === 5) number = 3;
                                    }
                                    
                                    const { updatedHands, remainingDeck } = dealCards(deck, hands, number);
                                    const newHands = updatedHands.map(hand => sortCard(hand));

                                    // 新しいターンは終わらせたプレイヤーの次のプレイヤーから
                                    const newTurn = getNextTurn(nowTurn, players.length);
                                    const newRound = round + 1;
                                    const newPurchasedCards = Array.from({ length: players.length }, () => []);
                                    const newPublicAuctionState: PublicAuction[] = Array.from({ length: players.length }, () => ({
                                        betSize: 0,
                                        isFinished: false,
                                    }));
                                    const newOneVoiceAuctionState: OneVoiceAuction = { nowPlayer: -1, maxPlayer: -1, maxBetSize: -1 };
                                    const newBidAuctionState:  BidAuction[] = Array.from({ length: players.length }, () => ({
                                        isDecided: false,
                                        betSize: 0,
                                    }));
                                    const newSpecifyAuctionState: SpecifyAuction = { nowPlayer: -1, betSize: -1, isPurchased: false };
                                    const newDoubleAuctionState: DoubleAuction = { nowPlayer: -1, daCard: null, selectCard: null };

                                    setGemCounts({ diamond: 0, emerald: 0, sapphire: 0, ruby: 0, amethyst: 0 });

                                    addMessage("このラウンドで稼いだ額");
                                    players.map((player, index) => {
                                        addMessage(`${player.name}: $${playerEarnings[index].toLocaleString()}`);
                                    });

                                    // dbにデータ送信 deck hands money nowTurn marketValueList purchasedCards nowActionedCards phase round
                                    // doubleAuctionState specifyAuctionState bidAuctionState oneVoiceAuctionState publicAuctionState

                                    const { error } = await supabase
                                        .from('games')
                                        .update({
                                            deck: remainingDeck,
                                            hands: newHands,
                                            money: newMoney,
                                            nowTurn: newTurn,
                                            marketValueList: newMarketValueList,
                                            purchasedCards: newPurchasedCards,
                                            nowActionedCards: [],
                                            phase: "カード選択",
                                            round: newRound,
                                            publicAuctionState: newPublicAuctionState,
                                            oneVoiceAuctionState: newOneVoiceAuctionState,
                                            bidAuctionState: newBidAuctionState,
                                            specifyAuctionState: newSpecifyAuctionState,
                                            doubleAuctionState: newDoubleAuctionState,
                                        })
                                        .eq("room_id", roomId);
                                    
                                    if (error) {
                                        console.error("ラウンド変更エラー", error);
                                        return;
                                    }

                                    addMessage(`ラウンド${round + 1}終了`);
                                    if (round != 3) {
                                        addMessage(`ラウンド${newRound + 1}開始！`);
                                    }

                                    // 最後にreturnしている影響でStoreが更新されないことがあるので更新しておく
                                    const setDeck = useGameStore.getState().setDeck;
                                    const setHands = useGameStore.getState().setHands;
                                    const setMoney = useGameStore.getState().setMoney;
                                    const setNowTurn = useGameStore.getState().setNowTurn;
                                    const setMarketValueList = useGameStore.getState().setMarketValueList;
                                    const setPurchasedCards = useGameStore.getState().setPurchasedCards;
                                    const setNowActionedCards = useGameStore.getState().setNowActionedCards;
                                    const setPhase = useGameStore.getState().setPhase;
                                    const setRound = useGameStore.getState().setRound;
                                    const setPublicAuctionState = useGameStore.getState().setPublicAuctionState;
                                    const setOneVoiceAuctionState = useGameStore.getState().setOneVoiceAuctionState;
                                    const setBidAuctionState = useGameStore.getState().setBidAuctionState;
                                    const setSpecifyAuctionState = useGameStore.getState().setSpecifyAuctionState;
                                    const setDoubleAuctionState = useGameStore.getState().setDoubleAuctionState;

                                    setDeck(remainingDeck);
                                    setHands(newHands);
                                    setMoney(newMoney);
                                    setNowTurn(newTurn);
                                    setMarketValueList(newMarketValueList);
                                    setPurchasedCards(newPurchasedCards);
                                    setNowActionedCards([]);
                                    setPhase("カード選択");
                                    setRound(newRound);
                                    setPublicAuctionState(newPublicAuctionState);
                                    setOneVoiceAuctionState(newOneVoiceAuctionState);
                                    setBidAuctionState(newBidAuctionState);
                                    setSpecifyAuctionState(newSpecifyAuctionState);
                                    setDoubleAuctionState(newDoubleAuctionState);

                                    return;
                                }
                            }

                            const setNowActionedCards = useGameStore.getState().setNowActionedCards;
                            setNowActionedCards(payload.new.nowActionedCards);
                        }
                        if (JSON.stringify(payload.new.phase) !== JSON.stringify(payload.old.phase)) {
                            const setPhase = useGameStore.getState().setPhase;
                            setPhase(payload.new.phase);
                            const players = useGameStore.getState().players;

                            if (payload.new.phase === "カード選択") {
                                addMessage(`${players[payload.new.nowTurn].name}はカードを選択してください。`);
                            }
                            if (
                                payload.new.phase === "公開競り" ||
                                payload.new.phase === "一声" ||
                                payload.new.phase === "入札" ||
                                payload.new.phase === "指し値"
                            ) {
                                addMessage(`${players[payload.new.nowTurn].name}が${payload.new.phase}カードを出しました。`);
                                if (payload.new.phase === "公開競り" || payload.new.phase === "入札") {
                                    addMessage("金額を決定してください。");
                                }
                                else if (payload.new.phase === "指し値") {
                                    addMessage(`${players[payload.new.nowTurn].name}は売値を決定してください。`)
                                }
                            }
                            else if (payload.new.phase === "ダブルオークション") {
                                addMessage(`${players[payload.new.nowTurn].name}が${payload.new.phase}カードを単体で出しました。`);
                            }
                        }
                        if (JSON.stringify(payload.new.hands) !== JSON.stringify(payload.old.hands)) {
                            const setHands = useGameStore.getState().setHands;
                            setHands(payload.new.hands);
                        }
                        if (JSON.stringify(payload.new.marketValueList) !== JSON.stringify(payload.old.marketValueList)) {
                            const setMarketValueList = useGameStore.getState().setMarketValueList;
                            setMarketValueList(payload.new.marketValueList);
                        }
                        if (JSON.stringify(payload.new.publicAuctionState) !== JSON.stringify(payload.old.publicAuctionState)) {
                            const setPublicAuctionState = useGameStore.getState().setPublicAuctionState;
                            setPublicAuctionState(payload.new.publicAuctionState);

                            console.log(useGameStore.getState().publicAuctionState);

                            if (payload.new.phase === "公開競り") {
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
                                    JSON.stringify(payload.new.publicAuctionState.map((state: PublicAuction) => state.isFinished)) !==
                                    JSON.stringify(payload.old.publicAuctionState.map((state: PublicAuction) => state.isFinished))
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
                                    addMessage(`${players[maxBetPlayerIndex].name}が金額を$${maxBetSize.toLocaleString()}に吊り上げました。`);
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

                            console.log(useGameStore.getState().money);
                            console.log(payload.new.doubleAuctionState);
                            console.log(payload.old.doubleAuctionState);
                        }
                        if (JSON.stringify(payload.new.purchasedCards) !== JSON.stringify(payload.old.purchasedCards)) {
                            const setPurchasedCards = useGameStore.getState().setPurchasedCards;
                            setPurchasedCards(payload.new.purchasedCards);
                        }
                        if (JSON.stringify(payload.new.nowTurn) !== JSON.stringify(payload.old.nowTurn)) {
                            const setNowTurn = useGameStore.getState().setNowTurn;
                            setNowTurn(payload.new.nowTurn);
                        }
                        if (JSON.stringify(payload.new.oneVoiceAuctionState) !== JSON.stringify(payload.old.oneVoiceAuctionState)) {
                            const setOneVoiceAuctionState = useGameStore.getState().setOneVoiceAuctionState;
                            setOneVoiceAuctionState(payload.new.oneVoiceAuctionState);

                            console.log(useGameStore.getState().oneVoiceAuctionState);

                            if (payload.new.phase === "一声") {
                                const oneVoiceAuctionState = useGameStore.getState().oneVoiceAuctionState;
                                const players = useGameStore.getState().players;
                                const maxPlayer = oneVoiceAuctionState.maxPlayer;
                                const maxBetSize = oneVoiceAuctionState.maxBetSize;
                                const prePlayer = payload.old.oneVoiceAuctionState.nowPlayer;
                                const nowTurn = useGameStore.getState().nowTurn;

                                // 最初のターン以外の場合
                                if (prePlayer !== -1) {
                                    if (prePlayer === maxPlayer && maxBetSize !== 0) {
                                        addMessage(`${players[prePlayer].name}が金額を$${oneVoiceAuctionState.maxBetSize.toLocaleString()}に吊り上げました。`);
                                    }
                                    else {
                                        addMessage(`${players[prePlayer].name}はパスしました。`)
                                    }
                                }
                                // 最後のターンの場合
                                if (prePlayer === nowTurn) {
                                    const nowMoney = useGameStore.getState().money;
                                    const nowPurchasedCards = useGameStore.getState().purchasedCards;
                                    const nowActionedCards = useGameStore.getState().nowActionedCards;
                    
                                    const newMoney = nowMoney.map((money, index) =>
                                        index === maxPlayer ? money - maxBetSize : index === nowTurn ? money + maxBetSize : money
                                    );
                                    const newPurchasdCards = nowPurchasedCards.map((cards, index) => 
                                        index === maxPlayer ? [...cards, ...nowActionedCards] : cards
                                    );
                                    const newNowActionedCards: Card[] = [];
                                    const newOneVoiceAuctionState: OneVoiceAuction = {
                                        nowPlayer: -1, maxPlayer: -1, maxBetSize: -1,
                                    }
                                    const newPhase = "カード選択";
                                    const newTurn = getNextTurn(nowTurn, players.length);

                                    const { error } = await supabase
                                        .from('games')
                                        .update({
                                            money: newMoney,
                                            purchasedCards: newPurchasdCards,
                                            nowActionedCards: newNowActionedCards,
                                            oneVoiceAuctionState: newOneVoiceAuctionState,
                                            phase: newPhase,
                                            nowTurn: newTurn
                                        })
                                        .eq("room_id", roomId)
                                        .select()
                                        .single();
                                    if (error) {
                                        console.error("一声終了エラー", error);
                                        return;
                                    }

                                    addMessage("競売が終了しました。");
                                }
                                // 最後のターン以外の場合
                                else {
                                    const nowPlayer = oneVoiceAuctionState.nowPlayer;
                                    addMessage(`${players[nowPlayer].name}は金額を吊り上げるかまたはパスしてください。`)
                                }
                            }
                        }
                        if (JSON.stringify(payload.new.bidAuctionState) !== JSON.stringify(payload.old.bidAuctionState)) {
                            const setBidAuctionState = useGameStore.getState().setBidAuctionState;
                            setBidAuctionState(payload.new.bidAuctionState);

                            if (payload.new.phase === "入札") {
                                const players = useGameStore.getState().players;
                                const bidAuctionState = payload.new.bidAuctionState;
                                const nowTurn = payload.new.nowTurn;

                                let decideIndex = -1;
                                let isFinished = true;
                                for (let i = 0; i < players.length; i++) {
                                    if (
                                        bidAuctionState[i].isDecided !==
                                        payload.old.bidAuctionState[i].isDecided
                                    ) decideIndex = i;
                                    if (!bidAuctionState[i].isDecided) isFinished = false;
                                }

                                if (decideIndex !== -1) addMessage(`${players[decideIndex].name}が金額を決定しました。`);

                                if (isFinished) {
                                    // 最高金額とそのプレイヤーを求める 同じ金額だった場合は競売人に近い方から時計回りに優先（競売人が最優先）
                                    let maxPlayer = nowTurn;
                                    let maxBetSize = 0;
                                    for (let i = 0; i < players.length; i++) {
                                        let index = nowTurn + i;
                                        if (index >= players.length) index -= players.length;

                                        if (bidAuctionState[index].betSize > maxBetSize) {
                                            maxPlayer = index;
                                            maxBetSize = bidAuctionState[index].betSize;
                                        }
                                    }

                                    addMessage("全員の入札額を発表します。");
                                    players.map((player, index) => {
                                        addMessage(`${player.name}: $${bidAuctionState[index].betSize.toLocaleString()}`);
                                    })
                                    addMessage(`よって、${players[maxPlayer].name}が$${maxBetSize.toLocaleString()}で落札しました。`)

                                    const nowMoney = useGameStore.getState().money;
                                    const nowPurchasedCards = useGameStore.getState().purchasedCards;
                                    const nowActionedCards = useGameStore.getState().nowActionedCards;
                    
                                    const newMoney = nowMoney.map((money, index) =>
                                        index === maxPlayer ? money - maxBetSize : index === nowTurn ? money + maxBetSize : money
                                    );
                                    const newPurchasdCards = nowPurchasedCards.map((cards, index) => 
                                        index === maxPlayer ? [...cards, ...nowActionedCards] : cards
                                    );
                                    const newNowActionedCards: Card[] = [];
                                    const newBidAuctionState: BidAuction[] = Array.from({ length: players.length }, () => ({
                                        isDecided: false,
                                        betSize: 0,
                                    }));
                                    const newPhase = "カード選択";
                                    const newTurn = getNextTurn(nowTurn, players.length);

                                    const { error } = await supabase
                                        .from('games')
                                        .update({
                                                money: newMoney,
                                                purchasedCards: newPurchasdCards,
                                                nowActionedCards: newNowActionedCards,
                                                bidAuctionState: newBidAuctionState,
                                                phase: newPhase,
                                                nowTurn: newTurn
                                        })
                                        .eq("room_id", roomId)
                                        .select()
                                        .single();
                                    if (error) {
                                        console.error("入札終了エラー", error);
                                        return;
                                    }

                                    addMessage("競売が終了しました。");
                                }
                            }
                        }
                        if (JSON.stringify(payload.new.specifyAuctionState) !== JSON.stringify(payload.old.specifyAuctionState)) {
                            const setSpecifyAuctionState = useGameStore.getState().setSpecifyAuctionState;
                            setSpecifyAuctionState(payload.new.specifyAuctionState);

                            if (payload.new.phase === "指し値") {
                                const prePlayer = payload.old.specifyAuctionState.nowPlayer;
                                const players = useGameStore.getState().players;
                                const specifyAuctionState = payload.new.specifyAuctionState;
                                const nowTurn = payload.new.nowTurn;

                                if (prePlayer === -1) {
                                    addMessage(`${players[nowTurn].name}が売値を$${specifyAuctionState.betSize.toLocaleString()}に設定しました。`);
                                    addMessage(`${players[specifyAuctionState.nowPlayer].name}は落札するかまたはパスしてください。`);
                                }
                                else {
                                    // 購入者が出た場合
                                    if (specifyAuctionState.isPurchased) {
                                        addMessage(`${players[prePlayer].name}が$${specifyAuctionState.betSize.toLocaleString()}で落札しました。`);

                                        const nowMoney = useGameStore.getState().money;
                                        const nowPurchasedCards = useGameStore.getState().purchasedCards;
                                        const nowActionedCards = useGameStore.getState().nowActionedCards;
                        
                                        const newMoney = nowMoney.map((money, index) =>
                                            index === prePlayer ? money - specifyAuctionState.betSize : index === nowTurn ? money + specifyAuctionState.betSize : money
                                        );
                                        const newPurchasdCards = nowPurchasedCards.map((cards, index) => 
                                            index === prePlayer ? [...cards, ...nowActionedCards] : cards
                                        );
                                        const newNowActionedCards: Card[] = [];
                                        const newSpecifyAuctionState: SpecifyAuction = {
                                            nowPlayer: -1, betSize: -1, isPurchased: false,
                                        }
                                        const newPhase = "カード選択";
                                        const newTurn = getNextTurn(nowTurn, players.length);

                                        const { error } = await supabase
                                            .from('games')
                                            .update({
                                                    money: newMoney,
                                                    purchasedCards: newPurchasdCards,
                                                    nowActionedCards: newNowActionedCards,
                                                    specifyAuctionState: newSpecifyAuctionState,
                                                    phase: newPhase,
                                                    nowTurn: newTurn
                                            })
                                            .eq("room_id", roomId)
                                            .select()
                                            .single();
                                        if (error) {
                                            console.error("指し値終了エラー", error);
                                            return;
                                        }

                                        addMessage("競売が終了しました。");
                                    }
                                    // 最後まで購入者が出なかった場合
                                    else if (specifyAuctionState.nowPlayer === nowTurn) {
                                        addMessage(`全てのプレイヤーがパスしたため、${players[nowTurn].name}が$${specifyAuctionState.betSize.toLocaleString()}で落札しました。`)

                                        const nowMoney = useGameStore.getState().money;
                                        const nowPurchasedCards = useGameStore.getState().purchasedCards;
                                        const nowActionedCards = useGameStore.getState().nowActionedCards;
                        
                                        const newMoney = nowMoney.map((money, index) =>
                                            index === nowTurn ? money - specifyAuctionState.betSize : money
                                        );
                                        const newPurchasdCards = nowPurchasedCards.map((cards, index) => 
                                            index === nowTurn ? [...cards, ...nowActionedCards] : cards
                                        );
                                        const newNowActionedCards: Card[] = [];
                                        const newSpecifyAuctionState: SpecifyAuction = {
                                            nowPlayer: -1, betSize: -1, isPurchased: false,
                                        }
                                        const newPhase = "カード選択";
                                        const newTurn = getNextTurn(nowTurn, players.length);

                                        const { error } = await supabase
                                            .from('games')
                                            .update({
                                                    money: newMoney,
                                                    purchasedCards: newPurchasdCards,
                                                    nowActionedCards: newNowActionedCards,
                                                    specifyAuctionState: newSpecifyAuctionState,
                                                    phase: newPhase,
                                                    nowTurn: newTurn
                                            })
                                            .eq("room_id", roomId)
                                            .select()
                                            .single();
                                        if (error) {
                                            console.error("指し値終了エラー", error);
                                            return;
                                        }

                                        addMessage("競売が終了しました。");
                                    }
                                    else {
                                        addMessage(`${players[prePlayer].name}はパスしました。`)
                                        addMessage(`${players[specifyAuctionState.nowPlayer].name}は落札するかまたはパスしてください。`);
                                    }
                                }
                            }
                        }
                        if (JSON.stringify(payload.new.doubleAuctionState) !== JSON.stringify(payload.old.doubleAuctionState)) {
                            const setDoubleAuctionState = useGameStore.getState().setDoubleAuctionState;
                            setDoubleAuctionState(payload.new.doubleAuctionState);

                            if (payload.new.phase === "ダブルオークション") {
                                const prePlayer = payload.old.doubleAuctionState.nowPlayer;
                                const players = useGameStore.getState().players;
                                const doubleAuctionState = payload.new.doubleAuctionState;
                                const nowTurn = payload.new.nowTurn;

                                if (prePlayer === -1) {
                                    addMessage(`${players[doubleAuctionState.nowPlayer].name}は同じ色のカードを出すかまたはパスしてください。`);
                                }
                                else {
                                    // 誰かがカードを出した場合
                                    if (doubleAuctionState.selectCard !== null) {
                                        const nowActionedCards = useGameStore.getState().nowActionedCards;
                        
                                        const newNowActionedCards: Card[] = [...nowActionedCards, doubleAuctionState.selectCard]
                                        const newDoubleAuctionState: DoubleAuction = {
                                            nowPlayer: -1, daCard: null, selectCard: null,
                                        }
                                        const newPhase = doubleAuctionState.selectCard.method;
                                        const newTurn = prePlayer;

                                        const nowDoubleAuctionState: DoubleAuction = payload.new.doubleAuctionState;

                                        if (nowDoubleAuctionState.selectCard?.method === "一声") {
                                            const newOneVoiceAuctionState: OneVoiceAuction = {
                                                nowPlayer: getNextTurn(prePlayer, useGameStore.getState().players.length),
                                                maxPlayer: prePlayer,
                                                maxBetSize: 0,
                                            };

                                            const { error } = await supabase
                                                .from('games')
                                                .update({
                                                        nowActionedCards: newNowActionedCards,
                                                        doubleAuctionState: newDoubleAuctionState,
                                                        phase: newPhase,
                                                        nowTurn: newTurn,
                                                        oneVoiceAuctionState: newOneVoiceAuctionState,
                                                })
                                                .eq("room_id", roomId)
                                                .select()
                                                .single();
                                            if (error) {
                                                console.error("ダブルオークション終了エラー", error);
                                                return;
                                            }
                                        }
                                        else {
                                            const { error } = await supabase
                                                .from('games')
                                                .update({
                                                        nowActionedCards: newNowActionedCards,
                                                        doubleAuctionState: newDoubleAuctionState,
                                                        phase: newPhase,
                                                        nowTurn: newTurn
                                                })
                                                .eq("room_id", roomId)
                                                .select()
                                                .single();
                                            if (error) {
                                                console.error("ダブルオークション終了エラー", error);
                                                return;
                                            }
                                        }
                                    }
                                    // 誰もカードを出さなかった場合
                                    else if (doubleAuctionState.nowPlayer === nowTurn) {
                                        addMessage(`全てのプレイヤーがパスしたため、${players[nowTurn].name}がカードを無料で受け取ります。`)

                                        const nowPurchasedCards = useGameStore.getState().purchasedCards;
                        
                                        const newPurchasdCards = nowPurchasedCards.map((cards, index) => 
                                            index === nowTurn ? [...cards, doubleAuctionState.daCard] : cards
                                        );
                                        const newNowActionedCards: Card[] = [];
                                        const newDoubleAuctionState: DoubleAuction = {
                                            nowPlayer: -1, daCard: null, selectCard: null,
                                        }
                                        const newPhase = "カード選択";
                                        const newTurn = getNextTurn(nowTurn, players.length);

                                        const { error } = await supabase
                                            .from('games')
                                            .update({
                                                    purchasedCards: newPurchasdCards,
                                                    nowActionedCards: newNowActionedCards,
                                                    doubleAuctionState: newDoubleAuctionState,
                                                    phase: newPhase,
                                                    nowTurn: newTurn
                                            })
                                            .eq("room_id", roomId)
                                            .select()
                                            .single();
                                        if (error) {
                                            console.error("ダブルオークション終了エラー", error);
                                            return;
                                        }
                                    }
                                    else {
                                        addMessage(`${players[prePlayer].name}はパスしました。`)
                                        addMessage(`${players[doubleAuctionState.nowPlayer].name}は同じ色のカードを出すかまたはパスしてください。`);
                                    }
                                }
                            }
                        }
                    }
                )
                .subscribe();
            const subscription2 = supabase
                .channel(`game-${roomId}-start`)
                .on('postgres_changes', 
                { 
                    event: 'UPDATE', 
                    schema: 'public', 
                    table: 'rooms',
                },
                (payload) => {
                    if (payload.new.status === "waiting") {
                        setIsLoading(true);
                        router.push(`/room/${roomId}`);
                    }
                }
                )
                .subscribe();

            // クリーンアップ関数
            return () => {
                supabase.removeChannel(subscription1);
                supabase.removeChannel(subscription2);
            };
        })();
    }, [router])

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
            <DecidePurchase/>
            <Result/>
        </div>
    )
}

export default GamePage;