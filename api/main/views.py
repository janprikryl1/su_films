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

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
API_DIR = os.path.dirname(CURRENT_DIR)
DJANGO_PROJECT_DIR = os.path.dirname(API_DIR)
PROJECT_ROOT = os.path.dirname(DJANGO_PROJECT_DIR)
CSV_FILE_PATH = os.path.join(PROJECT_ROOT, 'tmdb_movie_data.csv') 

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
    """
    Endpoint pro načtení a stránkování filmových dat z CSV.
    URL: /api/movies/?page=<číslo>&limit=<limit_na_stránce>
    """
    def get(self, request):
        # --- 1. Načtení a příprava dat ---
        try:
            # Pamatujte: Načítání celého CSV při každém GET požadavku je neefektivní
            # Pro produkční nasazení by se mělo CSV načíst pouze jednou (např. při startu serveru)
            df = pd.read_csv(CSV_FILE_PATH)
            movies = df.to_dict('records') # Převod Pandas DF na seznam slovníků
        except FileNotFoundError:
            return Response(
                {"detail": "CSV soubor s daty nebyl nalezen. Zkontrolujte cestu."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return Response(
                {"detail": f"Chyba při načítání dat: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # --- 2. Stránkování (Pagination) ---
        
        # Získání parametrů z URL
        page = int(request.query_params.get('page', 1)) # Defaultní stránka 1
        limit = int(request.query_params.get('limit', 20)) # Defaultní limit 20 filmů

        # Výpočet rozsahů pro stránkování
        start_index = (page - 1) * limit
        end_index = page * limit
        total_movies = len(movies)

        # Aplikace stránkování
        paginated_movies = movies[start_index:end_index]
        
        # --- 3. Serializace a Odeslání odpovědi ---
        
        serializer = MovieSerializer(paginated_movies, many=True)
        
        # Vytvoření strukturované odpovědi
        response_data = {
            "total_count": total_movies,
            "page": page,
            "limit": limit,
            "next": page * limit < total_movies, # Jednoduchá kontrola pro "další stránku"
            "results": serializer.data
        }

        return Response(response_data, status=status.HTTP_200_OK)