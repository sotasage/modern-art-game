import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Card, Player, MarketValue, Phase, publicAuction } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { discardCard } from '@/lib/game/cardFunctions';

type GameState = {
    players: Player[];
    deck: Card[];
    hands: Card[][];
    money: number[];
    nowTurn: number;
    marketValueList: MarketValue[];
    purchasedCards: Card[][];
    nowActionedCards: Card[];
    newNowActionedCards: Card[];
    messages: string[];
    selectedCard: Card | null;
    myTurn: number;
    isGameStarted: boolean;
    phase: Phase;
    selectedDoubleAuction: Card | null;
    publicAuctionState: publicAuction[],
    setPlayers: (players: Player[]) => void;
    setDeck: (deck: Card[]) => void;
    setMoney: (money: number[]) => void;
    setMarketValueList: (marketValueList: MarketValue[]) => void;
    fetchGameData: (roomId: string) => Promise<void>;
    setNowActionedCards: (nowActionedCards: Card[]) => void;
    setNewNowActionedCards: (newNowActionedCards: Card[]) => void;
    addMessage: (message: string) => void;
    setSelectedCard: (selectedCard: Card | null) => void;
    setMyTurn: (myTurn: number) => void;
    changePhase: (phase: Phase, roomId: string) => Promise<void>;
    setPhase: (phase: Phase) => void;
    setSelectedDoubleAuction: (selectedDoubleAuction: Card | null) => void;
    discardCard: (card: Card) => void;
    setPublicAuctionState: (publicAuctionState: publicAuction[]) => void;
    setPurchasedCards: (purchasedCards: Card[][]) => void;
    setNowTurn: (nowTurn: number) => void;
};

const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            players: [],
            deck: [],
            hands: [],
            money: [],
            nowTurn: 0,
            marketValueList: [],
            purchasedCards: [],
            nowActionedCards: [],
            newNowActionedCards: [],
            messages: [],
            myTurn: -1,
            selectedCard: null,
            isGameStarted: false,
            phase: "カード選択",
            selectedDoubleAuction: null,
            publicAuctionState: [],
            setPlayers: (players) => set({players: players}),
            setDeck: (deck) => set({deck: deck}),
            setMoney: (money) => set({money: money}),
            setMarketValueList: (marketValueList) => set({marketValueList: marketValueList}),
            fetchGameData: async (roomId) => {
                const { data, error } = await supabase
                    .from('games')
                    .select('*')
                    .eq('room_id', roomId)
                    .single();
                
                if (error) {
                    console.error("ゲームデータ取得エラー", error);
                    return;
                }
                set({
                    players: data.players,
                    deck: data.deck,
                    hands: data.hands,
                    money: data.money,
                    nowTurn: data.nowTurn,
                    marketValueList: data.marketValueList,
                    purchasedCards: data.purchasedCards,
                    nowActionedCards: data.nowActionedCards,
                    newNowActionedCards: [],
                    messages: [],
                    selectedCard: null,
                    isGameStarted: true,
                    phase: data.phase,
                    selectedDoubleAuction: null,
                    publicAuctionState: data.publicAuctionState
                });
            },
            setNowActionedCards: (nowActionedCards) => set({nowActionedCards: nowActionedCards}),
            setNewNowActionedCards: (newNowActionedCards) => set({newNowActionedCards: newNowActionedCards}),
            addMessage: (message) => set((state) => ({
                messages: [...state.messages, message]
            })),
            setSelectedCard: (selectedCard) => set({selectedCard: selectedCard}),
            setMyTurn: (myTurn) => set({myTurn: myTurn}),
            changePhase: async (phase, roomId) => {
                if (phase === get().phase) return;
                const { data, error } = await supabase
                    .from('games')
                    .update({ phase: phase })
                    .eq("room_id", roomId)
                    .select()
                    .single();
                if (error) {
                    console.error("フェイズ変更エラー", error);
                    return;
                }
                set({ phase: data.phase });
            },
            setPhase: (phase) => set({phase: phase}),
            setSelectedDoubleAuction: (selectedDoubleAuction) => set({selectedDoubleAuction: selectedDoubleAuction}),
            discardCard: (card) => {
                const nowHands = get().hands;
                const myTurn = get().myTurn;
                const newHand: Card[] = discardCard(nowHands[myTurn], card);
                const newHands = nowHands.map((hand, index) => 
                    index === myTurn ? newHand : hand
                );
                set({hands: newHands});
            },
            setPublicAuctionState: (publicAuctionState) => set({publicAuctionState: publicAuctionState}),
            setPurchasedCards: (purchasedCards) => set({purchasedCards: purchasedCards}),
            setNowTurn: (nowTurn) => set({nowTurn: nowTurn}),
        }),
        {
            name: 'game-storage', // ストレージのキー名
            storage: createJSONStorage(() => localStorage), // localStorage または sessionStorage
        }
    )
);

export default useGameStore;