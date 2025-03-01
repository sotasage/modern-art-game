import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { RoomMember } from "@/lib/types";
import { persist, createJSONStorage } from 'zustand/middleware';

type RoomState = {
    roomId: string | null;
    members: RoomMember[];
    setMembers: (members: RoomMember[]) => void;
    createRoom: () => Promise<void>;
    setRoomId: (roomId: string) => void;
    fetchMembers: (roomId: string) => Promise<void>;
    addMember: (member: RoomMember) => void;
    removeMember: (memberId: string) => void;
    resetRoomState: () => void;
};

const useRoomStore = create<RoomState>()(
    persist(
        (set, get) => ({
            roomId: null,
            members: [],
            setMembers: (members) => set({ members: members }),
            createRoom: async () => {
                const { data: roomData, error: roomError } = await supabase
                    .from("rooms")
                    .insert({})
                    .select()
                    .single();
                if (roomError) {
                    console.error("ルーム作成エラー", roomError);
                    return;
                }
                
                set({ roomId: roomData.id });
            },
            setRoomId: (roomId) => set({roomId: roomId}),
            fetchMembers: async (roomId) => {
                const { data, error } = await supabase
                    .from('players')
                    .select('*')
                    .eq('room_id', roomId)
                    .order('created_at', { ascending: true });
                
                if (error) {
                    console.error("ルームメンバー取得エラー", error);
                    return;
                }
                set({members: data});
                console.log(get().members);
            },
            addMember: (member) => set((state) => ({
                members: [...state.members, member]
            })),
            removeMember: (memberId) => set((state) => ({ 
                members: state.members.filter(member => member.id !== memberId)
            })),
            resetRoomState: () => {
                set({roomId: null, members: []});
            },
        }),
        {
            name: 'room-storage', // ストレージのキー名
            storage: createJSONStorage(() => localStorage), // localStorage または sessionStorage
        }
    )
);

export default useRoomStore;