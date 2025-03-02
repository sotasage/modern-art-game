import React from 'react'
import { Card, CardContent } from '../ui/card'

type Props = {
    money: number;
}

const PossessedMoney = (props: Props) => {
  return (
    <Card className="fixed bottom-4 right-4 p-4 shadow-lg rounded-lg bg-white w-40 h-20 flex items-center justify-center">
        <CardContent className="text-lg font-semibold text-gray-900 text-center p-0">
            所持金: ${props.money.toLocaleString()}
        </CardContent>
    </Card>
  )
}

export default PossessedMoney