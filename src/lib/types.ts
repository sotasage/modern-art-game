export type RoomMember = {
    id: string;
    name: string;
    room_id: string;
    created_at: string;
};

export type Gem = 'diamond' | 'emerald' | 'sapphire' | 'ruby' | 'amethyst';

export type Method = '公開競り' | '一声' | '入札' | '指し値' | 'ダブルオークション' ;

export type Card = {
    gem: Gem;
    method: Method;
}

export type Player = {
    id: string;
    name: string;
}

export type MarketValue = {
    diamond: number | null;
    emerald: number | null;
    sapphire: number | null;
    ruby: number | null;
    amethyst: number | null;
}

export type Phase = "カード選択" | "公開競り" | "一声" | "入札" | "指し値" | "ダブルオークション" | "結果発表" ; 

export type PublicAuction = {
    betSize: number;
    isFinished: boolean;
}

export type OneVoiceAuction = {
    nowPlayer: number;
    maxPlayer: number;
    maxBetSize: number;
}

export type BidAuction = {
    isDecided: boolean;
    betSize: number;
}

export type SpecifyAuction = {
    nowPlayer: number;
    betSize: number;
    isPurchased: boolean;
}

