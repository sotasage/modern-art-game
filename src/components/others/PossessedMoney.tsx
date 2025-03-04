import React from 'react'
import { Card, CardContent } from '../ui/card'
import useGameStore from '@/store/gameStore';

const PossessedMoney = () => {
    const turn = useGameStore.getState().myTurn;
    const money = useGameStore(state => state.money);

    return (
        <Card className="fixed bottom-4 right-4 p-4 rounded-lg bg-white w-40 h-20 flex items-center justify-center">
            <CardContent className="text-lg font-semibold text-gray-900 text-center p-0">
                所持金: ${money[turn].toLocaleString()}
            </CardContent>
        </Card>
    )
}

export default PossessedMoney