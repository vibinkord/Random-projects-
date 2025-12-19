from marshmallow import fields, Schema

class DetailSchema(Schema):
    id=fields.Integer()
    type=fields.String()
    query=fields.String()
    resolved=fields.Boolean()
