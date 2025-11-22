import React from 'react';
import Plot from 'react-plotly.js';

type MovieDetail = {
    id: number;
    title: string;
    cluster: number;
    vote_average: number | null;
    vote_count: number | null;
    popularity: number | null;
    budget: number | null;
    revenue: number | null;
    runtime: number | null;
};

type PlotlyBoxPlotsProps = {
    movies: MovieDetail[];
    features: string[];
    nClusters: number;
}

const FEATURE_LABELS: Record<string, string> = {
    'vote_average': 'Průměrné Hodnocení',
    'vote_count': 'Počet Hlasů',
    'popularity': 'Popularita',
    'budget': 'Rozpočet',
    'revenue': 'Tržby',
    'runtime': 'Délka',
};

const preparePlotlyData = (movies: MovieDetail[], feature: keyof MovieDetail, nClusters: number) => {
    const dataByCluster: Record<number, number[]> = {};

    for (let i = 0; i < nClusters; i++) {
        dataByCluster[i] = [];
    }

    movies.forEach(movie => {
        const value = movie[feature as keyof MovieDetail];
        if (movie.cluster !== undefined && movie.cluster !== null && movie.cluster >= 0 && typeof value === 'number' && !isNaN(value)) {
            if (movie.cluster < nClusters) {
                dataByCluster[movie.cluster].push(value);
            }
        }
    });

    const traces = Array.from({ length: nClusters }, (_, i) => {
        const count = dataByCluster[i].length;

        return {
            y: dataByCluster[i],
            name: `Shluk ${i} (N=${count})`,
            type: 'box' as const,
            boxpoints: 'outliers' as const,
            marker: { color: i < 5 ? ['#ff6384', '#36a2eb', '#4bbf6b', '#ffce56', '#9966ff'][i] : 'gray' },
        };
    });

    return traces;
};

export const PlotlyBoxPlots: React.FC<PlotlyBoxPlotsProps> = ({ movies, features, nClusters }) => {

    const featuresToDisplay: (keyof MovieDetail)[] = features.filter(f =>
        Object.prototype.hasOwnProperty.call(FEATURE_LABELS, f)
    ) as (keyof MovieDetail)[];

    return (
        <div className="mt-8">
            <h4 className="text-xl font-semibold mb-3">
                Analýza Distribuce - Box Ploty
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {featuresToDisplay.map(feature => {
                    const traces = preparePlotlyData(movies, feature, nClusters);
                    const title = FEATURE_LABELS[feature as string] || feature;
                    const isLogScale = (feature === 'budget' || feature === 'revenue' || feature === 'vote_count');

                    return (
                        <div key={feature} className="p-4 border rounded-lg shadow-md" style={{ height: '500px' }}>
                            <Plot
                                data={traces}
                                layout={{
                                    title: { text: title, font: { size: 16 } },
                                    showlegend: false,
                                    autosize: true,
                                    margin: { t: 50, b: 80, l: 50, r: 20 },
                                    yaxis: {
                                        title: { text: title },
                                        type: isLogScale ? 'log' : 'linear',
                                        tickformat: isLogScale ? 's' : undefined
                                    },
                                    xaxis: {
                                        title: { text: 'Shluk' },
                                    },
                                }}
                                config={{ responsive: true, displayModeBar: false }}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};