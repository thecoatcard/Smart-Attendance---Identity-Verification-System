# Smart Attendance & Identity Verification System

This project is a web-based Smart Attendance & Identity Verification System designed to manage attendance records and verify user identities. It features a Flask-based backend API and a React-based frontend user interface.

## Features

*   **User Authentication:** Secure user registration, login, and logout functionalities.
*   **User Management:** Manage user accounts and roles.
*   **Attendance Tracking:** Record and manage attendance for users.
*   **Monthly Analytics:** View monthly attendance statistics and insights.
*   **Monthly Reports:** Generate detailed monthly attendance reports.
*   **Identity Verification:** (Implied by project name, details to be integrated or further developed)

## Technologies Used

### Backend

*   **Flask:** Web framework for building the API.
*   **Flask-SQLAlchemy:** ORM for database interaction.
*   **Flask-Migrate:** Database migrations with Alembic.
*   **Flask-CORS:** Handling Cross-Origin Resource Sharing.
*   **Flask-Login:** User session management.
*   **SQLite:** Lightweight relational database.

### Frontend

*   **React:** JavaScript library for building user interfaces.
*   **React Router:** Declarative routing for React.
*   **Axios:** Promise-based HTTP client for the browser and Node.js.
*   **Bootstrap:** CSS framework for responsive and mobile-first front-end web development.

## Project Structure

```
.
├───.git/
├───.gitignore
├───Attendance/                 # Potentially for attendance-related scripts or data
├───backend/
│   ├───app.py                  # Flask application entry point, API routes
│   ├───database.py             # Database configuration and models
│   ├───requirements.txt        # Python dependencies
│   └───instance/
│       └───site.db             # SQLite database file
├───frontend/
│   ├───public/                 # Static assets for the React app
│   ├───src/
│   │   ├───api.js              # Frontend API service
│   │   ├───App.js              # Main React application component
│   │   ├───index.js            # React app entry point
│   │   └───components/         # Reusable React components
│   │       ├───MonthlyAnalytics.js
│   │       └───MonthlyReport.js
│   ├───package.json            # Frontend dependencies and scripts
│   └───package-lock.json
└───README.md                   # This file
```

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

*   Python 3.x
*   Node.js & npm (or yarn)

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/your-username/Smart-Attendance-Identity-Verification-System.git
cd Smart-Attendance-Identity-Verification-System
```

#### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

#### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### Running the Application

#### 1. Start the Backend Server

```bash
cd backend
flask run
```
The backend server will typically run on `http://127.0.0.1:5000`.

#### 2. Start the Frontend Development Server

```bash
cd frontend
npm start
```
The frontend application will typically open in your browser at `http://localhost:3000`.

## Usage

*   Navigate to `http://localhost:3000` in your web browser.
*   Register a new user account or log in with existing credentials.
*   Explore the attendance tracking, monthly analytics, and reporting features.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

(Specify your license here, e.g., MIT, Apache 2.0, etc.)
