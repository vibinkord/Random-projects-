from flask import Flask,Blueprint,jsonify,json,request
data = Blueprint("data",__name__,url_prefix="/data")
from users.service import getall,resolved,add_data

@data.route("/adddata",methods=["POST"])
def adddata():
    payload = request.get_json()
    type = payload.get("type")
    query = payload.get("query")
    result = add_data(type,query)
    return jsonify({
        "message":result
    })

@data.route("/getdata",methods=["POST"])
def getdata():
    payload = request.get_json()
    type=payload.get("type")
    res = getall(type)
    return res

@data.route("/resolved",methods=["POST"])
def resolve():
    payload = request.get_json()
    id=payload.get("id")
    result = resolved(id)
    return jsonify({
        "message":result,
    })

