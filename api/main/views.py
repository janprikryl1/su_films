import json
import mimetypes
from django.http import HttpResponse, Http404, FileResponse
from django.shortcuts import render
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
import pandas as pd
import os
from rest_framework import status
from sklearn.decomposition import PCA
from .serializers import MovieSerializer
from pathlib import Path
import numpy as np
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import MinMaxScaler
import pickle

BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent
CSV_FILENAME = 'tmdb_movie_data.csv'
DATA_FILE_PATH = os.path.join(PROJECT_ROOT, CSV_FILENAME)
EDA_FILE_PATH = os.path.join(PROJECT_ROOT, 'eda.ipynb')
MODEL_KMEANS_FILENAME = 'kmeans_pipeline.pkl'
MODEL_KMEANS_PATH = os.path.join(PROJECT_ROOT, MODEL_KMEANS_FILENAME)


def get_dataframe():
    try:
        df = pd.read_csv(DATA_FILE_PATH)
    except FileNotFoundError:
        return None

    # Replace 0 in budget/revenue/runtime for NaN
    df[['budget', 'revenue', 'runtime']] = df[['budget', 'revenue', 'runtime']].replace(0, np.nan)
    return df

def index(request):
    return HttpResponse("API of filmy_projekt")


class MovieListView(APIView):
    try:
        df_global = pd.read_csv(DATA_FILE_PATH)
    except FileNotFoundError:
        df_global = None

    COLUMN_TYPES = {
        'id': 'numeric',
        'title': 'string',
        'release_date': 'string',
        'vote_average': 'numeric',
        'vote_count': 'numeric',
        'popularity': 'numeric',
        'budget': 'numeric',
        'revenue': 'numeric',
        'runtime': 'numeric',
        'genres': 'string',
        'spoken_languages': 'string',
    }

    def get(self, request):
        if self.df_global is None:
            return Response(
                {"detail": "CSV not found."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        df = self.df_global.copy()
        filters_json = request.query_params.get('filters', '[]')

        try:
            filters = json.loads(filters_json)
            if not isinstance(filters, list):
                raise ValueError()
        except (json.JSONDecodeError, ValueError):
            return Response(
                {"detail": "Invalid filter format. Expected JSON."},
                status=status.HTTP_400_BAD_REQUEST
            )

        for f in filters:
            column = f.get('column')
            operator = f.get('operator')
            value = f.get('value')

            if not all([column, operator, value is not None]) or column not in self.COLUMN_TYPES:
                continue

            col_type = self.COLUMN_TYPES.get(column)

            try:
                if col_type == 'string':
                    col_data = df[column].astype(str)
                    if operator == 'contains':
                        df = df[col_data.str.contains(str(value), case=False, na=False)]
                    elif operator == 'eq':
                        df = df[col_data == str(value)]

                elif col_type == 'numeric':
                    numeric_col = pd.to_numeric(df[column], errors='coerce')
                    num_value = float(value)

                    if operator == 'gte':
                        df = df[numeric_col >= num_value]
                    elif operator == 'lte':
                        df = df[numeric_col <= num_value]
                    elif operator == 'eq':
                        df = df[numeric_col == num_value]
                    elif operator == 'gt':
                        df = df[numeric_col > num_value]
                    elif operator == 'lt':
                        df = df[numeric_col < num_value]

            except (ValueError, TypeError, Exception) as e:
                print(f"Error while loading filter: {e}")
                pass

        total_movies = len(df)
        movies = df.to_dict('records')

        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 20))
        start_index = (page - 1) * limit
        end_index = page * limit

        paginated_movies = movies[start_index:end_index]

        serializer = MovieSerializer(paginated_movies, many=True)
        response_data = {
            "total_count": total_movies,
            "page": page,
            "limit": limit,
            "next": end_index < total_movies,
            "results": serializer.data
        }

        return Response(response_data, status=status.HTTP_200_OK)


