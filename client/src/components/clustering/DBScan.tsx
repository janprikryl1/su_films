import {type FC, useState, useEffect} from "react";
import {Input} from "@/components/ui/input.tsx";
import {Loader2} from "lucide-react";
import {cn} from "@/lib/utils.ts";
import type {DBScanResult} from "@/utils/types/DBScanResult.ts";
import {API_BASE_URL} from "@/utils/constants";
import axios from "axios";
import {ClusterScatterPlot} from "@/components/clustering/ClusterScatterPlot.tsx";
import {PlotlyBoxPlots} from "@/components/clustering/PlotlyBoxPlots.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {DbScanDetails} from "@/components/clustering/DbScanDetails.tsx";

const ALL_NUMERIC_FEATURES = [
    'vote_average',
    'vote_count',
    'popularity',
    'budget',
    'revenue',
    'runtime'
];

export const DBScan: FC = () => {
    const [eps, setEps] = useState<number>(0.5);
    const [minPts, setMinPts] = useState<number>(5);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>(ALL_NUMERIC_FEATURES);
    const [results, setResults] = useState<DBScanResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCluster, setSelectedCluster] = useState<number | null>(null);

const fetchDBScanResults = async (eps: number, minPts: number, features: string[]) => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
        const featureQuery = features.join(',');
        const response = await axios.get<DBScanResult>(
            `${API_BASE_URL}clustering/dbscan/?eps=${eps}&minPts=${minPts}&features=${featureQuery}`
        );
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
        if (selectedFeatures.length === 0 || eps <= 0 || minPts < 2) return;
        fetchDBScanResults(eps, minPts, selectedFeatures);
    }, [eps, minPts, selectedFeatures]);

    return (
        <div className="w-full max-w-4xl p-6 bg-white shadow-xl rounded-lg">
            <h3 className="text-2xl font-semibold mb-4 text-left">Konfigurace DBSCAN</h3>

            <div className="flex space-x-8 mb-6">
                <div className="flex items-center space-x-4">
                    <label className="font-medium min-w-[120px]">Epsilon (ε):</label>
                    <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={eps}
                        onChange={(e) => {
                            const newEps = parseFloat(e.target.value);
                            if (newEps > 0) setEps(newEps);
                        }}
                        className="w-[100px]"
                    />
                </div>
                <div className="flex items-center space-x-4">
                    <label className="font-medium min-w-[120px]">MinPts:</label>
                    <Input
                        type="number"
                        min="2"
                        value={minPts}
                        onChange={(e) => {
                            const newMinPts = parseInt(e.target.value);
                            if (newMinPts >= 2) setMinPts(newMinPts);
                        }}
                        className="w-[100px]"
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6 p-4 border rounded-md">
                <p className="w-full font-medium mb-2">Vybrané atributy (přidat pouze numerické):</p>
                {ALL_NUMERIC_FEATURES.map(feature => (
                    <div key={feature} className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id={`dbscan-${feature}`}
                            checked={selectedFeatures.includes(feature)}
                            onChange={() => toggleFeature(feature)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <label htmlFor={`dbscan-${feature}`} className="text-sm font-medium">
                            {feature}
                        </label>
                    </div>
                ))}
            </div>

            {loading && (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="mr-2 h-8 w-8 animate-spin text-purple-500"/>
                    <span className="text-lg text-gray-600">Probíhá výpočet DBSCAN...</span>
                </div>
            )}

            {error && <p className="text-red-600 text-center font-bold">{error}</p>}

            {results && (
                <>
                    <h3 className="text-2xl font-semibold mb-4 mt-8 text-left">
                        Výsledky DBSCAN
                    </h3>
                    <div className="flex justify-between p-4 bg-purple-50 rounded-md border border-purple-200 mb-6">
                        <p className="font-medium">
                            Nalezeno Shluků: <span
                            className="text-lg font-bold text-purple-700">{results.n_clusters}</span>
                        </p>
                        <p className="font-medium">
                            Počet Odlehlých Bodů (Šum): <span
                            className="text-lg font-bold text-red-700">{results.noise_points}</span>
                        </p>
                    </div>
                    {results.pca_data && results.pca_data.length > 0 && (
                        <ClusterScatterPlot
                            pcaData={results.pca_data}
                            nClusters={results.n_clusters}
                        />
                    )}
                    <p className="text-sm text-gray-600 mb-4">
                        Do {results.n_clusters} shluků bylo celkem zařazeno:
                        <span
                            className="font-bold text-purple-700">{results.movies_with_cluster.length - results.noise_points}</span> filmů.
                    </p>
                    <PlotlyBoxPlots
                        movies={results.movies_with_cluster.filter(movie => movie.cluster !== -1)}
                        features={selectedFeatures}
                        nClusters={results.n_clusters}
                    />
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
                                    key={c.cluster_id}
                                    onClick={() => setSelectedCluster(c.cluster_id)}
                                    className={cn(
                                        "cursor-pointer hover:bg-gray-50",
                                        c.cluster_id === selectedCluster ? 'bg-blue-50' : ''
                                    )}
                                >
                                    <TableCell className="font-bold">{c.cluster_id}</TableCell>
                                    <TableCell>{c.movie_count}</TableCell>
                                    <TableCell>{c.dominant_genre}</TableCell>
                                    <TableCell>{c.vote_average_mean ? c.vote_average_mean.toFixed(2) : 'N/A'}</TableCell>
                                    <TableCell>{c.budget_mean ? `${(c.budget_mean / 1_000_000).toFixed(1)} mil. $` : 'N/A'}</TableCell>
                                    <TableCell>{c.revenue_mean ? `${(c.revenue_mean / 1_000_000).toFixed(1)} mil. $` : 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <DbScanDetails results={results} selectedCluster={selectedCluster}/>
                    <p className="text-lg font-semibold mt-4">Interpretace:</p>
                    <p>
                        Většina filmů je ve shluku 0, ostatní shluky jsou malé a k tomu ještě 1055 filmů bylo označeno jako šum.
                        Filmová data tvoří jedno velké uprostřed datového prostoru, velká hodnota epsilon spojí toto jádro do jednoho obrovského shluku (právě shluk 0).
                        Tento shluk nepředstavuje zajímavou skupinu, ale spíše průměrný a nejběžnější film.
                        Tato situace obvykle nastává, když epsilon je příliš velká hodnota.
                    </p>
                </>
            )}
        </div>
    );
};