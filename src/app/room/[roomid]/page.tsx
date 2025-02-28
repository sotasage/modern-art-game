"use client"

import useRoomStore from "@/store/roomStore";
import usePlayerStore from "@/store/playerStore";
import { Card, CardContent, CardTitle, CardHeader, } from '@/components/ui/card'
import PlayerCard from '@/components/PlayerCard'
import InviteUrl from "@/components/InviteUrl";
import { useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import type { RoomMember } from '@/lib/types';
import ExitRoomButton from "@/components/ExitRoomButton";
import GameStartButton from "@/components/GameStartButton";


const RoomPage = () => {
  const { 
    roomId,
    members, 
    fetchMembers, 
    addMember, 
    removeMember, 
  } = useRoomStore();
  const { playerId, isLoading, isRoomMaster, setIsRoomMaster, setIsLoading } = usePlayerStore();
  useEffect(() => {
    if (!roomId) return;

    // 初期データ取得
    fetchMembers(roomId);
    setIsLoading(false);
    console.log(members);
    // リアルタイム購読のセットアップ
    const subscription1 = supabase
      .channel(`room-${roomId}-changes`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'players',
          filter: `room_id=eq.${roomId}`
        }, 
        (payload) => {
          console.log('リアルタイム更新:', payload);
          
          // INSERT: 新しいメンバーが参加した場合
          if (payload.eventType === 'INSERT') {
            console.log("add player");
            addMember(payload.new as RoomMember);
          }
        }
      )
      .subscribe();
    const subscription2 = supabase
      .channel(`room-${roomId}-deletes`)
      .on('postgres_changes', 
        { 
          event: 'DELETE', 
          schema: 'public', 
          table: 'players',
        }, 
        (payload) => {
          console.log('リアルタイム更新:', payload);
          
          // DELETE: メンバーが退出した場合
          if (payload.eventType === 'DELETE') {
            console.log("delete player");
            removeMember(payload.old.id);
            if (playerId === members[0].id) setIsRoomMaster(true);
            else setIsRoomMaster(false);
            console.log(isRoomMaster);
            console.log(members);
          }
        }
      )
      .subscribe();
    
    // クリーンアップ関数
    return () => {
      supabase.removeChannel(subscription1);
      supabase.removeChannel(subscription2);
    };
  }, [roomId, isRoomMaster, fetchMembers, addMember, removeMember, setIsRoomMaster]);

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div>
      <Card className="w-[300px] h-[450px] bg-gray-100">
        <CardHeader>
          <CardTitle>
            プレイヤー一覧
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.map((member) => (
            <PlayerCard key={member.id} name={member.name} />
          ))}
        </CardContent>
      </Card>
      {roomId && <InviteUrl roomId={roomId} />}
      <div className="flex justify-center mt-3 gap-3">
        <ExitRoomButton/>
        {isRoomMaster && <GameStartButton/>}
      </div>
    </div>
  )
}

export default RoomPage