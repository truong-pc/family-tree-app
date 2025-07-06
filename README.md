# Family Tree Web Application

This project is a web-based Family Tree management system. It allows users to add, search, and visualize family relationships using a modern frontend (Next.js + Tailwind CSS) and a backend powered by Flask and Neo4j.

## Features
- Add people with name, gender, and description
- Create parent-child relationships
- Delete people
- Search for people by name
- Visualize the family tree structure

## Technology Stack
- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Flask (Python)
- **Database:** Neo4j (Graph Database)


## Prerequisites
- Python 3.8+
- Node.js (v16+ recommended)
- Neo4j AuraDB instance or local Neo4j server

## Setup Instructions

### 1. Backend (Flask)
1. Install Python dependencies:
   ```powershell
   pip install flask flask-cors neo4j
   ```
2. Update the Neo4j connection URI, username, and password in `server.py` if needed.
3. Start the Flask server:
   ```powershell
   python server.py
   ```

### 2. Frontend (Next.js)
1. Navigate to the `frontend` directory:
   ```powershell
   cd frontend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start the development server:
   ```powershell
   npm run dev
   ```

### 3. Access the Application
- The backend API runs by default at: `http://127.0.0.1:5000/`
- The frontend runs by default at: `http://localhost:3000/`

## License
This project is for educational purposes.
