"use client";

import React, { useEffect, useRef } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import useGameStore from '@/store/gameStore';

const MessageBoard = () => {
    const messages = useGameStore(state => state.messages);

    const scrollRef = useRef<HTMLDivElement>(null);

    // ✅ 新しいメッセージが追加されたらスクロール
    useEffect(() => {
        const viewport = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollRef.current && viewport) {
            viewport.scrollTop = viewport.scrollHeight;
            console.log("scrollHeight:", scrollRef.current.scrollHeight);
            console.log("clientHeight:", scrollRef.current.clientHeight);
            console.log("scrollTop:", scrollRef.current.scrollTop);
        }
    }, [messages]);
    
    return (
        <Card className="fixed bottom-72 left-5 w-[300px] h-[270px] p-4 rounded-lg bg-white flex flex-col">
            <h2 className="text-center font-semibold text-gray-900 mb-2"> メッセージボード</h2>
            
            {/* ✅ スクロール可能なメッセージエリア */}
            <ScrollArea className="flex-1 overflow-y-auto border border-gray-300 rounded-lg p-2" ref={scrollRef}>
                {messages.map((msg, index) => (
                <div key={index} className="p-2 border-b last:border-none text-sm text-gray-700">
                    {msg}
                </div>
                ))}
            </ScrollArea>
        </Card>
    )
}

export default MessageBoard