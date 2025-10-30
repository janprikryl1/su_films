import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { IMovieListResponse } from "../types/IMovieListResponse.ts";

export const useGetMovies = (page: number, limit: number) => {
  const { isPending, error, data } = useQuery({
    queryKey: ['movie-list', page, limit],
    queryFn: async () => {
      const response = await axios.get<IMovieListResponse>(
        "http://127.0.0.1:8000/movies/", {
          params: {
            page,
            limit
          }
        }
      );
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
  return { isPending, error, data };
};