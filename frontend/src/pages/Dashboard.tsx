import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useLocation } from "react-router-dom";
import "./Dashboard.css";

const categories = [
  { name: "Cultură", image: "cultura.jpg" },
  { name: "Geografie", image: "geografie.jpg" },
  { name: "Istorie", image: "istorie.jpg" },
  { name: "Literatură", image: "literatura.jpg" },
  { name: "Sport", image: "sport.jpg" },
  { name: "Religie și Spiritualitate", image: "religie.jpg" },
  { name: "Bucătărie și Gastronomie", image: "bucatarie.jpg" },
  { name: "Muzică și Dans", image: "muzica.jpg" },
  { name: "Arhitectură și Monumente", image: "arhitectura.jpg" },
  { name: "Festivaluri și Sărbători", image: "festivaluri.jpg" },
  { name: "Folclor și Mitologie", image: "folclor.jpg" },
];

export default function Dashboard() {
  const [quizData, setQuizData] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const userId = localStorage.getItem("user_id");

  // ✅ Fetch username on load
  useEffect(() => {
    if (userId) {
      axios.get(`http://127.0.0.1:5000/get_username/${userId}`)
        .then((res) => setUsername(res.data.username))
        .catch((err) => console.error("❌ Failed to fetch username", err));
    }
  }, []);

  // ✅ Scroll into view when quizData loads
  useEffect(() => {
    if (quizData && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [quizData]);

  const fetchQuiz = async (rawCategory: string) => {
    const category = categories.find(cat => rawCategory.startsWith(cat.name))?.name;
    if (!category) return;

    setCurrentCategory(category);

    try {
      const res = await axios.post("http://127.0.0.1:5000/quiz", {
        category,
        nonce: uuidv4(),
      });
      setQuizData(res.data);
      setSelectedAnswer(null);
      setFeedback("");
    } catch (error) {
      alert("Failed to fetch quiz.");
    }
  };

  const checkAnswer = async () => {
    if (!quizData || selectedAnswer === null) return;
    const isCorrect = selectedAnswer === quizData.answer;
    setFeedback(isCorrect ? "✅ Correct!" : "❌ Incorrect!");

    await axios.post("http://127.0.0.1:5000/submit_answer", {
      user_id: Number(userId),
      category: currentCategory,
      is_correct: isCorrect,
    });
  };

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const suggested = params.get("suggested");
    if (suggested) {
      fetchQuiz(suggested);
    }
  }, []);
  
  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        <div ref={scrollRef}></div>

        {/* ✅ Welcome Message */}
        {username && (
          <div className="welcome-message">
            <h2>Hello, {username}</h2>
            {currentCategory && (
              <p>Currently selected category: <strong>{currentCategory}</strong></p>
            )}
          </div>
        )}

        {/* ✅ Quiz Section */}
        {quizData && (
          <div className="quiz-box">
            <h3>{quizData.question}</h3>
            {quizData.translated && (
              <p className="translated-hint">
                <strong>English Hint:</strong> {quizData.translated}
              </p>
            )}
            <ul>
              {quizData.options.map((option: string, index: number) => (
                <li key={index}>
                  <label>
                    <input
                      type="radio"
                      name="quizOption"
                      value={option}
                      checked={selectedAnswer === option}
                      onChange={() => setSelectedAnswer(option)}
                      disabled={!!feedback}
                    />
                    {option}
                  </label>
                </li>
              ))}
            </ul>

            {!feedback && <button onClick={checkAnswer}>Submit Answer</button>}

            {feedback && (
              <>
                <p className={feedback.includes("Correct") ? "correct" : "incorrect"}>{feedback}</p>
                <button onClick={() => fetchQuiz(currentCategory!)}>
                  Generate New Quiz
                </button>
              </>
            )}
          </div>
        )}

        <h2>Select a new category</h2>

        {/* ✅ Category Tiles Grid */}
        <div className="dashboard-tiles-grid">
          {categories.map((cat) => (
            <div key={cat.name} className="dashboard-tile" onClick={() => fetchQuiz(cat.name)}>
              <img src={`/images/${cat.image}`} alt={cat.name} />
              <p>{cat.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
