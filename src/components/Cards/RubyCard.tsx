import React from 'react'
import { Card } from '@/components/ui/card'

type Props = {
    method: string,
}

const RubyCard = (props: Props) => {
  return (
    <Card className="w-[240px] h-[336px] rounded-xl shadow-lg flex flex-col items-center justify-between p-4 bg-rose-50 border-2 border-gray-200">
        <div className="text-xl font-bold">
            <div>ルビー</div>
        </div>

        <svg width="100" height="100" viewBox="0 0 100 100">
            <path d="M50,20 C55,15 65,5 75,20 C85,40 55,70 50,80 C45,70 15,40 25,20 C35,5 45,15 50,20 Z" 
                fill="#E0115F" stroke="#B0092F" strokeWidth="2"/>
            <path d="M50,20 C55,15 65,5 75,20 C85,40 55,70 50,80 C45,70 15,40 25,20 C35,5 45,15 50,20 Z" 
                fill="#E0115F" fillOpacity="0.7"/>
            <ellipse cx="40" cy="35" rx="5" ry="3" fill="white" fillOpacity="0.5"/>
        </svg>

        <div className="text-xl font-bold">
            <div>{props.method}</div>
        </div>
    </Card>
  )
}

export default RubyCard