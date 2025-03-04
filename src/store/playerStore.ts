import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { persist, createJSONStorage } from 'zustand/middleware';

type PlayerState = {
    playerId: string | null;
    playerName: string | null;
    isLoading: boolean;
    isRoomMaster: boolean;
    createPlayer: (playerName: string, roomId: string) => Promise<void>;
    resetPlayerState: () => void;
    setPlayerId: (playerId: string) => void;
    setPlayerName: (playerName: string) => void;
    setIsLoading: (isLoading: boolean) => void;
    setIsRoomMaster: (isRoomMaster: boolean) => void;
};

const usePlayerStore = create<PlayerState>()(
    persist(
        (set, get) => ({
            playerId: null,
            playerName: null,
            isLoading: false,
            isRoomMaster: false,
            createPlayer: async (playerName, roomId) => {
                const { data: playerData, error: playerError } = await supabase
                    .from("players")
                    .insert([{ name: playerName, room_id: roomId }])
                    .select()
                    .single();
                if (playerError) {
                    console.error("プレイヤー登録エラー", playerError);
                    return;
                }
                set({ playerId: playerData.id, playerName: playerData.name })
                console.log(get().playerId);
            },
            resetPlayerState: () => {
                set({playerId: null, playerName: null});
            },
            setPlayerId: (playerId) => set({ playerId: playerId }),
            setPlayerName: (playerName) => set({playerName: playerName}),
            setIsLoading: (isLoading) => set({isLoading: isLoading}),
            setIsRoomMaster: (isRoomMaster) => set({isRoomMaster: isRoomMaster}),
        }),
        {
            name: 'player-storage', // ストレージのキー名
            storage: createJSONStorage(() => localStorage), // localStorage または sessionStorage
        }
    )
);

export default usePlayerStore;