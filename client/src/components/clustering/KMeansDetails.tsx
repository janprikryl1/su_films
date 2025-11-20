import {type FC, useEffect, useState} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ChevronLeft, ChevronRight} from "lucide-react";
import type {KMeansResult} from "@/utils/types/KMeansResult.ts";
import {getVisiblePages} from "@/utils/functions.ts";

type Props = {
    results: KMeansResult | null;
    selectedCluster: number | null;
}

export const KMeansDetails:FC<Props> = ({results, selectedCluster}) => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [moviesPerPage] = useState<number>(10);
    const filteredMovies = (() => {
        if (!results || selectedCluster === null) return [];
        return results.movies_with_cluster.filter(movie => movie.cluster === selectedCluster);
    })();
    const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);
    const indexOfLastMovie = currentPage * moviesPerPage;
    const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
    const currentMovies = filteredMovies.slice(indexOfFirstMovie, indexOfLastMovie);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCluster]);

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };


    if (selectedCluster !== null && results) {
        return (
            <div className="mt-10">
                <h4 className="text-xl font-semibold mb-3">
                    Filmy ve shluku {selectedCluster} ({results.cluster_summary.find(c => c.cluster === selectedCluster)?.dominant_genre})
                </h4>

                <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-600">
                        Zobrazeno {indexOfFirstMovie + 1}-{Math.min(indexOfLastMovie, filteredMovies.length)} z {filteredMovies.length} filmů
                    </p>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Název filmu</TableHead>
                            <TableHead>Počet hodnocení</TableHead>
                            <TableHead>Popularita</TableHead>
                            <TableHead>Výnos</TableHead>
                            <TableHead>Trvání</TableHead>
                            <TableHead>Průměrné hodnocení</TableHead>
                            <TableHead>Rozpočet</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentMovies.map(movie => (
                            <TableRow key={movie.id}>
                                <TableCell>{movie.title}</TableCell>
                                <TableCell>{movie.vote_count}</TableCell>
                                <TableCell>{movie.popularity.toFixed(2)}</TableCell>
                                <TableCell>{movie.revenue ? `${(movie.revenue / 1_000_000)?.toFixed(1)} mil. $` : 'N/A'}</TableCell>
                                <TableCell>{(movie.runtime / 60).toFixed(2)} min.</TableCell>
                                <TableCell>{movie.vote_average.toFixed(2)}</TableCell>
                                <TableCell>{movie.budget ? `${(movie.budget / 1_000_000)?.toFixed(1)} mil. $` : 'N/A'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {currentMovies.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                        V tomto shluku nebyly nalezeny žádné filmy.
                    </p>
                )}

                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                        <p className="text-sm text-gray-600">
                            Stránka {currentPage} z {totalPages}
                        </p>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToPrevPage}
                                disabled={currentPage === 1}
                                className="flex items-center"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1"/>
                                Předchozí
                            </Button>

                            <div className="flex space-x-1">
                                {getVisiblePages(currentPage, totalPages).map((page, index) => (
                                    page === -1 ? (
                                        <span
                                            key={`ellipsis-bottom-${index}`}
                                            className="flex items-center justify-center w-8 h-8 text-gray-500"
                                        >
                                                ...
                                            </span>
                                    ) : (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setCurrentPage(page)}
                                            className="w-8 h-8 p-0"
                                        >
                                            {page}
                                        </Button>
                                    )
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className="flex items-center"
                            >
                                Další
                                <ChevronRight className="h-4 w-4 ml-1"/>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
};