class EDAFileView(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def get(self, request):
        if not os.path.exists(EDA_FILE_PATH):
            print(f"File not found at: {EDA_FILE_PATH}")
            raise Http404("File doesn't exist.")

        try:
            mime_type, encoding = mimetypes.guess_type(EDA_FILE_PATH)
            if mime_type is None:
                mime_type = 'application/json'
            file_handle = open(EDA_FILE_PATH, 'rb')
            response = FileResponse(file_handle, content_type=mime_type)
            file_name = os.path.basename(EDA_FILE_PATH)
            response['Content-Disposition'] = f'attachment; filename="{file_name}"'
            return response

        except Exception as e:
            print(f"Error during file processing: {e}")
            raise Http404("Error while downloading file")


class KMeansClusteringView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        df = get_dataframe()
        if df is None:
            return Response(
                {"detail": "CSV file was not found"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Parameter K
        try:
            n_clusters = int(request.query_params.get('k', 5))
            if n_clusters < 2:
                raise ValueError("k must be at least 2")
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        features_query = request.query_params.get('features')
        if features_query:
            numeric_features = [f.strip() for f in features_query.split(',') if f.strip()]
        else:  # Default features
            numeric_features = ['vote_average', 'vote_count', 'popularity', 'budget', 'revenue', 'runtime']

        # Data preparation
        X = df[numeric_features].copy()

        try:
            # Preprocessing
            imputer = SimpleImputer(strategy='median')
            X_imputed = imputer.fit_transform(X)

            if request.query_params.get('tf') == "standardScaler":
                scaler = StandardScaler()  # MinMaxScaler or StandardScaler
            elif request.query_params.get('tf') == "minMaxScaler":
                scaler = MinMaxScaler()
            X_scaled = scaler.fit_transform(X_imputed)

            # K-Means
            kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
            clusters = kmeans.fit_predict(X_scaled)

            df['cluster'] = clusters

            # Reduction dimension pro visualisation
            pca = PCA(n_components=2)
            principal_components = pca.fit_transform(X_scaled)

        except Exception as e:
            return Response({"detail": f"Error while K-Means or PCA: {e}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Summary
        cluster_summary = df.groupby('cluster')[numeric_features].agg(['count', 'mean']).reset_index()
        cluster_summary.columns = ['_'.join(col).strip() if col[1] else col[0] for col in
                                   cluster_summary.columns.values]

        cluster_summary.rename(columns={'vote_average_count': 'movie_count'}, inplace=True)
        cluster_summary['cluster'] = cluster_summary['cluster'].astype(int)

        # Dominant genre
        cluster_genres = []
        for cluster_id in range(n_clusters):
            cluster_data = df[df['cluster'] == cluster_id]
            all_genres = ', '.join(cluster_data['genres'].astype(str).str.replace(r'[\[\]\"]', '', regex=True)).split(
                ', ')
            all_genres = [g.strip() for g in all_genres if g.strip()]
            dominant_genre = pd.Series(all_genres).mode()[0] if all_genres else "N/A"
            cluster_genres.append({'cluster': cluster_id, 'dominant_genre': dominant_genre})

        summary_df = cluster_summary.merge(pd.DataFrame(cluster_genres), on='cluster')

        # Film details
        movies_to_serialize = df[['id', 'title', 'cluster'] + numeric_features].copy()

        # Data for PCA visualisation
        pca_df = pd.DataFrame(data=principal_components, columns=['PC1', 'PC2'])
        pca_df['cluster'] = clusters

        # 6. Serialization (JSON-incompatible values)
        summary_df.replace([np.inf, -np.inf], np.nan, inplace=True)
        movies_to_serialize.replace([np.inf, -np.inf], np.nan, inplace=True)
        pca_df.replace([np.inf, -np.inf], np.nan, inplace=True)

        json_str_summary = summary_df.to_json(orient='records', double_precision=15)
        json_str_movies = movies_to_serialize.to_json(orient='records', double_precision=15)
        json_str_pca = pca_df.to_json(orient='records', double_precision=15)

        response_data = {
            "n_clusters": n_clusters,
            "cluster_summary": json.loads(json_str_summary),
            "movies_with_cluster": json.loads(json_str_movies),
            "pca_data": json.loads(json_str_pca)
        }

        return Response(response_data, status=status.HTTP_200_OK)


class ClusterPredictionView(APIView):
    def get_pipeline(self):
        try:
            with open(MODEL_KMEANS_PATH, 'rb') as file:
                return pickle.load(file)
        except FileNotFoundError:
            raise Exception("Model pipeline not found.")

    def post(self, request):
        pipeline = self.get_pipeline()

        data = request.data
        try:
            new_data = {
                'vote_average': float(data.get('vote_average')),
                'vote_count': float(data.get('vote_count', 100)),
                'popularity': float(data.get('popularity', 50)),
                'budget': float(data.get('budget')),
                'revenue': float(data.get('revenue', 0)),
                'runtime': float(data.get('runtime', 90)),
            }
            target_genre = data.get('genre', 'Action')

        except (TypeError, ValueError):
            return Response({"detail": "Invalid format of numeric inputs."}, status=status.HTTP_400_BAD_REQUEST)

        data = pd.DataFrame([new_data], index=[0])
        predicted_cluster = pipeline.predict(data)[0]

        try:
            df = pd.read_csv(DATA_FILE_PATH)
            features = ['vote_average', 'vote_count', 'popularity', 'budget', 'revenue', 'runtime']
            df['cluster'] = pipeline.predict(df[features].fillna(0))

            recommended_movies = df[
                (df['cluster'] == predicted_cluster) &
                (df['genres'].astype(str).str.contains(target_genre))
                ].sample(n=3)

            recommendations = recommended_movies[['title', 'vote_average', 'popularity']].to_dict('records')
        except:
            recommendations = []

        return Response({"predicted_cluster": int(predicted_cluster), "recommendations": recommendations},
                        status=status.HTTP_200_OK)


class DBScanClusteringView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        df = get_dataframe()
        if df is None:
            return Response({"detail": "CSV file not found"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            eps = float(request.query_params.get('eps', 0.5))
            min_samples = int(request.query_params.get('minPts', 5))
            if eps <= 0 or min_samples < 2:
                raise ValueError("eps must be > 0 a minPts >= 2")
        except ValueError as e:
            return Response(
                {"detail": f"Invalid parser format: {e}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        features_query = request.query_params.get('features')
        if features_query:
            numeric_features = [f.strip() for f in features_query.split(',') if f.strip()]
        else:
            numeric_features = ['vote_average', 'vote_count', 'popularity', 'budget', 'revenue', 'runtime']

        X = df[numeric_features].copy()

        try:
            # 2. Předzpracování
            # DBSCAN je velmi citlivý na škálu, proto použijeme Standard Scaler
            imputer = SimpleImputer(strategy='median')
            X_imputed = imputer.fit_transform(X)

            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X_imputed)

            # 3. DBSCAN
            dbscan = DBSCAN(eps=eps, min_samples=min_samples)
            clusters = dbscan.fit_predict(X_scaled)  # Clusters -1 značí šum

            df['cluster'] = clusters

            # 4. Redukce dimenze pro vizualizaci (PCA)
            # Aplikujeme PCA na škálovaná data
            pca = PCA(n_components=2)
            principal_components = pca.fit_transform(X_scaled)

        except Exception as e:
            return Response({"detail": f"Chyba při DBSCAN nebo PCA: {e}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 5. Souhrn výsledků

        # Ignorujeme hluk (cluster -1) pro výpočet průměrů shluků
        clustered_df = df[df['cluster'] != -1].copy()
        noise_points = len(df[df['cluster'] == -1])

        # Identifikace unikátních shluků (kromě šumu -1)
        unique_clusters = clustered_df['cluster'].unique()
        n_clusters = len(unique_clusters)

        cluster_summary = clustered_df.groupby('cluster')[numeric_features].agg(['count', 'mean']).reset_index()
        cluster_summary.columns = ['_'.join(col).strip() if col[1] else col[0] for col in
                                   cluster_summary.columns.values]

        cluster_summary.rename(columns={f'{numeric_features[0]}_count': 'movie_count', 'cluster': 'cluster_id'},
                               inplace=True)
        cluster_summary['cluster_id'] = cluster_summary['cluster_id'].astype(int)

        # Dominantní žánr
        cluster_genres = []
        for cluster_id in unique_clusters:
            cluster_data = df[df['cluster'] == cluster_id]
            # Stejná logika pro extrakci žánrů
            all_genres = ', '.join(cluster_data['genres'].astype(str).str.replace(r'[\[\]\"]', '', regex=True)).split(
                ', ')
            all_genres = [g.strip() for g in all_genres if g.strip()]
            dominant_genre = pd.Series(all_genres).mode()[0] if all_genres else "N/A"
            cluster_genres.append({'cluster_id': int(cluster_id), 'dominant_genre': dominant_genre})

        summary_df = cluster_summary.merge(pd.DataFrame(cluster_genres), on='cluster_id', how='left')

        # Film detaily a PCA data
        movies_to_serialize = df[['id', 'title', 'cluster'] + numeric_features].copy()
        pca_df = pd.DataFrame(data=principal_components, columns=['PC1', 'PC2'])
        pca_df['cluster'] = clusters

        # 6. Serializace (ošetření NaN/Inf)
        summary_df.replace([np.inf, -np.inf], np.nan, inplace=True)
        movies_to_serialize.replace([np.inf, -np.inf], np.nan, inplace=True)
        pca_df.replace([np.inf, -np.inf], np.nan, inplace=True)

        json_str_summary = summary_df.to_json(orient='records', double_precision=15)
        json_str_movies = movies_to_serialize.to_json(orient='records', double_precision=15)
        json_str_pca = pca_df.to_json(orient='records', double_precision=15)

        response_data = {
            "n_clusters": n_clusters,
            "noise_points": noise_points,
            "eps": eps,
            "min_samples": min_samples,
            "cluster_summary": json.loads(json_str_summary),
            "movies_with_cluster": json.loads(json_str_movies),
            "pca_data": json.loads(json_str_pca)
        }

        return Response(response_data, status=status.HTTP_200_OK)