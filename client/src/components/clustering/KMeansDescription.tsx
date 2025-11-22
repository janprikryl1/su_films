import type {FC} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";

export const KMeansDescription:FC = () => {
    return (
        <div className="mt-4">
            <p className="text-lg font-semibold">Interpretace:</p>
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-100">
                        <TableHead>ID Shluku</TableHead>
                        <TableHead>Popis</TableHead>
                        <TableHead>Charakteristika</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>0</TableCell>
                        <TableCell>Nízkorozpočtové/Průměrné</TableCell>
                        <TableCell>Druhý největší shluk, nízké hodnocení, nízký rozpočet a tržby. Standardní, kratší, nezajímavé filmy.</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>1</TableCell>
                        <TableCell>Nízkorozpočtové s Průměrným Hodnocením</TableCell>
                        <TableCell>Největší shluk, průměrné hodnocení.</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>2</TableCell>
                        <TableCell>Úspěšné</TableCell>
                        <TableCell>Malý shluk, extrémně vysoké průměrné tržby a vysoké hodnocení. Typicky vysoko rozpočtové akční filmy.</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>3</TableCell>
                        <TableCell>Dobře hodnocené</TableCell>
                        <TableCell>Středně velký shluk. Výrazně vyšší rozpočet a tržby než shluk 1. Mají dobré hodnocení - typicky úspěšné akční filmy.</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>4</TableCell>
                        <TableCell>Slušný výkon</TableCell>
                        <TableCell>Nejmenší shluk, vyšší rozpočet a tržby. Typické pro thrillery a dramata, které mají slušnou návratnost.</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
};