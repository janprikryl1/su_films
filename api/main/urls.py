from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path('movies/', views.MovieListView.as_view(), name='movie-list'),
    path('eda_file/', views.EDAFileView.as_view(), name='eda_file'),
    path('clustering/kmeans/', views.KMeansClusteringView.as_view(), name='kmeans_clustering'),
    path('clustering/predict/', views.ClusterPredictionView.as_view(), name='cluster_predict'),
    path('clustering/dbscan/', views.DBScanClusteringView.as_view(), name='dbscan_clustering'),
]