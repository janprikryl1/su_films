import { useState, useEffect, type FC } from "react";
import axios from "axios";
import type { IMovieListResponse } from "../utils/types/IMovieListResponse";
import type { IMovie } from "../utils/types/IMovie";

export const MovieList: FC = () => {
  const [data, setData] = useState<IMovieListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get<IMovieListResponse>(
          "http://127.0.0.1:8000/movies/?page=1&limit=20"
        );
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Chyba při stahování filmů:", error);
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  if (loading) {
    return <div>Načítám data...</div>;
  }

  return (
    <div>
      <h1>Filmy ({data?.total_count} celkem)</h1>
      {data?.results.map((movie: IMovie) => (
        <div key={movie.id}>
          <h2>
            {movie.title} ({movie.release_date?.substring(0, 4)})
          </h2>
          <p>Rating: {movie.vote_average}</p>
          <p>Rozpočet: {movie.budget.toLocaleString()} USD</p>
        </div>
      ))}
      {/* Zde byste přidali ovládací prvky pro stránkování, např. tlačítko "Další" */}
    </div>
  );
};
