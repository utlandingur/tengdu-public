from firebase_admin import firestore

db = firestore.client()


def get_users():
    user_docs = db.collection("users").stream()
    users = {}
    for doc in user_docs:
        users[doc.id] = doc.to_dict()
    return users
