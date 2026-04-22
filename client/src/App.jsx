import StudyExperience from "./study/StudyExperience.jsx";
import "./study/study.css";

export default function App() {
  return (
    <div className="study-app">
      <header className="study-app-header">
        <div className="study-app-header__brand">
          <span className="study-app-header__tag">Research platform</span>
          <p className="study-app-header__title">Sentiment Alignment Study</p>
        </div>
      </header>
      <StudyExperience />
    </div>
  );
}
