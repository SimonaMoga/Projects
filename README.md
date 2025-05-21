# 🌍 AI-Powered Language Learning Platform

Final-year BSc Computer Science project at London Metropolitan University.  
This full-stack web application helps preserve Romanian cultural heritage by providing interactive language quizzes to expat children using modern NLP techniques.

---

## 🚀 Features

- 📚 Automatically generates fill-in-the-blank quizzes from Wikipedia using NLP (TF-IDF + distilRoBERTa)
- 🧠 Category-based quiz selection and personalized suggestions
- 🧾 Tracks user performance and scores
- 💻 Full-stack architecture using Flask (backend) and React (frontend)
- 📊 Admin dashboard with analytics and progress charts
- 🗂️ SQLite database with SQLAlchemy ORM

---

## 🛠️ Tech Stack

| Area       | Technology                         |
|------------|-------------------------------------|
| Frontend   | React (TypeScript), HTML/CSS        |
| Backend    | Python, Flask, SQLAlchemy, Jinja2   |
| NLP        | TF-IDF, distilRoBERTa (Hugging Face)|
| Database   | SQLite                              |
| Tools      | Git, VS Code, GitHub                |

---

## ⚙️ Setup Instructions

### Backend (Flask)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
flask run

### Frontend (React + Vite)
cd frontend
npm install
npm run dev

👩‍💻 Author
Simona Moga
GitHub: github.com/SimonaMoga
LinkedIn: linkedin.com/in/simonamoga
