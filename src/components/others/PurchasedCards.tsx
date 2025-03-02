import React from 'react'
import { Card } from '../ui/card'
import AmethystCard from '@/components/cards/AmethystCard';
import DiamondCard from '@/components/cards/DiamondCard';
import EmeraldCard from '@/components/cards/EmeraldCard';
import RubyCard from '@/components/cards/RubyCard';
import SapphireCard from '@/components/cards/SapphireCard';
import useGameStore from '@/store/gameStore';

const PurchasedCards = () => {
    const players = useGameStore.getState().players;
    const purchasedCards = useGameStore(state => state.purchasedCards);

    return (
        <Card className="fixed top-1 right-5 rounded-lg bg-gray-100 w-[1030px] h-[555px] flex flex-col items-center justify-between p-1 gap-1">
            <h1 className="text-sm font-semibold text-gray-900 text-center leading-tight">
                購入したカード一覧
            </h1>
            {players.map((player, index) => {
                return (
                    <Card key={index} className="rounded-lg bg-white w-[1020px] h-[100px] flex justify-start p-2 gap-2">
                        <h1 className="text-sm font-semibold text-gray-900 leading-tight w-[60px] flex-shrink-0">
                            {player.name}
                        </h1>
                        <div className="gap-2 transform scale-50 origin-top-left flex justify-start">
                            {purchasedCards[index].map((card, index) => {
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
            })}
            
        </Card>
    )
}

export default PurchasedCards