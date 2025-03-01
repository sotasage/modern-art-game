"use client"

import type { Card, Gem, Method, Player } from "../types";

// 山札を作成する関数
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

// 山札をシャッフルする関数
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

// カードを配る関数
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

// 手札を整理する関数
export function sortCard(hand: Card[]): Card[] {
    // 宝石の優先順位を定義
    const gemOrder: Record<Gem, number> = {
        'diamond': 1,
        'emerald': 2,
        'sapphire': 3,
        'ruby': 4,
        'amethyst': 5
    };
    // オークション方法の優先順位を定義
    const methodOrder: Record<Method, number> = {
        '公開競り': 1,
        '一声': 2,
        '入札': 3,
        '指し値': 4,
        'ダブルオークション': 5
    };
    
    return [...hand].sort((a, b) => {
        // まず宝石タイプで比較
        if (gemOrder[a.gem] !== gemOrder[b.gem]) {
          return gemOrder[a.gem] - gemOrder[b.gem];
        }
        
        // 宝石タイプが同じ場合はオークション方法で比較
        return methodOrder[a.method] - methodOrder[b.method];
    });

}
  