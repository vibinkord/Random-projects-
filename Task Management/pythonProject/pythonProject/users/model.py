from config import db
from sqlalchemy import Boolean
from marshmallow import fields, Schema

class Details(db.Model):
    __tablename__="Details"

    id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    type = db.Column(db.String(100))
    query = db.Column(db.String(200))
    resolved = db.Column(Boolean,default=False)

    def make_json(self):
        return {
            'id': self.id,
            'type': self.type,
            'query': self.query,
            'resolved': self.resolved
        }

class DetailSchema(Schema):
    id=fields.Integer()
    type=fields.String()
    query=fields.String()
    resolved=fields.Boolean()
