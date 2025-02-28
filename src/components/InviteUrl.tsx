"use client"

import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle, CardHeader, } from '@/components/ui/card'

type Props = {
    roomId: string;
}

const InviteUrl = (props: Props) => {
    const [isCopied, setIsCopied] = useState(false);

    const generateInviteUrl = () => {
        // 現在のURLをベースに招待URLを作成（絶対URL）
        return `${window.location.origin}/invite/${props.roomId}`;
    };

    const copyInviteUrl = () => {
        const url = generateInviteUrl();
        navigator.clipboard.writeText(url)
            .then(() => {
                // コピー成功時の処理
                setIsCopied(true);
                
                // 1.5秒後にコピー成功表示を消す
                setTimeout(() => {
                setIsCopied(false);
                }, 1500);
            })
            .catch((error) => {
                console.error('URLのコピーに失敗しました:', error);
        });
    };

    return (
        <Card className="w-[300px] h-[150px] bg-gray-100 mt-5">
            <CardHeader>
                <CardTitle>
                    友達を招待する
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center">
                    <Input
                        type="text"
                        value={generateInviteUrl()}
                        readOnly
                        className="flex-1 p-2 border rounded-l-md bg-white text-sm mr-3"
                    />
                    <Button
                        onClick={copyInviteUrl}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md transition"
                    >
                        コピー
                    </Button>
                </div>
                {isCopied && (
                    <p className="text-green-500 text-sm mt-1">
                    クリップボードにコピーしました!
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

export default InviteUrl