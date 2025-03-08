import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Card, Player, MarketValue, Phase, PublicAuction, OneVoiceAuction, BidAuction, SpecifyAuction, DoubleAuction, Gem } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { discardCard } from '@/lib/game/cardFunctions';

type GameState = {
    players: Player[];
    deck: Card[];
    hands: Card[][];
    money: number[];
    nowTurn: number;
    marketValueList: MarketValue[];
    purchasedCards: Card[][];
    nowActionedCards: Card[];
    newNowActionedCards: Card[];
    messages: string[];
    selectedCard: Card | null;
    selectedCardIndex: number | null;
    myTurn: number;
    isGameStarted: boolean;
    phase: Phase;
    selectedDoubleAuction: Card | null;
    publicAuctionState: PublicAuction[],
    oneVoiceAuctionState: OneVoiceAuction,
    bidAuctionState: BidAuction[],
    specifyAuctionState: SpecifyAuction,
    doubleAuctionState: DoubleAuction,
    round: number,
    gemCounts: Record<Gem, number>,
    setPlayers: (players: Player[]) => void;
    setDeck: (deck: Card[]) => void;
    setMoney: (money: number[]) => void;
    setMarketValueList: (marketValueList: MarketValue[]) => void;
    fetchGameData: (roomId: string) => Promise<void>;
    setNowActionedCards: (nowActionedCards: Card[]) => void;
    setNewNowActionedCards: (newNowActionedCards: Card[]) => void;
    addMessage: (message: string) => void;
    setSelectedCard: (selectedCard: Card | null) => void;
    setSelectedCardIndex: (index: number | null) => void;
    setMyTurn: (myTurn: number) => void;
    changePhase: (phase: Phase, roomId: string) => Promise<void>;
    setPhase: (phase: Phase) => void;
    setSelectedDoubleAuction: (selectedDoubleAuction: Card | null) => void;
    discardCard: (cardIndex: number) => void;
    setPublicAuctionState: (publicAuctionState: PublicAuction[]) => void;
    setPurchasedCards: (purchasedCards: Card[][]) => void;
    setNowTurn: (nowTurn: number) => void;
    setOneVoiceAuctionState: (state: OneVoiceAuction) => void;
    setBidAuctionState: (state: BidAuction[]) => void;
    setSpecifyAuctionState: (state: SpecifyAuction) => void;
    setDoubleAuctionState: (state: DoubleAuction) => void;
    setRound: (round: number) => void;
    setGemCounts: (counts: Record<Gem, number>) => void;
    setHands: (hands: Card[][]) => void;
};

const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            players: [],
            deck: [],
            hands: [],
            money: [],
            nowTurn: 0,
            marketValueList: [],
            purchasedCards: [],
            nowActionedCards: [],
            newNowActionedCards: [],
            messages: [],
            myTurn: -1,
            selectedCard: null,
            selectedCardIndex: null,
            isGameStarted: false,
            phase: "カード選択",
            selectedDoubleAuction: null,
            publicAuctionState: [],
            oneVoiceAuctionState: { nowPlayer: -1, maxPlayer: -1, maxBetSize: -1 },
            bidAuctionState: [],
            specifyAuctionState: { nowPlayer: -1, betSize: -1, isPurchased: false },
            doubleAuctionState: { nowPlayer: -1, daCard: null, selectCard: null },
            round: 0,
            gemCounts: { diamond: 0, emerald: 0, sapphire: 0, ruby: 0, amethyst: 0 },
            setPlayers: (players) => set({players: players}),
            setDeck: (deck) => set({deck: deck}),
            setMoney: (money) => set({money: money}),
            setMarketValueList: (marketValueList) => set({marketValueList: marketValueList}),
            fetchGameData: async (roomId) => {
                const { data, error } = await supabase
                    .from('games')
                    .select('*')
                    .eq('room_id', roomId)
                    .single();
                
                if (error) {
                    console.error("ゲームデータ取得エラー", error);
                    return;
                }
                set({
                    players: data.players,
                    deck: data.deck,
                    hands: data.hands,
                    money: data.money,
                    nowTurn: data.nowTurn,
                    marketValueList: data.marketValueList,
                    purchasedCards: data.purchasedCards,
                    nowActionedCards: data.nowActionedCards,
                    newNowActionedCards: [],
                    messages: [],
                    selectedCard: null,
                    isGameStarted: true,
                    phase: data.phase,
                    selectedDoubleAuction: null,
                    publicAuctionState: data.publicAuctionState,
                    oneVoiceAuctionState: data.oneVoiceAuctionState,
                    bidAuctionState: data.bidAuctionState,
                    specifyAuctionState: data.specifyAuctionState,
                    doubleAuctionState: data.doubleAuctionState,
                    round: data.round,
                    gemCounts: { diamond: 0, emerald: 0, sapphire: 0, ruby: 0, amethyst: 0 },
                });
            },
            setNowActionedCards: (nowActionedCards) => set({nowActionedCards: nowActionedCards}),
            setNewNowActionedCards: (newNowActionedCards) => set({newNowActionedCards: newNowActionedCards}),
            addMessage: (message) => set((state) => ({
                messages: [...state.messages, message]
            })),
            setSelectedCard: (selectedCard) => set({selectedCard: selectedCard}),
            setSelectedCardIndex: (index) => set({selectedCardIndex: index}),
            setMyTurn: (myTurn) => set({myTurn: myTurn}),
            changePhase: async (phase, roomId) => {
                if (phase === get().phase) return;
                const { data, error } = await supabase
                    .from('games')
                    .update({ phase: phase })
                    .eq("room_id", roomId)
                    .select()
                    .single();
                if (error) {
                    console.error("フェイズ変更エラー", error);
                    return;
                }
                set({ phase: data.phase });
            },
            setPhase: (phase) => set({phase: phase}),
            setSelectedDoubleAuction: (selectedDoubleAuction) => set({selectedDoubleAuction: selectedDoubleAuction}),
            discardCard: (cardIndex) => {
                const nowHands = get().hands;
                const myTurn = get().myTurn;
                const newHand: Card[] = discardCard(nowHands[myTurn], cardIndex);
                const newHands = nowHands.map((hand, index) => 
                    index === myTurn ? newHand : hand
                );
                set({hands: newHands});
            },
            setPublicAuctionState: (publicAuctionState) => set({publicAuctionState: publicAuctionState}),
            setPurchasedCards: (purchasedCards) => set({purchasedCards: purchasedCards}),
            setNowTurn: (nowTurn) => set({nowTurn: nowTurn}),
            setOneVoiceAuctionState: (state) => set({oneVoiceAuctionState: state}),
            setBidAuctionState: (state) => set({bidAuctionState: state}),
            setSpecifyAuctionState: (state) => set({specifyAuctionState: state}),
            setDoubleAuctionState: (state) => set({doubleAuctionState: state}),
            setRound: (round) => set({round: round}),
            setGemCounts: (counts) => set({gemCounts: counts}),
            setHands: (hands) => set({hands: hands}),
        }),
        {
            name: 'game-storage', // ストレージのキー名
            storage: createJSONStorage(() => localStorage), // localStorage または sessionStorage
        }
    )
);

export default useGameStore;