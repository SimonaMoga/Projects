import "./Home.css";

const categories = [
  { name: "Cultură", keywords: ["Traditions", "Identity", "Expression"] },
  { name: "Geografie", keywords: ["Landscapes", "Climate", "Regions"] },
  { name: "Istorie", keywords: ["Events", "Heritage", "Chronology"] },
  { name: "Literatură", keywords: ["Imagination", "Narrative", "Language"] },
  { name: "Sport", keywords: ["Competition", "Teamwork", "Achievement"] },
  { name: "Religie și Spiritualitate", keywords: ["Faith", "Philosophy", "Belief"] },
  { name: "Bucătărie și Gastronomie", keywords: ["Flavor", "Tradition", "Creativity"] },
  { name: "Muzică și Dans", keywords: ["Rhythm", "Emotion", "Culture"] },
  { name: "Arhitectură și Monumente", keywords: ["Design", "History", "Symbolism"] },
  { name: "Festivaluri și Sărbători", keywords: ["Celebration", "Joy", "Unity"] },
  { name: "Folclor și Mitologie", keywords: ["Legends", "Wisdom", "Magic"] }
];

const Home = () => {
  return (
    <>
      <div className="home-hero">
        <div className="hero-left">
          <h1>Preserving Cultural Heritage<br />through Interactive Learning</h1>
          <p>
            Discover, engage, and grow your understanding of Romania’s rich culture through dynamic quizzes and educational tools.
          </p>
          <a href="#categories-section" className="explore-button">Explore Categories</a>
        </div>
        <div className="hero-right">
          <img src="/images/home.png" alt="Cultural Heritage" className="hero-img" />
        </div>
      </div>

      <div id="categories-section" className="categories-section">
        <h2>Explore Topics</h2>
        <div className="tiles-grid">
          {categories.map((cat) => (
            <div className="tile" key={cat.name}>
              <h3>{cat.name}</h3>
              <p>
                {cat.keywords.map((kw, idx) => (
                  <span key={idx}>{kw}<br /></span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;
