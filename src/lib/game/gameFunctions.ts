import type { Card, Gem, MarketValue, Player, RoomMember } from "@/lib/types";
import { createDeck, dealCards, shuffleDeck } from "./cardFunctions";

export function shufflePlayers(players: Player[]) {
    
    // Fisher-Yatesシャッフルアルゴリズム
    for (let i = players.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [players[i], players[j]] = [players[j], players[i]]; // 要素を交換
    }
}

export function startGame(members: RoomMember[]): { updatedPlayers: Player[], updatedHands: Card[][], remainingDeck: Card[] } {
    const updatedPlayers: Player[] = [];
    const newHands: Card[][] = Array.from({ length: members.length }, () => []);
    members.map((member) => {
        updatedPlayers.push({id: member.id, name: member.name});
    });
    shufflePlayers(updatedPlayers);

    let deck = createDeck();
    deck = shuffleDeck(deck);

    let number: number = 10;
    if (members.length === 4) number = 9;
    else if (members.length === 5) number = 8;
    const { updatedHands, remainingDeck } = dealCards(deck, newHands, number);

    
    return { updatedPlayers, updatedHands, remainingDeck };
}

export function getNextTurn(nowTurn: number, playerNum: number): number {
    let newTurn = nowTurn + 1;
    if (newTurn >= playerNum) newTurn = 0;

    return newTurn;
}

export function getTopThreeGems(gemCounts: Record<Gem, number>): Gem[] {
    const gemOrder: Record<Gem, number> = {
        'diamond': 1,
        'emerald': 2,
        'sapphire': 3,
        'ruby': 4,
        'amethyst': 5
    };

    // [宝石名, カウント] のペアの配列に変換
    const gemEntries = Object.entries(gemCounts) as [Gem, number][];

    // カウントの降順でソート
    const sortedGems = gemEntries.sort((a, b) => {
        // カウントが異なる場合
        if (a[1] !== b[1]) {
            return b[1] - a[1];
        }

        // カウントが等しい場合はgemOrderに従う
        return gemOrder[a[0]] - gemOrder[b[0]];
    });

    // 上位3つの宝石名を抽出
    const topThree: Gem[] = [];
    
    for (let i = 0; i < 3; i++) {
        if (sortedGems[i][1] !== 0) topThree.push(sortedGems[i][0]);
    }
  
    return topThree;
}

export function getGemsValue(marketValueList: MarketValue[], round: number): MarketValue {
    const cumulativeValue: MarketValue = {
        diamond: 0,
        emerald: 0,
        sapphire: 0,
        ruby: 0,
        amethyst: 0
    };

    (Object.keys(cumulativeValue) as Gem[]).forEach(gem => {
        // 現在のラウンドで価値があるかチェック
        if (marketValueList[round][gem] !== null && marketValueList[round][gem] !== 0) {
            // 過去のラウンドと現在のラウンドの価値を合計
            let totalValue = 0;
            
            // 1ラウンドから現在のラウンドまで累積
            for (let i = 0; i < round + 1; i++) {
                // そのラウンドで価値があれば加算
                if (marketValueList[i][gem] !== null) {
                    totalValue += marketValueList[i][gem]!;
                }
            }
            
            cumulativeValue[gem] = totalValue;
        }
    });

    return cumulativeValue;
}

export function getPlayerEarnings(gemsValue: MarketValue, purchasedCards: Card[][]): number[] {
    const playerEarnings: number[] = purchasedCards.map(playerCards => {
        let playerEarnings = 0;
        
        // プレイヤーの各カードの価値を合計
        playerCards.forEach(card => {
            const gemValue = gemsValue[card.gem];
            if (gemValue !== null) {
                playerEarnings += gemValue;
            }
        });
        
        return playerEarnings;
    });

    return playerEarnings;
};