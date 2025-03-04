"use client"

import useRoomStore from "@/store/roomStore";
import usePlayerStore from "@/store/playerStore";
import { Card, CardContent, CardTitle, CardHeader, } from '@/components/ui/card'
import PlayerCard from '@/components/others/PlayerCard'
import InviteUrl from "@/components/others/InviteUrl";
import { useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import type { RoomMember } from '@/lib/types';
import ExitRoomButton from "@/components/others/ExitRoomButton";
import GameStartButton from "@/components/others/GameStartButton";
import { useRouter } from "next/navigation";


const RoomPage = () => {
  const members = useRoomStore(state => state.members);

  const isLoading = usePlayerStore(state => state.isLoading);
  const isRoomMaster = usePlayerStore(state => state.isRoomMaster);

  const router = useRouter();

  useEffect(() => {
    const roomId = useRoomStore.getState().roomId;
    const fetchMembers = useRoomStore.getState().fetchMembers;
    const addMember = useRoomStore.getState().addMember;
    const removeMember = useRoomStore.getState().removeMember;
    const playerId = usePlayerStore.getState().playerId;
    const setIsRoomMaster = usePlayerStore.getState().setIsRoomMaster;
    const setIsLoading = usePlayerStore.getState().setIsLoading;

    if (!roomId) return;

    // 初期データ取得
    fetchMembers(roomId);
    setIsLoading(false);
    console.log(roomId);
    console.log(useRoomStore.getState().members);
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
            console.log(useRoomStore.getState().members);
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
            if (playerId === useRoomStore.getState().members[0].id) setIsRoomMaster(true);
            else setIsRoomMaster(false);
            console.log(usePlayerStore.getState().isRoomMaster);
            console.log(useRoomStore.getState().members);
          }
        }
      )
      .subscribe();
    const subscription3 = supabase
      .channel(`game-${roomId}-start`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'rooms',
        },
        (payload) => {
          console.log('リアルタイム更新:', payload);
          
          if (payload.eventType === 'UPDATE') {
            console.log("game start!");
            setIsLoading(true);
            router.push(`/game/${roomId}`);
          }
        }
      )
      .subscribe();
    // クリーンアップ関数
    return () => {
      supabase.removeChannel(subscription1);
      supabase.removeChannel(subscription2);
      supabase.removeChannel(subscription3);
    };
  }, [router]);// membersを含めると無限ループするので注意

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
      {
        (() => {
          const roomId = useRoomStore.getState().roomId;
          return roomId && <InviteUrl roomId={roomId} />;
        })()
      }
      <div className="flex justify-center mt-3 gap-3">
        <ExitRoomButton/>
        {isRoomMaster && <GameStartButton/>}
      </div>
    </div>
  )
}

export default RoomPage