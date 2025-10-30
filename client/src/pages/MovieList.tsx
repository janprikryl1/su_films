import { useState, type FC } from "react";
import type { IMovie } from "../utils/types/IMovie";
import {useGetMovies} from "../utils/api/useGetMovies.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Clock, DollarSign, Film, Star} from "lucide-react";
import {Calendar} from "@/components/ui/calendar.tsx";
import {Button} from "@/components/ui/button.tsx";

export const MovieList: FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;
  const { isPending, error, data } = useGetMovies(currentPage, limit);

  if (isPending) {
    return <div>Načítám data...</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatRuntime = (minutes: number | null) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "bg-green-500";
    if (rating >= 6) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white flex items-center gap-3 mb-2">
              <Film className="w-8 h-8 text-blue-400" />
              Filmová databáze
            </h1>
            <p className="text-slate-400">
              Celkem {data?.total_count.toLocaleString('cs-CZ')} filmů
            </p>
          </div>
          <Badge variant="outline" className="border-blue-400 text-blue-400">
            Stránka {currentPage}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.results.map((movie: IMovie) => (
            <Card
              key={movie.id}
              className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <CardTitle className="text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                    {movie.title}
                  </CardTitle>
                  <div className={`${getRatingColor(movie.vote_average)} rounded-full px-2 py-1 flex items-center gap-1 shrink-0`}>
                    <Star className="w-3 h-3 text-white fill-white" />
                    <span className="text-white">{movie.vote_average.toFixed(1)}</span>
                  </div>
                </div>
                {movie.genres && (
                  <div className="flex flex-wrap gap-1">
                    {movie.genres.split(',').slice(0, 2).map((genre, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-slate-700 text-slate-300 border-0">
                        {genre.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-2 text-slate-300">
                {movie.release_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{movie.release_date.substring(0, 4)}</span>
                  </div>
                )}

                {movie.runtime && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                )}

                {movie.budget > 0 && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <span>{formatCurrency(movie.budget)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
                  <span className="text-slate-400">Hlasů: {movie.vote_count.toLocaleString('cs-CZ')}</span>
                  <span className="text-slate-500">ID: {movie.id}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            variant="outline"
            className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50"
          >
            Předchozí
          </Button>

          <span className="text-white px-4">
            Stránka {currentPage}
          </span>

          <Button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={!data?.next}
            variant="outline"
            className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50"
          >
            Další
          </Button>
        </div>
      </div>
    </div>
  );
};
