import {type FC} from 'react';
import { Scatter } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
} from 'chart.js';
import {generateColors} from "@/utils/functions.ts";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

type PcaPoint = {
    cluster: number;
    PC1: number;
    PC2: number;
};

type Props = {
    pcaData: PcaPoint[];
    nClusters: number;
}

export const ClusterScatterPlot: FC<Props> = ({ pcaData, nClusters }) => {
    const clusterIds = Array.from({ length: nClusters }, (_, i) => i);
    const colors = generateColors(nClusters);

    const dataSets = clusterIds.map((id, index) => {
        const clusterPoints = pcaData
            .filter(point => point.cluster === id)
            .map(point => ({
                x: point.PC1,
                y: point.PC2,
            }));

        return {
            label: `Shluk ${id}`,
            data: clusterPoints,
            backgroundColor: colors[index % colors.length],
            pointRadius: 5,
        };
    });

    const data = {
        datasets: dataSets,
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Hlavní Komponenta 1 (PC1)',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Hlavní Komponenta 2 (PC2)',
                },
            },
        },
        plugins: {
            legend: {
                position: 'top' as const,
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        return `Shluk ${context.dataset.label}: (${context.parsed.x.toFixed(2)}, ${context.parsed.y.toFixed(2)})`;
                    }
                }
            }
        },
    };

    return (
        <div className="mt-8 p-4 border rounded-lg shadow-md">
            <h4 className="text-xl font-semibold mb-3">
                Vizualizace Shluků pomocí PCA
            </h4>
            <div style={{ height: '400px' }}>
                <Scatter data={data} options={options} />
            </div>
        </div>
    );
};