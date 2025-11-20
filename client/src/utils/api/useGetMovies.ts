import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { IMovieListResponse } from "../types/IMovieListResponse.ts";
import type { FilterCondition } from "../types/FilterCondition.ts";
import {API_BASE_URL} from "@/utils/constants";

export const useGetMovies = (page: number, limit: number, filters: FilterCondition[]) => {
  const { isPending, error, data } = useQuery({
    queryKey: ['movie-list', page, limit, filters],
    queryFn: async () => {
      const filterString = filters.length > 0 ? JSON.stringify(filters) : undefined;
      const response = await axios.get<IMovieListResponse>(
        API_BASE_URL+"movies/", {
          params: {
            page,
            limit,
            filters: filterString
          }
        }
      );
      return response.data;
    }
  });
  return { isPending, error, data };
};