import {ArrowRight, BarChart3, Database, ExternalLink, Film, Filter, TrendingUp} from "lucide-react";
import type { FC } from "react";
import {Button} from "@/components/ui/button.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {useNavigate} from "react-router-dom";
import axios, {AxiosError} from "axios";

export const Index: FC = () => {
  const navigate = useNavigate();

  const handleDownloadEDA = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/eda_file', {
        responseType: 'blob',
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'eda.ipynb';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading EDA file:', error);
      if (error instanceof AxiosError && error.response && error.response.status === 404) {
          alert('Chyba 404: Soubor EDA nebyl na serveru nalezen.');
      } else {
          alert('Chyba při stahování souboru EDA. Zkuste to prosím znovu.');
      }
    }
  }

  return (
      <div>
        <div className="relative overflow-hidden">
          <div className="relative container mx-auto px-4 py-12 md:py-16">
            <div className="text-center max-w-4xl mx-auto">

              <h1 className="mb-6">Segmentace Filmů</h1>

              <p className="text-xl mb-8 max-w-2xl mx-auto">
                Pokročilá analýza a clustering filmových dat z TMDb API. Objevte skryté vzory a segmenty ve filmovém
                průmyslu pomocí strojového učení.
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                    onClick={() => navigate('/clustering')}
                >
                  <Filter className="size-5"/>
                  Clustering Aplikace
                  <ArrowRight className="size-4"/>
                </Button>

                <Button
                    size="lg"
                    variant="outline"
                    className="border-slate-700 gap-2"
                    onClick={handleDownloadEDA}
                >
                  <BarChart3 className="size-5"/>
                  EDA Notebook
                  <ExternalLink className="size-4"/>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">

            <Card className="bg-slate-800 border-slate-800 backdrop-blur mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="size-5 text-blue-400"/>
                  <a href="https://developer.themoviedb.org/reference/discover-movie">TMDb API - The Movie Database</a>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Veřejná databáze s podrobnými informacemi o filmech a seriálech
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-white mb-3">Kvantitativní atributy</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-slate-700 text-slate-300">Průměrné hodnocení</Badge>
                      <Badge variant="secondary" className="bg-slate-700 text-slate-300">Počet hlasů</Badge>
                      <Badge variant="secondary" className="bg-slate-700 text-slate-300">Rozpočet</Badge>
                      <Badge variant="secondary" className="bg-slate-700 text-slate-300">Zisk</Badge>
                      <Badge variant="secondary" className="bg-slate-700 text-slate-300">Délka</Badge>
                      <Badge variant="secondary" className="bg-slate-700 text-slate-300">Rok vydání</Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white mb-3">Kategorické atributy</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-slate-700 text-slate-300">Žánry</Badge>
                      <Badge variant="secondary" className="bg-slate-700 text-slate-300">Úspěšnost na Oscarech</Badge>
                      <Badge variant="secondary" className="bg-slate-700 text-slate-300">Popularita</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                <CardHeader>
                  <div className="size-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                    <BarChart3 className="size-6 text-purple-400"/>
                  </div>
                  <CardTitle>EDA - Exploratorní Analýza</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>Analýza vývoje rozpočtu a délky filmů v čase</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Distribuce žánrů a jejich popularity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Korelace mezi atributy</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                <CardHeader>
                  <div className="size-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                    <TrendingUp className="size-6 text-blue-400"/>
                  </div>
                  <CardTitle>Clustering</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3">Segmentace filmů do kategorií mimo tradiční žánry:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Oceňovaná dramata s malým rozpočtem</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Blockbustery s vysokým rizikem</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Nízkorozpočtové kultovní filmy</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
                <CardHeader>
                  <div className="size-12 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4">
                    <Film className="size-6 text-emerald-400"/>
                  </div>
                  <CardTitle>Frontend Aplikace</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Interaktivní filtrační panel</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Určení segmentu dle parametrů</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Doporučení podobných filmů</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
  );
};
