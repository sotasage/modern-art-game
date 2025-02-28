import { supabase } from "./supabase"

export const getAllPlayers = async (roomId: string) => {
    const players = await supabase.from("players").select("*").eq("room_id", roomId).order('created_at', { ascending: true });
    return players.data;
};