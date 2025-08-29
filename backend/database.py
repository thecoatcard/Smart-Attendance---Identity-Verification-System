from app import app, db

# This script can be run independently to initialize the database
# if not using app.before_first_request or for migrations.
with app.app_context():
    db.create_all()
    print("Database tables created.")
