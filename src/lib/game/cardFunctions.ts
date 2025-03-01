"use client"

import type { Card, Gem, Method, Player } from "../types";

export function createDeck(): Card[] {
    const gems: Gem[] = ['diamond', 'emerald', 'sapphire', 'ruby', 'amethyst'];
    const methods: Method[] = ["公開競り", "一声", "入札", "指し値", "ダブルオークション"];
    const deck: Card[] = [];
    
    // デッキを作成
    gems.forEach(gem => {
        methods.forEach(method => {
            let number: number;
            if (gem === "amethyst" && method === "公開競り") number = 4;
            else if (
                gem === "diamond" && (method === "入札" || method === "指し値" || method === "ダブルオークション") ||
                gem === "emerald" && (method === "一声" || method === "ダブルオークション") ||
                gem === "sapphire" && (method === "ダブルオークション")
            ) number = 2;
            else number = 3;

            for (let i = 0; i < number; i++) deck.push({gem: gem, method: method});
        });
    });

    return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
    // 元の配列を変更しないよう、コピーを作成
    const shuffled = [...deck];
    
    // Fisher-Yatesシャッフルアルゴリズム
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // 要素を交換
    }
    
    return shuffled;
}

export function dealCards(deck: Card[], players: Player[], number: number): { updatedPlayers: Player[], remainingDeck: Card[] } {
    const remainingDeck = [...deck];
    const updatedPlayers = players.map(player => ({
        ...player,
        hand: [...player.hand] // 既存の手札をコピー
    }));

    for (let i = 0; i < number; i++) {
        for (let j = 0; j < updatedPlayers.length; j++) {
            if (remainingDeck.length > 0) {
                const card = remainingDeck.shift()!; // 山札の一番上からカードを取る
                updatedPlayers[j].hand.push(card);
            }
        }
    }

    return { updatedPlayers, remainingDeck };
}
  