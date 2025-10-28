import type { IMovie } from "./IMovie";

export interface IMovieListResponse {
    total_count: number;
    page: number;
    limit: number;
    next: boolean;
    results: IMovie[];
}