from config import db
from users.model import Details
from users.Schema import Schema
from flask import jsonify
def add_data(type,query):
    details=Details(
        type=type,
        query=query,
    )
    db.session.add(details)
    db.session.commit()
    return "Success"

def getall(type):
    detail = db.session.query(Details).filter_by(type=type).all()
    user = [i.make_json() for i in detail]
    print(user)
    return user

def resolved(id):
    details = db.session.query(Details).filter_by(id=id).first()
    if details.resolved ==False:
        details.resolved=True
    else:
        details.resolved=False
    db.session.commit()
    return "Success"
