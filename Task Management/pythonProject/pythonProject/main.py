from factory import create_app
from config import db
from users.model import Details
from users.service import add_data

app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True,host="0.0.0.0")