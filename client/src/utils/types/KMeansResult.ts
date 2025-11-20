import type {ClusterSummary} from "@/utils/types/ClusterSummary.ts";
import type {Movie} from "@/utils/types/Movie.ts";

export type KMeansResult = {
    n_clusters: number;
    cluster_summary: ClusterSummary[];
    movies_with_cluster: Movie[];
    pca_data: {
        PC1: number;
        PC2: number;
        cluster: number;
    }[];
};