"use client"

import React, { useState } from 'react';
import { Card } from '@/lib/types';
import AmethystCard from '@/components/cards/AmethystCard';
import DiamondCard from '@/components/cards/DiamondCard';
import EmeraldCard from '@/components/cards/EmeraldCard';
import RubyCard from '@/components/cards/RubyCard';
import SapphireCard from '@/components/cards/SapphireCard';
import { sortCard } from '@/lib/game/cardFunctions';

interface PlayerHandProps {
  cards: Card[];
}

const PlayerHand: React.FC<PlayerHandProps> = ({ cards }) => {
    const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
    const onClick = (index: number) => {
        setSelectedCardIndex(selectedCardIndex === index ? null : index);
    };
    const hand = sortCard(cards);

    const maxWidth = 1500; // カードを並べる最大幅（表示範囲）
    const cardWidth = 125; // カード1枚の幅
    const minSpacing = 30; // カード間の最小間隔

    // カード間のスペースを動的に計算
    const spacing = Math.max(minSpacing, (maxWidth - cardWidth) / (hand.length - 1 || 1));

    return (
        <div className="fixed left-0 right-0 bottom-10 p-4">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-center transform scale-50">
                    <div className="relative h-40" style={{ width: `${maxWidth}px` }}>
                        {hand.map((card, index) => {
                        // カードを少しずつずらして重ねて表示
                        const offset = (index - (hand.length - 1) / 2) * spacing;
                            const isSelected = selectedCardIndex === index;
                            
                            return (
                                <div 
                                    key={index}
                                    className="absolute transition-transform duration-300"
                                    style={{ 
                                        left: `50%`, 
                                        transform: `translateX(${offset}px) translateX(20%)`,
                                        zIndex: isSelected ? 1000 : index
                                    }}
                                    onClick={() => onClick(index)}
                                >
                                    <div
                                        className={`transition-transform duration-300 
                                            ${isSelected ? "translate-y-[-50px] z-50" : "hover:translate-y-[-25px] hover:z-40"}
                                        `}
                                    >
                                        {card.gem === "diamond" && <DiamondCard method={card.method} />}
                                        {card.gem === "emerald" && <EmeraldCard method={card.method} />}
                                        {card.gem === "sapphire" && <SapphireCard method={card.method} />}
                                        {card.gem === "ruby" && <RubyCard method={card.method} />}
                                        {card.gem === "amethyst" && <AmethystCard method={card.method} />}
                                    </div>
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