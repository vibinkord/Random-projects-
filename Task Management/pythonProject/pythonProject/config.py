import os

from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
load_dotenv()

class Config():
    SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")
    SQLALCHEMY_TRACK_MODIFICATIONS = os.getenv("SQLALCHEMY_TRACK_MODIFICATIONS")


db=SQLAlchemy()