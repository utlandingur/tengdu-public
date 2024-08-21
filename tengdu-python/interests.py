from flask import Flask
import firebase_admin
from firebase_admin import firestore
import json

try:
    app = Flask(__name__)

    cred_obj = firebase_admin.credentials.Certificate("./tengdu-testing.json")
    default_app = firebase_admin.initialize_app(
        cred_obj,
        {
            "apiKey": "----",
            "authDomain": "---",
            "projectId": "tengdu-testing",
            "storageBucket": "---",
            "messagingSenderId": "---",
            "appId": "----",
            "measurementId": "---",
        },
    )
except ValueError:
    pass

db = firestore.client()


def get_interests():
    user_docs = db.collection("interests").stream()
    for doc in user_docs:
        if doc.id == 'activities':
            return doc.to_dict()

json.dump(get_interests(), open('wdcache/interests.json', 'w'), indent=4)
