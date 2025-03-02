import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Card, Player, MarketValue } from "@/lib/types";
import { supabase } from "@/lib/supabase";

type GameState = {
    players: Player[];
    deck: Card[];
    money: number[];
    nowTurn: number;
    marketValueList: MarketValue[];
    isGameStarted: boolean;
    setPlayers: (players: Player[]) => void;
    setDeck: (deck: Card[]) => void;
    setMoney: (money: number[]) => void;
    setMarketValueList: (marketValueList: MarketValue[]) => void;
    fetchGameData: (roomId: string) => Promise<void>;
};

const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            players: [],
            deck: [],
            money: [],
            nowTurn: 0,
            marketValueList: Array.from({ length: 4 }, () => ({
                diamond: null,
                emerald: null,
                sapphire: null,
                ruby: null,
                amethyst: null
            })),
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
                set({ players: data.players, deck: data.deck, money: data.money, nowTurn: data.nowTurn, isGameStarted: true });
                console.log(get().players);
            },
        }),
        {
            name: 'game-storage', // ストレージのキー名
            storage: createJSONStorage(() => localStorage), // localStorage または sessionStorage
        }
    )
);

export default useGameStore;