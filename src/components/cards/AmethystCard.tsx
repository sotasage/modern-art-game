import React from 'react'
import { Card } from '@/components/ui/card'
import type { Method } from '@/lib/types'

type Props = {
    method: Method,
}

const AmethystCard = (props: Props) => {
  return (
    <Card className="w-[120px] h-[168px] rounded-xl shadow-lg flex flex-col items-center justify-between p-4 bg-purple-50 border-2 border-gray-200">
        <div className="text-[0.625rem] font-bold">
            <div>アメジスト</div>
        </div>

        <svg width="50" height="50" viewBox="0 0 100 100">
            <polygon points="30,25 70,25 85,50 70,75 30,75 15,50" fill="#9B59B6" stroke="#7D3C98" strokeWidth="2"/>
            <polygon points="30,25 70,25 85,50 70,75 30,75 15,50" fill="#9B59B6" fillOpacity="0.7"/>
            <line x1="30" y1="25" x2="30" y2="75" stroke="#7D3C98" strokeWidth="1"/>
            <line x1="50" y1="25" x2="50" y2="75" stroke="#7D3C98" strokeWidth="1"/>
            <line x1="70" y1="25" x2="70" y2="75" stroke="#7D3C98" strokeWidth="1"/>
            <line x1="15" y1="50" x2="85" y2="50" stroke="#7D3C98" strokeWidth="1"/>
        </svg>

        <div className="text-[0.625rem] font-bold">
            <div>{props.method}</div>
        </div>
    </Card>
  )
}

export default AmethystCard