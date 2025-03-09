import React from 'react'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import useGameStore from '@/store/gameStore'
import { Button } from '../ui/button'
import usePlayerStore from '@/store/playerStore'
import { supabase } from '@/lib/supabase'
import useRoomStore from '@/store/roomStore'

const Result = () => {
    const round = useGameStore(state => state.round);
    const money = useGameStore.getState().money;
    const players = useGameStore.getState().players;
    const isRoomMaster = usePlayerStore.getState().isRoomMaster;
    const roomId = useRoomStore.getState().roomId;

    // money: number[] を[index, money]の配列に変換
    let indexedMoney: [number, number][] = [];
    let sortMoney: [number, number][] = [];
    if (round === 4) {
        indexedMoney = money.map((amount, index) => [index, amount]);
        sortMoney = indexedMoney.sort((a, b) => b[1] - a[1]);
    }

    const onClick = async () => {
        const { error: deleteError } = await supabase
            .from('games')
            .delete()
            .eq('room_id', roomId) 
        if (deleteError) {
            console.error("ゲームデータ削除エラー", deleteError);
            return;
        }

        const { error: updateError } = await supabase
            .from('rooms')
            .update({
                status: "waiting",
            })
            .eq("id", roomId); 
        if (updateError) {
            console.error("ゲーム終了エラー", updateError);
            return;
        }
    }

    return (
        <>
            {round === 4 && (
                <Dialog open={true}>
                    <DialogContent className="flex flex-col justify-between">
                        <DialogTitle>最終結果</DialogTitle>
                        {sortMoney.map((money, index) => (
                            <h2 key={index} className='text-center text-lg'>{index + 1}位: {players[money[0]]?.name || ""}  所持金: ${money[1].toLocaleString()}</h2>
                        ))}
                        {isRoomMaster ? (
                            <Button
                                onClick={onClick}
                                className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-r-md transition'
                            >
                                ロビーに戻る
                            </Button>
                        ) : (
                            <h2 className='text-center text-base text-gray-500'>
                                ルームマスターがロビーに戻る操作を実行するまでお待ちください
                            </h2>
                        )}
                        
                    </DialogContent>
                </Dialog>
            )}
        </>
    )
}

export default Result