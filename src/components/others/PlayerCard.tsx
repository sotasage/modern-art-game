import React from 'react'
import { Card, CardContent, } from '@/components/ui/card'

type Props = {
    name: string
}

const PlayerCard = (props: Props) => {
  return (
    <Card className="w-[250px] h-[50px] my-5 flex items-center justify-center ">
        <CardContent className='p-0'>
            <p className='text-lg font-medium text-gray-800'>{props.name}</p>
        </CardContent>
    </Card>
  )
}

export default PlayerCard