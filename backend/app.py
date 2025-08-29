from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from flask_cors import CORS
import os
import base64
import numpy as np
import cv2
import face_recognition
import google.generativeai as genai
from datetime import datetime, timedelta, date

# Configure Gemini API Key
GEMINI_API_KEY = "xxxxxxxxxxxxxxx" # Replace with your actual API key
genai.configure(api_key=GEMINI_API_KEY)

# Attendance Cooldown Period (in minutes)
ATTENDANCE_COOLDOWN_MINUTES = 5

def decode_image_from_base64(base64_string):
    # Remove the "data:image/jpeg;base64," prefix if present
    if "," in base64_string:
        base64_string = base64_string.split(',')[1]
    
    nparr = np.frombuffer(base64.b64decode(base64_string), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

app = Flask(__name__)
CORS(app) # Enable CORS for all routes
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    mobile_number = db.Column(db.String(20), nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    facial_embedding = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f"User('{self.name}', '{self.email}')"

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())

    user = db.relationship('User', backref=db.backref('attendances', lazy=True))

    def __repr__(self):
        return f"Attendance(User ID: {self.user_id}, Timestamp: {self.timestamp})"



@app.route('/')
def home():
    return "Smart Attendance System Backend"

@app.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    mobile_number = data.get('mobile_number')
    gender = data.get('gender')
    facial_data = data.get('facial_data')

    if not all([name, email, mobile_number, gender, facial_data]):
        return jsonify({"error": "Name, email, mobile number, gender, and facial data are required"}), 400

    try:
        image = decode_image_from_base64(facial_data)
        if image is None:
            return jsonify({"error": "Could not decode image"}), 400

        face_locations = face_recognition.face_locations(image)
        if not face_locations:
            return jsonify({"error": "No face found in the provided image."}), 400

        new_face_encoding = face_recognition.face_encodings(image, face_locations)[0]

        # Check if face already exists
        users = User.query.all()
        known_face_encodings = [np.fromstring(user.facial_embedding, sep=',') for user in users if user.facial_embedding]

        if known_face_encodings:
            face_distances = face_recognition.face_distance(known_face_encodings, new_face_encoding)
            if np.any(face_distances < 0.5):
                return jsonify({"error": "This face is already registered."}), 400

        user_embedding = ",".join(map(str, new_face_encoding))

    except Exception as e:
        return jsonify({"error": f"Error processing facial data: {str(e)}"}), 500

    new_user = User(name=name, email=email, mobile_number=mobile_number, gender=gender, facial_embedding=user_embedding)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully", "user_id": new_user.id}), 201

@app.route('/mark_attendance', methods=['POST'])
def mark_attendance():
    data = request.get_json()
    facial_data = data.get('facial_data')

    if not facial_data:
        return jsonify({"error": "Facial data is required"}), 400

    try:
        live_image = decode_image_from_base64(facial_data)
        if live_image is None:
            return jsonify({"error": "Could not decode image"}), 400

        live_face_locations = face_recognition.face_locations(live_image)
        if not live_face_locations:
            return jsonify({"error": "No face found in the provided image."}), 400

        live_face_encoding = face_recognition.face_encodings(live_image, live_face_locations)[0]

    except Exception as e:
        return jsonify({"error": f"Error processing facial data: {str(e)}"}), 500

    users = User.query.all()
    if not users:
        return jsonify({"error": "No users registered in the system."}), 404

    known_face_encodings = [np.fromstring(user.facial_embedding, sep=',') for user in users if user.facial_embedding]
    
    if not known_face_encodings:
        return jsonify({"error": "No registered users with facial data."}), 404

    face_distances = face_recognition.face_distance(known_face_encodings, live_face_encoding)
    best_match_index = np.argmin(face_distances)
    
    if face_distances[best_match_index] < 0.5:
        recognized_user_id = users[best_match_index].id
    else:
        recognized_user_id = None

    if recognized_user_id:
        user = User.query.get(recognized_user_id)
        if user:
            today = date.today()
            start_of_day = datetime.combine(today, datetime.min.time())
            end_of_day = datetime.combine(today, datetime.max.time())

            todays_attendance = Attendance.query.filter(
                Attendance.user_id == user.id,
                Attendance.timestamp.between(start_of_day, end_of_day)
            ).first()

            user_data = {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'mobile_number': user.mobile_number,
                'gender': user.gender
            }

            if todays_attendance:
                return jsonify({"status": "already_marked", "user": user_data}), 200
            else:
                # Get current UTC time
                utc_now = datetime.utcnow()
                # Convert to IST (UTC+5:30)
                ist_now = utc_now + timedelta(hours=5, minutes=30)

                new_attendance = Attendance(user_id=user.id, timestamp=ist_now)
                db.session.add(new_attendance)
                db.session.commit()
                return jsonify({"status": "marked", "user": user_data}), 200
        else:
            return jsonify({"error": "Recognized user not found in database"}), 404
    else:
        return jsonify({"status": "not_recognized"}), 401

@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    users_data = []
    for user in users:
        users_data.append({
            'id': user.id, 
            'name': user.name, 
            'email': user.email,
            'mobile_number': user.mobile_number,
            'gender': user.gender,
            'facial_embedding': user.facial_embedding
        })
    return jsonify(users_data), 200

@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    new_name = data.get('name')
    new_email = data.get('email')
    new_mobile_number = data.get('mobile_number')
    new_gender = data.get('gender')
    new_facial_data = data.get('facial_data')

    if new_name:
        user.name = new_name
    if new_email:
        user.email = new_email
    if new_mobile_number:
        user.mobile_number = new_mobile_number
    if new_gender:
        user.gender = new_gender
    
    if new_facial_data:
        try:
            image = decode_image_from_base64(new_facial_data)
            if image is None:
                return jsonify({"error": "Could not decode image"}), 400

            face_locations = face_recognition.face_locations(image)
            if not face_locations:
                return jsonify({"error": "No face found in the provided image."}),

            face_encoding = face_recognition.face_encodings(image, face_locations)[0]
            user.facial_embedding = ",".join(map(str, face_encoding))

        except Exception as e:
            return jsonify({"error": f"Error processing new facial data: {str(e)}"}), 500

    db.session.commit()
    return jsonify({"message": "User updated successfully"}), 200

@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Delete associated attendance records first
    Attendance.query.filter_by(user_id=user_id).delete()
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User and associated attendance records deleted successfully"}), 200

@app.route('/attendance', methods=['GET'])
def get_attendance():
    attendance_records = Attendance.query.all()
    records_data = []
    for record in attendance_records:
        records_data.append({'id': record.id, 'user_id': record.user_id, 'timestamp': record.timestamp.isoformat()})
    return jsonify(records_data), 200

@app.route('/attendance', methods=['POST'])
def add_attendance():
    data = request.get_json()
    user_id = data.get('user_id')
    timestamp_str = data.get('timestamp')

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if timestamp_str:
        try:
            timestamp = datetime.fromisoformat(timestamp_str)
        except ValueError:
            return jsonify({"error": "Invalid timestamp format. Use ISO format (YYYY-MM-DDTHH:MM:SS)."}), 400
    else:
        # Get current UTC time
        utc_now = datetime.utcnow()
        # Convert to IST (UTC+5:30)
        timestamp = utc_now + timedelta(hours=5, minutes=30)

    new_attendance = Attendance(user_id=user_id, timestamp=timestamp)
    db.session.add(new_attendance)
    db.session.commit()
    return jsonify({"message": "Attendance record added successfully", "record_id": new_attendance.id}), 201

@app.route('/attendance/<int:record_id>', methods=['PUT'])
def update_attendance(record_id):
    record = Attendance.query.get(record_id)
    if not record:
        return jsonify({"error": "Attendance record not found"}), 404

    data = request.get_json()
    new_user_id = data.get('user_id')
    new_timestamp_str = data.get('timestamp')

    if new_user_id:
        user = User.query.get(new_user_id)
        if not user:
            return jsonify({"error": "New User ID not found"}), 404
        record.user_id = new_user_id

    if new_timestamp_str:
        try:
            record.timestamp = datetime.fromisoformat(new_timestamp_str)
        except ValueError:
            return jsonify({"error": "Invalid timestamp format. Use ISO format (YYYY-MM-DDTHH:MM:SS)."}), 400

    db.session.commit()
    return jsonify({"message": "Attendance record updated successfully"}), 200

@app.route('/attendance/<int:record_id>', methods=['DELETE'])
def delete_attendance(record_id):
    record = Attendance.query.get(record_id)
    if not record:
        return jsonify({"error": "Attendance record not found"}), 404

    db.session.delete(record)
    db.session.commit()
    return jsonify({"message": "Attendance record deleted successfully"}), 200


@app.route('/detect_face', methods=['POST'])
def detect_face():
    data = request.get_json()
    facial_data = data.get('facial_data')

    if not facial_data:
        return jsonify({"error": "Facial data is required"}), 400

    try:
        image = decode_image_from_base64(facial_data)
        if image is None:
            return jsonify({"error": "Could not decode image"}), 400

        face_locations = face_recognition.face_locations(image)
        
        # Convert face_locations (top, right, bottom, left) to a more common format (x, y, width, height)
        detected_faces = []
        for (top, right, bottom, left) in face_locations:
            detected_faces.append({
                "x": left,
                "y": top,
                "width": right - left,
                "height": bottom - top
            })

        return jsonify({"faces": detected_faces}), 200

    except Exception as e:
        return jsonify({"error": f"Error processing facial data: {str(e)}"}), 500

@app.route('/chatbot', methods=['POST'])
def chatbot_query():
    data = request.get_json()
    user_query = data.get('query')

    if not user_query:
        return jsonify({"error": "Query is required"}), 400

    try:
        # Retrieve attendance data for the chatbot to reason over
        # For a real system, you'd filter this by user, date range, etc.
        attendance_records = Attendance.query.all()
        attendance_info = []
        for record in attendance_records:
            user = User.query.get(record.user_id)
            if user:
                attendance_info.append(f"User: {user.name}, Email: {user.email}, Mobile: {user.mobile_number}, Gender: {user.gender}, Timestamp: {record.timestamp.isoformat()}")
        
        # Construct the prompt for Gemini
        prompt = f"""You are an attendance chatbot. Based on the following attendance records, answer the user's query. If you cannot find the information, state that you don't have it. 

Attendance Records:
{'; '.join(attendance_info)}

User Query: {user_query}

Chatbot:"""

        model = genai.GenerativeModel('gemini-2.0-flash') # Using gemini-2.0-flash for text generation
        response = model.generate_content(prompt)
        
        return jsonify({"response": response.text}), 200

    except Exception as e:
        return jsonify({"error": f"Error communicating with chatbot: {str(e)}"}), 500

@app.route('/attendance/report/monthly', methods=['GET'])
def monthly_report():
    month = request.args.get('month', type=int)
    year = request.args.get('year', type=int)
    user_id = request.args.get('user_id', type=int)

    if not month or not year:
        return jsonify({'error': 'Month and year are required'}), 400

    try:
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
    except ValueError:
        return jsonify({'error': 'Invalid month or year'}), 400

    query = User.query
    if user_id:
        query = query.filter(User.id == user_id)
    
    users = query.all()
    
    report_data = []

    total_working_days = 0
    current_date = start_date
    while current_date < end_date:
        total_working_days += 1
        current_date += timedelta(days=1)

    for user in users:
        attendance_records = Attendance.query.filter(
            Attendance.user_id == user.id,
            Attendance.timestamp >= start_date,
            Attendance.timestamp < end_date
        ).all()

        total_days_present = len(attendance_records)
        daily_log = [record.timestamp.isoformat() for record in attendance_records]
        
        if total_working_days > 0:
            monthly_attendance_percentage = (total_days_present / total_working_days) * 100
        else:
            monthly_attendance_percentage = 0.0

        report_data.append({
            'user_id': user.id,
            'user_name': user.name,
            'email': user.email,
            'mobile_number': user.mobile_number,
            'gender': user.gender,
            'total_working_days': total_working_days,
            'total_days_present': total_days_present,
            'monthly_attendance_percentage': monthly_attendance_percentage,
            'daily_log': daily_log
        })

    return jsonify(report_data)

@app.route('/attendance/analytics/monthly', methods=['GET'])
def monthly_analytics():
    month = request.args.get('month', type=int)
    year = request.args.get('year', type=int)

    if not all([month, year]):
        return jsonify({"error": "Month and year are required"}), 400

    # Average attendance for the last 6 months
    avg_attendance = []
    for i in range(6):
        m = month - i
        y = year
        if m <= 0:
            m += 12
            y -= 1
        
        start_date = date(y, m, 1)
        end_date = date(y, m + 1, 1) if m < 12 else date(y + 1, 1, 1)
        
        total_users = User.query.count()
        present_users = db.session.query(Attendance.user_id).filter(Attendance.timestamp >= start_date, Attendance.timestamp < end_date).distinct().count()
        
        avg_attendance.append({
            "month": m,
            "year": y,
            "average_attendance": (present_users / total_users) * 100 if total_users > 0 else 0
        })

    # Students with 100% attendance
    start_date = date(year, month, 1)
    end_date = date(year, month + 1, 1) if month < 12 else date(year + 1, 1, 1)
    
    users = User.query.all()
    full_attendance_users = []
    for user in users:
        present_days = Attendance.query.filter(
            Attendance.user_id == user.id,
            Attendance.timestamp >= start_date,
            Attendance.timestamp < end_date
        ).count()
        if present_days >= 22: # Assuming 22 working days
            full_attendance_users.append(user.name)

    # Defaulters list
    defaulters = []
    for user in users:
        present_days = Attendance.query.filter(
            Attendance.user_id == user.id,
            Attendance.timestamp >= start_date,
            Attendance.timestamp < end_date
        ).count()
        attendance_percentage = (present_days / 22) * 100 if 22 > 0 else 0
        if attendance_percentage < 75:
            defaulters.append({"name": user.name, "attendance_percentage": attendance_percentage})

    return jsonify({
        "average_attendance_last_6_months": avg_attendance,
        "full_attendance_users": full_attendance_users,
        "defaulters_list": defaulters
    }), 200

@app.route('/attendance/calendar/monthly', methods=['GET'])
def monthly_calendar():
    month = request.args.get('month', type=int)
    year = request.args.get('year', type=int)
    user_id = request.args.get('user_id', type=int)

    if not all([month, year, user_id]):
        return jsonify({"error": "Month, year, and user_id are required"}), 400

    try:
        start_date = date(year, month, 1)
        end_date = date(year, month + 1, 1) if month < 12 else date(year + 1, 1, 1)
    except ValueError:
        return jsonify({"error": "Invalid month or year"}), 400

    records = Attendance.query.filter(
        Attendance.user_id == user_id,
        Attendance.timestamp >= start_date,
        Attendance.timestamp < end_date
    ).all()

    calendar_data = {}
    for record in records:
        day = record.timestamp.day
        calendar_data[day] = "Present"

    # Assuming holidays and leaves are managed elsewhere, for now, we'll just mark present days
    # You can extend this to include other statuses
    
    return jsonify(calendar_data), 200



if __name__ == '__main__':
    with app.app_context():
        db.create_all()

        # Check if the 'email' column exists in the 'user' table
        inspector = db.inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns('user')]
        if 'email' not in columns:
            # Add the 'email' column to the 'user' table
            db.session.execute(text('ALTER TABLE user ADD COLUMN email VARCHAR(120)'))
        if 'mobile_number' not in columns:
            # Add the 'mobile_number' column to the 'user' table
            db.session.execute(text('ALTER TABLE user ADD COLUMN mobile_number VARCHAR(20)'))
        if 'gender' not in columns:
            # Add the 'gender' column to the 'user' table
            db.session.execute(text('ALTER TABLE user ADD COLUMN gender VARCHAR(10)'))
        db.session.commit()

    app.run(debug=True)
