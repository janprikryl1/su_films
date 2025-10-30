import json
from django.http import HttpResponse
from django.shortcuts import render
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
import pandas as pd
import os
from rest_framework import status
from .serializers import MovieSerializer
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent 
CSV_FILENAME = 'tmdb_movie_data.csv'
DATA_FILE_PATH = os.path.join(PROJECT_ROOT, CSV_FILENAME)

# Create your views here.
def index(request):
    return HttpResponse("API of filmy_projekt")

class SaveFeedback(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request, format=None):
        #new_feedback = Feedback(title=request.data.get('title'), email=request.data.get('email'), author=request.data.get('author'), text=request.data.get('text'))
        #new_feedback.save()
        return Response(status=status.HTTP_200_OK)


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
                {"detail": "CSV soubor s daty nebyl nalezen."},
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
                {"detail": "Chybný formát filtrů. Očekáván JSON seznam objektů."},
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
                print(f"Chyba při aplikaci filtru: {e}")
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