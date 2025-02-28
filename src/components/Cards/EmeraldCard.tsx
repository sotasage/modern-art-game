import React from 'react'
import { Card } from '@/components/ui/card'

type Props = {
  method: string,
}

const EmeraldCard = (props: Props) => {
  return (
    <Card className="w-[240px] h-[336px] rounded-xl shadow-lg flex flex-col items-center justify-between p-4 bg-emerald-50 border-2 border-gray-200">
        <div className="text-xl font-bold">
            <div>エメラルド</div>
        </div>

        <svg width="100" height="100" viewBox="0 0 100 100">
            <polygon points="30,20 70,20 80,40 80,60 70,80 30,80 20,60 20,40" fill="#1D9C5B" stroke="#156F41" strokeWidth="2"/>
            <polygon points="30,20 70,20 80,40 80,60 70,80 30,80 20,60 20,40" fill="#1D9C5B" fillOpacity="0.7"/>
            <line x1="30" y1="20" x2="30" y2="80" stroke="#156F41" strokeWidth="1"/>
            <line x1="50" y1="20" x2="50" y2="80" stroke="#156F41" strokeWidth="1"/>
            <line x1="70" y1="20" x2="70" y2="80" stroke="#156F41" strokeWidth="1"/>
        </svg>

        <div className="text-xl font-bold">
            <div>{props.method}</div>
        </div>
    </Card>
  )
}

export default EmeraldCard