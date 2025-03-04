import React from 'react'
import { Card } from '../ui/card'
import useGameStore from '@/store/gameStore';

const PossessedMoney = () => {
    const turn = useGameStore.getState().myTurn;
    const money = useGameStore(state => state.money);

    return (
        <Card className="fixed bottom-2 right-4 p-1 rounded-lg bg-white w-40 h-12 flex items-center justify-center">
            <h2 className="text-center font-semibold text-gray-900">
                所持金: ${money[turn].toLocaleString()}
            </h2>
        </Card>
    )
}

export default PossessedMoney