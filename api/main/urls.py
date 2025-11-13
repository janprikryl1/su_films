from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path('movies/', views.MovieListView.as_view(), name='movie-list'),
    path('eda_file/', views.EDAFileView.as_view(), name='eda_file'),
]