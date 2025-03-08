import React from 'react'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useGameStore from '@/store/gameStore';

const MarketValueTable = () => {
    const marketValueList = useGameStore(state => state.marketValueList);

    return (
        <div className="fixed top-0 left-0 transform scale-90">
        <Table className="border border-gray-300">
            <TableHeader>
            <TableRow className="bg-gray-100">
                <TableHead className="text-center">ラウンド</TableHead>
                <TableHead className="text-center">ダイヤモンド</TableHead>
                <TableHead className="text-center">エメラルド</TableHead>
                <TableHead className="text-center">サファイア</TableHead>
                <TableHead className="text-center">ルビー</TableHead>
                <TableHead className="text-center">アメジスト</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {marketValueList.map((market, index) => (
                <TableRow key={index}>
                <TableCell className="text-center">{index + 1}R</TableCell>
                <TableCell className="text-center">{market.diamond !== null ? `$${market.diamond.toLocaleString()}` : "-"}</TableCell>
                <TableCell className="text-center">{market.emerald !== null ? `$${market.emerald.toLocaleString()}` : "-"}</TableCell>
                <TableCell className="text-center">{market.sapphire !== null ? `$${market.sapphire.toLocaleString()}` : "-"}</TableCell>
                <TableCell className="text-center">{market.ruby !== null ? `$${market.ruby.toLocaleString()}` : "-"}</TableCell>
                <TableCell className="text-center">{market.amethyst !== null ? `$${market.amethyst.toLocaleString()}` : "-"}</TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
        </div>
    )
}

export default MarketValueTable