import pandas as pd
import numpy as np
import pickle
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.compose import ColumnTransformer

CSV_FILENAME = 'tmdb_movie_data.csv'
MODEL_FILENAME = 'kmeans_pipeline.pkl'

try:
    df = pd.read_csv(CSV_FILENAME)
except FileNotFoundError:
    print(f"Error: File '{CSV_FILENAME}' not found.")
    exit()

df[['budget', 'revenue', 'runtime']] = df[['budget', 'revenue', 'runtime']].replace(0, np.nan)

numeric_features = ['vote_average', 'vote_count', 'popularity', 'budget', 'revenue', 'runtime']
n_clusters = 5

numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, numeric_features)
    ],
    remainder='drop'
)

kmeans_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('cluster', KMeans(n_clusters=n_clusters, random_state=42, n_init=10))
])

print("Training K-Means pipeline...")
X = df[numeric_features]
kmeans_pipeline.fit(X)
print("Training finished.")

with open(MODEL_FILENAME, 'wb') as file:
    pickle.dump(kmeans_pipeline, file)