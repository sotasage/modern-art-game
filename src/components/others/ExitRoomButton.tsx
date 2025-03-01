"use client"

import React from 'react'
import { Button } from '../ui/button'
import usePlayerStore from '@/store/playerStore'
import useRoomStore from '@/store/roomStore'
import { useRouter } from "next/navigation";
import { supabase } from '@/lib/supabase'

const ExitRoomButton = () => {
    const router = useRouter();
    const roomId = useRoomStore(state => state.roomId);
    const members = useRoomStore(state => state.members);
    const resetRoomState = useRoomStore(state => state.resetRoomState);
    const playerId = usePlayerStore(state => state.playerId);
    const setIsLoading = usePlayerStore(state => state.setIsLoading);
    const resetPlayerState = usePlayerStore(state => state.resetPlayerState);
    
    const handleExitRoom = async () => {
        if (!playerId || !roomId) return;
        setIsLoading(true);
        if (members.length === 1) await supabase.from("rooms").delete().eq("id", roomId);
        else await supabase.from("players").delete().eq("id", playerId);
        resetPlayerState();
        resetRoomState();
        router.push("/");
    }

    return (
        <Button
            onClick={handleExitRoom}
            className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-r-md transition'
        >
            退出
        </Button>
    )
}

export default ExitRoomButton