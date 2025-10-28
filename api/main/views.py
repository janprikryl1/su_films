from django.http import HttpResponse
from django.shortcuts import render
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings

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