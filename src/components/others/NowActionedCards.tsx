import React from 'react'
import { Card } from '../ui/card'
import AmethystCard from '@/components/cards/AmethystCard';
import DiamondCard from '@/components/cards/DiamondCard';
import EmeraldCard from '@/components/cards/EmeraldCard';
import RubyCard from '@/components/cards/RubyCard';
import SapphireCard from '@/components/cards/SapphireCard';
import useGameStore from '@/store/gameStore';

const NowActionedCards = () => {
    const nowActionedCards = useGameStore(state => state.nowActionedCards);

    return (
        <Card className="fixed bottom-3 left-5 rounded-lg bg-white w-[300px] h-[250px] flex flex-col items-center p-5">
            
            <h1 className="text-lg font-semibold text-gray-900 text-center leading-tight mb-5">
                競売中のカード
            </h1>
            <div className="flex justify-center gap-5 origin-top mb-1">
                {nowActionedCards.map((card, index) => {
                    return (
                        <div key={index}>
                            {card.gem === "diamond" && <DiamondCard method={card.method} />}
                            {card.gem === "emerald" && <EmeraldCard method={card.method} />}
                            {card.gem === "sapphire" && <SapphireCard method={card.method} />}
                            {card.gem === "ruby" && <RubyCard method={card.method} />}
                            {card.gem === "amethyst" && <AmethystCard method={card.method} />}
                        </div>
                    );
                })}
            </div>
        </Card>
    )
}

export default NowActionedCards