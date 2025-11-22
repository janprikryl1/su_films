export type DBScanResult = {
    n_clusters: number;
    noise_points: number;
    cluster_summary: {
        cluster_id: number;
        movie_count: number;
        dominant_genre: string;
        budget_count: number;
        budget_mean: number;
        popularity_count: number;
        popularity_mean: number;
        revenue_count: number;
        revenue_mean: number;
        runtime_count: number;
        runtime_mean: number;
        vote_average_mean: number;
        vote_count_count: number;
        vote_count_mean: number;
    }[];
    eps: number;
    min_samples: number;
    movies_with_cluster: {
        budget: number;
        id: number;
        popularity: number;
        revenue: number;
        runtime: number;
        vote_average: number;
        title: string;
        cluster: number;
        vote_count: number;
    }[];
    pca_data: {
        PC1: number;
        PC2: number;
        cluster: number;
    }[];
};