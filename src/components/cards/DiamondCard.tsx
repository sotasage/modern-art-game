import React from 'react'
import { Card } from '@/components/ui/card'
import type { Method } from '@/lib/types'

type Props = {
  method: Method,
}

const DiamondCard = (props: Props) => {
  return (
    <Card className="w-[240px] h-[336px] rounded-xl shadow-lg flex flex-col items-center justify-between p-4 bg-cyan-50 border-2 border-gray-200">
        <div className="text-xl font-bold">
            <div>ダイヤモンド</div>
        </div>

        <svg width="100" height="100" viewBox="0 0 100 100">
            <polygon points="50,10 90,50 50,90 10,50" fill="none" stroke="#A9C6D9" strokeWidth="2"/>
            <polygon points="50,10 90,50 50,90 10,50" fill="#E6F0F6" fillOpacity="0.7"/>
            <line x1="50" y1="10" x2="50" y2="90" stroke="#A9C6D9" strokeWidth="1"/>
            <line x1="10" y1="50" x2="90" y2="50" stroke="#A9C6D9" strokeWidth="1"/>
            <circle cx="50" cy="50" r="5" fill="white"/>
        </svg>

        <div className="text-xl font-bold">
            <div>{props.method}</div>
        </div>
    </Card>
  )
}

export default DiamondCard