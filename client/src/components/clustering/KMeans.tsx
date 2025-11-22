import {type FC, useState, useEffect} from "react";
import {Input} from "@/components/ui/input.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import {Loader2} from "lucide-react";
import {API_BASE_URL} from "@/utils/constants";
import axios from "axios";
import {cn} from "@/lib/utils.ts";
import {KMeansDetails} from "@/components/clustering/KMeansDetails.tsx";
import type {KMeansResult} from "@/utils/types/KMeansResult.ts";
import {ClusterScatterPlot} from "@/components/clustering/ClusterScatterPlot.tsx";
import {PlotlyBoxPlots} from "@/components/clustering/PlotlyBoxPlots.tsx";
import {KMeansDescription} from "@/components/clustering/KMeansDescription.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import { Link } from "react-router-dom";

const ALL_NUMERIC_FEATURES = [
    'vote_average',
    'vote_count',
    'popularity',
    'budget',
    'revenue',
    'runtime'
];

export const KMeans: FC = () => {
    const [kValue, setKValue] = useState<number>(5);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>(ALL_NUMERIC_FEATURES);
    const [results, setResults] = useState<KMeansResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCluster, setSelectedCluster] = useState<number | null>(null);
    const [transformativeFunction, setTransformativeFunction] = useState<'standardScaler' | 'minMaxScaler'>('standardScaler');

    const fetchKMeansResults = async (k: number, features: string[], transformativeFunction: 'standardScaler' | 'minMaxScaler') => {
        setLoading(true);
        setError(null);
        setResults(null);
        setSelectedCluster(null);
        try {
            const featureQuery = features.join(',');
            const response = await axios.get<KMeansResult>(`${API_BASE_URL}clustering/kmeans/?k=${k}&features=${featureQuery}&tf=${transformativeFunction}`);
            setResults(response.data);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data.detail || `Chyba při načítání dat: ${err.response?.status}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleFeature = (feature: string) => {
        setSelectedFeatures(prev =>
            prev.includes(feature)
                ? prev.filter(f => f !== feature)
                : [...prev, feature]
        );
    };

    useEffect(() => {
        fetchKMeansResults(kValue, selectedFeatures, transformativeFunction);
    }, [kValue, selectedFeatures, transformativeFunction]);

    return (
        <div className="w-full max-w-4xl p-6 bg-white shadow-xl rounded-lg">
            <h3 className="text-2xl font-semibold mb-4 text-left">Konfigurace K-Means</h3>
            <div className="flex items-center space-x-4 mb-6">
                <label className="font-medium min-w-[120px]">Počet shluků (K):</label>
                <Input
                    type="number"
                    min="2"
                    value={kValue}
                    onChange={(e) => {
                        const newK = parseInt(e.target.value);
                        if (newK >= 2) setKValue(newK);
                    }}
                    className="w-[100px]"
                />
            </div>
            <div className="flex items-center space-x-4 mb-6">
                <label className="font-medium min-w-[120px]">Metoda použitá u preprocesingu:</label>
                <Select
                    value={transformativeFunction}
                    onValueChange={(value: string) => setTransformativeFunction(value as 'standardScaler' | 'minMaxScaler')}
                >
                    <SelectTrigger className="w-[280px] mt-2">
                        <SelectValue placeholder="Vyberte metodu" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="standardScaler">StandardScaler</SelectItem>
                        <SelectItem value="minMaxScaler">MinMaxScaler</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-wrap gap-4 mb-6 p-4 border rounded-md">
                <p className="w-full font-medium mb-2">Vybrané atributy (numerické):</p>
                {ALL_NUMERIC_FEATURES.map(feature => (
                    <div key={feature} className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id={feature}
                            checked={selectedFeatures.includes(feature)}
                            onChange={() => toggleFeature(feature)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor={feature} className="text-sm font-medium">
                            {feature}
                        </label>
                    </div>
                ))}
            </div>

            {loading && (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="mr-2 h-8 w-8 animate-spin text-blue-500"/>
                    <span className="text-lg text-gray-600">Probíhá výpočet K-Means...</span>
                </div>
            )}

            {error && <p className="text-red-600 text-center font-bold">{error}</p>}

            {results && results.cluster_summary.length > 0 && (
                <>
                    {results.pca_data && results.pca_data.length > 0 && (
                        <ClusterScatterPlot
                            pcaData={results.pca_data}
                            nClusters={results.n_clusters}
                        />
                    )}
                    <PlotlyBoxPlots
                        movies={results.movies_with_cluster}
                        features={selectedFeatures}
                        nClusters={results.n_clusters}
                    />
                    {results.n_clusters === 5 && transformativeFunction === "standardScaler" && <KMeansDescription/>}
                    <h3 className="text-2xl font-semibold mb-4 mt-8 text-left">
                        Popis nalezených shluků (K={results.n_clusters})
                    </h3>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-100">
                                <TableHead>ID Shluku</TableHead>
                                <TableHead>Počet filmů</TableHead>
                                <TableHead>Dominantní žánr</TableHead>
                                <TableHead>Průměrné podnocení</TableHead>
                                <TableHead>Průměrný rozpočet</TableHead>
                                <TableHead>Průměrné tržby</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {results.cluster_summary.map((c) => (
                                <TableRow
                                    key={c.cluster}
                                    onClick={() => setSelectedCluster(c.cluster)}
                                    className={cn(
                                        "cursor-pointer hover:bg-gray-50",
                                        c.cluster === selectedCluster ? 'bg-blue-50' : ''
                                    )}
                                >
                                    <TableCell className="font-bold">{c.cluster}</TableCell>
                                    <TableCell>{c.movie_count}</TableCell>
                                    <TableCell>{c.dominant_genre}</TableCell>
                                    <TableCell>{c.vote_average_mean ? c.vote_average_mean.toFixed(2) : 'N/A'}</TableCell>
                                    <TableCell>{c.budget_mean ? `${(c.budget_mean / 1_000_000).toFixed(1)} mil. $` : 'N/A'}</TableCell>
                                    <TableCell>{c.revenue_mean ? `${(c.revenue_mean / 1_000_000).toFixed(1)} mil. $` : 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </>
            )}
            <KMeansDetails results={results} selectedCluster={selectedCluster}/>
            <Link to="/prediction-kmeans" className="mt-6 text-blue-600 underline">
                Doporučení
            </Link>
        </div>
    );
};