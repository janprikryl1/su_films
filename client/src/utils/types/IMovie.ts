export interface IMovie {
    id: number;
    title: string;
    release_date: string | null;
    vote_average: number;
    vote_count: number;
    popularity: number;
    budget: number;
    revenue: number;
    runtime: number | null;
    genres: string;
    spoken_languages: string;
}