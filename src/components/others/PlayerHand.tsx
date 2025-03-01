"use client"

import React, { useState } from 'react';
import { Card } from '@/lib/types';
import AmethystCard from '@/components/cards/AmethystCard';
import DiamondCard from '@/components/cards/DiamondCard';
import EmeraldCard from '@/components/cards/EmeraldCard';
import RubyCard from '@/components/cards/RubyCard';
import SapphireCard from '@/components/cards/SapphireCard';

interface PlayerHandProps {
  cards: Card[];
}

const PlayerHand: React.FC<PlayerHandProps> = ({ cards }) => {
    const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
    const onClick = (index: number) => {
        setSelectedCardIndex(selectedCardIndex === index ? null : index);
    };

    return (
        <div className="fixed left-0 right-0 p-4">
            <div className="max-w-5xl mx-auto">
                
                <div className="flex justify-center">
                    <div className="relative h-40" style={{ width: `${cards.length * 30 + 240}px` }}>
                        {cards.map((card, index) => {
                        // カードを少しずつずらして重ねて表示
                            const offset = index * 30;
                            const isSelected = selectedCardIndex === index;
                            
                            return (
                                <div 
                                    key={index}
                                    className={`absolute transition-all ${
                                        isSelected ? '-translate-y-8' : 'hover:-translate-y-6'
                                    }`}
                                    style={{ 
                                        left: `${offset}px`,
                                        zIndex: isSelected ? 1000 : index
                                    }}
                                    onClick={() => onClick(index)}
                                >
                                    {card.gem === "diamond" && <DiamondCard method={card.method} />}
                                    {card.gem === "emerald" && <EmeraldCard method={card.method} />}
                                    {card.gem === "sapphire" && <SapphireCard method={card.method} />}
                                    {card.gem === "ruby" && <RubyCard method={card.method} />}
                                    {card.gem === "amethyst" && <AmethystCard method={card.method} />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerHand;