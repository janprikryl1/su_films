from rest_framework import serializers

class MovieSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField(max_length=255)
    release_date = serializers.DateField(required=False)
    vote_average = serializers.FloatField()
    vote_count = serializers.IntegerField()
    popularity = serializers.FloatField()
    budget = serializers.IntegerField()
    revenue = serializers.IntegerField()
    runtime = serializers.FloatField(allow_null=True)
    genres = serializers.CharField(max_length=500)
    spoken_languages = serializers.CharField(max_length=500)