import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Card, Player, MarketValue } from "@/lib/types";
import { supabase } from "@/lib/supabase";

type GameState = {
    players: Player[];
    deck: Card[];
    hands: Card[][];
    money: number[];
    nowTurn: number;
    marketValueList: MarketValue[];
    purchasedCards: Card[][];
    nowActionedCards: Card[];
    messages: string[];
    isGameStarted: boolean;
    setPlayers: (players: Player[]) => void;
    setDeck: (deck: Card[]) => void;
    setMoney: (money: number[]) => void;
    setMarketValueList: (marketValueList: MarketValue[]) => void;
    fetchGameData: (roomId: string) => Promise<void>;
    addMessage: (message: string) => void;
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
            messages: [],
            isGameStarted: false,
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
                    messages: [],
                    isGameStarted: true
                });
                console.log(get().players);
            },
            addMessage: (message) => set((state) => ({
                messages: [...state.messages, message]
            })),
        }),
        {
            name: 'game-storage', // ストレージのキー名
            storage: createJSONStorage(() => localStorage), // localStorage または sessionStorage
        }
    )
);

export default useGameStore;