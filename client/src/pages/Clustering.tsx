import {type FC, useState} from "react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {KMeans} from "@/components/clustering/KMeans.tsx";
import {DBScan} from "@/components/clustering/DBScan.tsx";

type ClusteringMethod = 'kmeans' | 'dbscan';

export const Clustering: FC = () => {
  const [clusteringMethod, setClusteringMethod] = useState<ClusteringMethod>('kmeans');

  return (
    <div className="flex flex-col items-center justify-center">
        <div className="flex items-center space-x-2 mb-10 mt-5">
            <h2 className="text-3xl font-bold mr-4">Vyberte metodu pro Clustering</h2>
            <Select
                value={clusteringMethod}
                onValueChange={(value: ClusteringMethod) => setClusteringMethod(value)}
            >
                <SelectTrigger className="w-[280px] mt-2">
                    <SelectValue placeholder="Vyberte metodu clusteringu" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="kmeans">K-means</SelectItem>
                    <SelectItem value="dbscan">DBSCAN</SelectItem>
                </SelectContent>
            </Select>
        </div>
        {clusteringMethod === 'kmeans' && <KMeans />}
        {clusteringMethod === 'dbscan' && <DBScan />}
    </div>
  );
};