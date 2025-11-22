import React, {type FC, useState} from 'react';
import axios from "axios";
import {API_BASE_URL} from "@/utils/constants";
import {Input} from "@/components/ui/input.tsx";
import {Card} from "@/components/ui/card.tsx";
import {Label} from "@/components/ui/label.tsx";

type RecommendedMovie = {
    title: string;
    vote_average: number;
    popularity: number;
}

export const PredictionKMEANSPanel: FC = () => {
    const [budget, setBudget] = useState('50000000');
    const [rating, setRating] = useState('7.0');
    const [genre, setGenre] = useState('Drama');
    const [result, setResult] = useState<{predicted_cluster: number, recommendations: RecommendedMovie[]} | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}clustering/predict/`, {
                budget: budget,
                vote_average: rating,
                genre: genre,
            });
            setResult(response.data);
        } catch (error) {
            console.error("Prediction error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <div className="p-6">
                <h3 className="text-2xl font-bold mb-4">Doporučení Segmentu</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid w-full items-center gap-3">
                        <Label htmlFor="budget">Rozpočet</Label>
                        <Input type="number" id="budget" placeholder="Rozpočet (např. 50000000)" value={budget}
                               onChange={e => setBudget(e.target.value)}/>
                    </div>
                    <div className="grid w-full items-center gap-3">
                        <Label htmlFor="rating">Hodnocení</Label>
                        <Input type="number" id="rating" step="0.1" placeholder="Hodnocení (např. 7.0)"
                               value={rating}
                               onChange={e => setRating(e.target.value)}/>
                    </div>
                    <div className="grid w-full items-center gap-3">
                        <Label htmlFor="prefered-genre">Preferovaný žánr </Label>
                        <Input type="text" id="prefered-genre" placeholder="Preferovaný žánr (např. Science Fiction)"
                               value={genre}
                               onChange={e => setGenre(e.target.value)}/>
                    </div>
                    <div className="grid w-full items-center gap-3">
                        <button type="submit" disabled={loading}
                                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                            {loading ? 'Načítání...' : 'Zobrazit segment a doporučení'}
                        </button>
                    </div>
                </form>

                {result && (
                    <div className="mt-6 p-4 bg-white rounded shadow">
                        <p className="text-lg font-semibold">
                            Takovový film spadá do segmentu: <span className="text-red-600 font-bold">Shluk {result.predicted_cluster}</span>
                        </p>
                        <h4 className="mt-4 font-bold">Doporučené filmy ze stejného segmentu:</h4>
                        <ul className="list-disc list-inside ml-4">
                            {result.recommendations.map((movie: RecommendedMovie, index: number) => (
                                <li key={index}>
                                    {movie.title} (Hodnocení: {movie.vote_average}, Oblíbenost: {movie.popularity})
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </Card>
    );
};