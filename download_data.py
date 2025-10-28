import requests
import time
import pandas as pd
import numpy as np
import os
from dotenv import load_dotenv

load_dotenv()

BEARER_TOKEN = os.getenv('BEARER_TOKEN')
BASE_URL = "https://api.themoviedb.org/3"
START_PAGE = 101
PAGES_TO_ADD = 100
MAX_PAGES_TO_FETCH = START_PAGE + PAGES_TO_ADD - 1

DISCOVER_DELAY = 0.5
DETAILS_DELAY = 1.2
OUTPUT_FILENAME = "tmdb_movie_data.csv"

headers = {
    "accept": "application/json",
    "Authorization": f"Bearer {BEARER_TOKEN}"
}


existing_df = pd.DataFrame()
existing_movie_ids = set()

if os.path.exists(OUTPUT_FILENAME):
    existing_df = pd.read_csv(OUTPUT_FILENAME)
    existing_movie_ids = set(existing_df['id'].unique())
    print(f"📂 Načteno {len(existing_df)} filmů z '{OUTPUT_FILENAME}'.")
    print(f"   Budeme pokračovat od stránky {START_PAGE} a přidáme max. {PAGES_TO_ADD} stránek.")
else:
    print(f"🆕 Soubor '{OUTPUT_FILENAME}' nebyl nalezen. Začínám stahovat od stránky 1.")
    START_PAGE = 1
    MAX_PAGES_TO_FETCH = PAGES_TO_ADD

new_movies_base_data = []

print("\nFÁZE 1: Zahajuji stahování nových základních metadat.")

for page in range(START_PAGE, MAX_PAGES_TO_FETCH + 1):
    discover_url = f"{BASE_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page={page}&sort_by=popularity.desc"
    
    try:
        response = requests.get(discover_url, headers=headers)
        response.raise_for_status()
        data = response.json()
        results = data.get('results', [])
        
        for movie in results:
            movie_id = movie.get('id')
            # Přidáme film POUZE, pokud ho již nemáme v existujících ID
            if movie_id not in existing_movie_ids:
                new_movies_base_data.append({
                    'id': movie_id,
                    'title': movie.get('title'),
                    'release_date': movie.get('release_date'),
                    'vote_average': movie.get('vote_average'),
                    'vote_count': movie.get('vote_count'),
                    'popularity': movie.get('popularity')
                })
                existing_movie_ids.add(movie_id) # Přidáme nové ID, aby se neopakovalo
            
        print(f"✅ Stránka {page} stažena. Nových filmů v tomto běhu: {len(new_movies_base_data)}")
        
        if page >= data.get('total_pages', MAX_PAGES_TO_FETCH) or not results:
             print("🛑 Dosažena poslední stránka nebo konec výsledků Discover.")
             break
        
        time.sleep(DISCOVER_DELAY) 
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Chyba FÁZE 1 (Discover) na stránce {page}: {e}")
        break

df_new_base = pd.DataFrame(new_movies_base_data)
if df_new_base.empty:
    print("ℹ️ Žádné nové filmy ke stažení. Ukončuji program.")
    exit()

print(f"\nFÁZE 1 dokončena. Získáno {len(df_new_base)} NOVÝCH ID pro detailní stahování.")

new_details_list = []
print("\nFÁZE 2: Zahajuji stahování detailních dat pro NOVÉ filmy.")

for i, movie_id in enumerate(df_new_base['id'].unique()):
    detail_url = f"{BASE_URL}/movie/{movie_id}"
    
    try:
        detail_response = requests.get(detail_url, headers=headers)
        detail_response.raise_for_status()
        detail_data = detail_response.json()
        
        new_details_list.append({
            'id': movie_id,
            'budget': detail_data.get('budget', 0),
            'revenue': detail_data.get('revenue', 0),
            'runtime': detail_data.get('runtime', np.nan),
            'genres': ", ".join([g['name'] for g in detail_data.get('genres', [])]),
            'spoken_languages': ", ".join([l['english_name'] for l in detail_data.get('spoken_languages', [])])
        })
        
        if (i + 1) % 50 == 0:
            print(f"   -> Zpracováno {i + 1}/{len(df_new_base)} NOVÝCH filmů...")
            
        time.sleep(DETAILS_DELAY) 
        
    except requests.exceptions.RequestException as e:
        print(f"   -> ⚠️ Chyba FÁZE 2 (Details) u ID {movie_id}: {e}")
        time.sleep(DETAILS_DELAY * 2)
        continue

df_new_details = pd.DataFrame(new_details_list)
df_new_complete = pd.merge(df_new_base, df_new_details, on='id', how='left')
final_df = pd.concat([existing_df, df_new_complete], ignore_index=True)
final_df.to_csv(OUTPUT_FILENAME, index=False)

print("\n" + "="*50)
print(f"✅ HOTOVO! Nová data byla stažena a přidána do souboru: {OUTPUT_FILENAME}")
print(f"Celkový počet řádků ve finálním CSV: {len(final_df)}")
print(f"Přidáno filmů v tomto běhu: {len(df_new_complete)}")
print("="*50)