"use client"

import React from 'react';
import AmethystCard from '@/components/cards/AmethystCard';
import DiamondCard from '@/components/cards/DiamondCard';
import EmeraldCard from '@/components/cards/EmeraldCard';
import RubyCard from '@/components/cards/RubyCard';
import SapphireCard from '@/components/cards/SapphireCard';
import { sortCard } from '@/lib/game/cardFunctions';
import useGameStore from '@/store/gameStore';

const PlayerHand = () => {
    const myTurn = useGameStore.getState().myTurn;
    const hands = useGameStore(state => state.hands);
    const setSelectedCard = useGameStore.getState().setSelectedCard;
    const selectedCardIndex = useGameStore(state => state.selectedCardIndex);
    const setSelectedCardIndex = useGameStore(state => state.setSelectedCardIndex);
    const selectedDoubleAuction = useGameStore(state => state.selectedDoubleAuction);
    const doubleAuctionState = useGameStore(state => state.doubleAuctionState);

    const onClick = (index: number) => {
        if (selectedCardIndex == index) {
            setSelectedCardIndex(null);
            setSelectedCard(null);
        }
        else {
            setSelectedCardIndex(index);
            setSelectedCard(hands[myTurn][index]);
        }
        console.log(useGameStore.getState().selectedCard);
    };
    const hand = sortCard(hands[myTurn] ?? []);

    const maxWidth = 850; // カードを並べる最大幅（表示範囲）
    const cardWidth = 120; // カード1枚の幅
    const minSpacing = 30; // カード間の最小間隔

    // カード間のスペースを動的に計算
    const spacing = Math.max(minSpacing, (maxWidth - cardWidth) / (hand.length - 1 || 1));

    return (
        <div className="fixed left-0 right-0 bottom-0 p-4">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-center">
                    <div className="relative h-40" style={{ width: `${maxWidth}px` }}>
                        {hand.map((card, index) => {
                            // カードを少しずつずらして重ねて表示
                            const offset = (index - (hand.length - 1) / 2) * spacing;
                            const isSelected = selectedCardIndex === index;
                            const isDisable = (selectedDoubleAuction &&
                                (selectedDoubleAuction.gem !== card.gem || card.method === "ダブルオークション")) || 
                                ((doubleAuctionState.daCard && doubleAuctionState.nowPlayer === myTurn) &&
                                (doubleAuctionState.daCard.gem !== card.gem || card.method === "ダブルオークション"))
                            
                            return (
                                <div 
                                    key={index}
                                    className={`absolute transition-transform duration-300
                                        ${isDisable ? 'opacity-30 cursor-not-allowed' : ""}
                                    `}
                                    style={{ 
                                        left: `50%`, 
                                        transform: `translateX(${offset}px) translateX(-10%)`,
                                        zIndex: isSelected ? 1000 : index
                                    }}
                                    onClick={() => !isDisable && onClick(index)}
                                >
                                    <div
                                        className={`transition-transform duration-300 
                                            ${isSelected ? "translate-y-[-25px] z-50" : "hover:translate-y-[-15px] hover:z-40"}
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