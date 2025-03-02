import React from 'react'
import { Card } from '@/components/ui/card'
import type { Method } from '@/lib/types'

type Props = {
  method: Method,
}

const SapphireCard = (props: Props) => {
  return (
    <Card className="w-[120px] h-[168px] rounded-xl shadow-lg flex flex-col items-center justify-between p-4 bg-blue-50 border-2 border-gray-200">
        <div className="text-[0.625rem] font-bold">
            <div>サファイア</div>
        </div>

        <svg width="50" height="50" viewBox="0 0 100 100">
            <ellipse cx="50" cy="50" rx="35" ry="25" fill="#0F52BA" stroke="#09347A" strokeWidth="2"/>
            <ellipse cx="50" cy="50" rx="35" ry="25" fill="#0F52BA" fillOpacity="0.7"/>
            <ellipse cx="40" cy="40" rx="8" ry="5" fill="white" fillOpacity="0.6"/>
            <ellipse cx="60" cy="60" rx="5" ry="3" fill="white" fillOpacity="0.4"/>
        </svg>

        <div className="text-[0.625rem] font-bold">
            <div>{props.method}</div>
        </div>
    </Card>
  )
}

export default SapphireCard