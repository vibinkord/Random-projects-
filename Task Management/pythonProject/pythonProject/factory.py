from flask import Flask
from flask_cors import CORS
from config import Config, db
from users.views import data


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.register_blueprint(data)
    CORS(app,origin=True)
    db.init_app(app)
    return app