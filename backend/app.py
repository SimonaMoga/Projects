from flask import Flask, request, jsonify 
from flask_cors import CORS, cross_origin
from database import db
from models import User, Category, UserScore, QuizAttempt
from quiz import generate_quiz
import os
import traceback
import random

app = Flask(__name__)
CORS(app)

os.makedirs("instance", exist_ok=True)

db_path = os.path.abspath("instance/quiz.db")
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

with app.app_context():
    try:
        db.create_all()
    except Exception as e:
        print("🔥 Database Initialization Error:", str(e))
        traceback.print_exc()

@app.route("/")
def home():
    return jsonify({"message": "Hello from Flask API!"})

@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.json
        if not data.get("username") or not data.get("email") or not data.get("password"):
            return jsonify({"message": "Missing required fields"}), 400

        existing_user = User.query.filter_by(email=data["email"]).first()
        if existing_user:
            return jsonify({"message": "Email already registered"}), 409

        user = User(username=data["username"], email=data["email"], password=data["password"])
        db.session.add(user)
        db.session.commit()
        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        print("🔥 ERROR in /register route:", str(e))
        traceback.print_exc()
        return jsonify({"message": "Server error"}), 500

@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        user = User.query.filter_by(email=data["email"], password=data["password"]).first()
        if user:
            return jsonify({"message": "Login successful", "user": user.id}), 200
        return jsonify({"message": "Invalid credentials"}), 401

    except Exception as e:
        print("🔥 ERROR in /login route:", str(e))
        traceback.print_exc()
        return jsonify({"message": "Server error"}), 500

@app.route("/quiz", methods=["POST"])
def quiz():
    try:
        data = request.get_json()
        category = data.get("category")

        if not category:
            return jsonify({"error": "Category is required"}), 400

        quiz_data = generate_quiz(category)
        if not quiz_data:
            return jsonify({"error": "No questions found for this category"}), 404

        return jsonify(quiz_data)

    except FileNotFoundError as e:
        print("🔥 File Not Found:", str(e))
        return jsonify({"error": f"Data file not found: {str(e)}"}), 500
    except Exception as e:
        print("🔥 ERROR in /quiz route:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route("/submit_answer", methods=["POST"])
def submit_answer():
    try:
        data = request.get_json()
        user_id = data.get("user_id")
        category_name = data.get("category")
        is_correct = data.get("is_correct")

        if None in [user_id, category_name, is_correct]:
            return jsonify({"error": "Missing fields"}), 400

        category = Category.query.filter_by(name=category_name).first()
        if not category:
            category = Category(name=category_name)
            db.session.add(category)
            db.session.commit()

        attempt = QuizAttempt(
            user_id=user_id,
            category_id=category.id,
            score=1 if is_correct else 0
        )
        db.session.add(attempt)
        db.session.commit()

        return jsonify({"message": "Answer recorded"}), 201

    except Exception as e:
        print("🔥 ERROR in /submit_answer route:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route("/get_username/<int:user_id>", methods=["GET"])
@cross_origin()
def get_username(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"username": user.username})

@app.route("/user_stats/<int:user_id>", methods=["GET"])
@cross_origin()
def user_stats(user_id):
    try:
        attempts = QuizAttempt.query.filter_by(user_id=user_id).all()
        stats = {}

        for attempt in attempts:
            cat_name = attempt.category.name
            if cat_name not in stats:
                stats[cat_name] = {"correct": 0, "incorrect": 0}
            if attempt.score == 1:
                stats[cat_name]["correct"] += 1
            else:
                stats[cat_name]["incorrect"] += 1

        return jsonify(stats)
    except Exception as e:
        print("🔥 ERROR in /user_stats route:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route("/suggest_category/<int:user_id>", methods=["GET"])
@cross_origin()
def suggest_category(user_id):
    try:
        all_categories = [cat.name for cat in Category.query.all()]
        attempts = QuizAttempt.query.filter_by(user_id=user_id).all()

        if not all_categories:
            return jsonify({"suggestion": "No categories available", "reason": ""}), 404

        attempted = {}
        for attempt in attempts:
            name = attempt.category.name
            if name not in attempted:
                attempted[name] = {"correct": 0, "incorrect": 0}
            if attempt.score == 1:
                attempted[name]["correct"] += 1
            else:
                attempted[name]["incorrect"] += 1

        untried = list(set(all_categories) - set(attempted.keys()))
        if untried:
            suggestion = random.choice(untried)
            reason = "You haven’t tried this category yet."
        else:
            sorted_attempts = sorted(attempted.items(), key=lambda x: x[1]["incorrect"], reverse=True)
            suggestion = sorted_attempts[0][0] if sorted_attempts else random.choice(all_categories)
            reason = f"Your highest number of incorrect answers is in '{suggestion}'. Want to improve?"

        return jsonify({"suggestion": suggestion, "reason": reason})
    except Exception as e:
        print("🔥 ERROR in /suggest_category route:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
