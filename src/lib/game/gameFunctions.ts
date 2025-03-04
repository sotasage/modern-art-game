import type { Card, Player, RoomMember } from "@/lib/types";
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