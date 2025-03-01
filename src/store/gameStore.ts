import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Card, Player } from "@/lib/types";
import { supabase } from "@/lib/supabase";

type GameState = {
    players: Player[];
    deck: Card[];
    isGameStarted: boolean;
    setPlayers: (players: Player[]) => void;
    setDeck: (deck: Card[]) => void;
    fetchGameData: (roomId: string) => Promise<void>;
};

const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            players: [],
            deck: [],
            isGameStarted: false,
            setPlayers: (players) => set({players: players}),
            setDeck: (deck) => set({deck: deck}),
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
                set({ players: data.players, deck: data.deck });
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