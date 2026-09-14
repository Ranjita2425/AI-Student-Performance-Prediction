import { useState } from "react";
import "./index.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [activePage, setActivePage] = useState("student");

  const [student, setStudent] = useState({
    Hours_Studied: 23,
    Attendance: 84,
    Sleep_Hours: 7,
    Previous_Scores: 75,
    Tutoring_Sessions: 2,
    Physical_Activity: 3,
  });

  const [result, setResult] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [whatIf, setWhatIf] = useState({
    Hours_Studied: 23,
    Attendance: 84,
    Sleep_Hours: 7,
    Previous_Scores: 75,
    Tutoring_Sessions: 2,
    Physical_Activity: 3,
    WhatIf_Hours_Studied: 28,
    WhatIf_Attendance: 89,
    WhatIf_Tutoring_Sessions: 3,
  });

  const [whatIfResult, setWhatIfResult] = useState(null);
  const [whatIfLoading, setWhatIfLoading] = useState(false);

  const handleStudentChange = (e) => {
    const { name, value } = e.target;

    setStudent({
      ...student,
      [name]: Number(value),
    });
  };

  const handleWhatIfChange = (e) => {
    const { name, value } = e.target;

    setWhatIf({
      ...whatIf,
      [name]: Number(value),
    });
  };

  const analyzeStudent = async () => {
    setLoading(true);
    setError("");

    try {
      const predictionResponse = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(student),
      });

      if (!predictionResponse.ok) {
        throw new Error("Prediction request failed");
      }

      const predictionData = await predictionResponse.json();

      setResult(predictionData);

      const explainResponse = await fetch(`${API_URL}/explain`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(student),
      });

      if (explainResponse.ok) {
        const explainData = await explainResponse.json();
        setExplanation(explainData);
      }
    } catch (err) {
      setError(
        "Unable to connect to the backend. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const runWhatIf = async () => {
    setWhatIfLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/what-if`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(whatIf),
      });

      if (!response.ok) {
        throw new Error("What-If request failed");
      }

      const data = await response.json();

      setWhatIfResult(data);
    } catch (err) {
      setError(
        "Unable to run What-If analysis. Make sure FastAPI is running."
      );
    } finally {
      setWhatIfLoading(false);
    }
  };

  const riskClass = (risk) => {
    if (risk === "High") return "risk-high";
    if (risk === "Medium") return "risk-medium";
    return "risk-low";
  };

  const renderStudentDashboard = () => (
    <div className="page">
      <div className="page-header">
        <h1>Student Performance Dashboard</h1>
        <p>
          Enter student information for AI-powered performance analysis.
        </p>
      </div>

      <div className="card">
        <div className="input-grid">
          <div className="input-group">
            <label>Hours Studied</label>
            <input
              type="number"
              name="Hours_Studied"
              value={student.Hours_Studied}
              onChange={handleStudentChange}
              min="0"
              max="50"
            />
          </div>

          <div className="input-group">
            <label>Attendance (%)</label>
            <input
              type="number"
              name="Attendance"
              value={student.Attendance}
              onChange={handleStudentChange}
              min="0"
              max="100"
            />
          </div>

          <div className="input-group">
            <label>Sleep Hours</label>
            <input
              type="number"
              name="Sleep_Hours"
              value={student.Sleep_Hours}
              onChange={handleStudentChange}
              min="0"
              max="24"
            />
          </div>

          <div className="input-group">
            <label>Previous Score</label>
            <input
              type="number"
              name="Previous_Scores"
              value={student.Previous_Scores}
              onChange={handleStudentChange}
              min="0"
              max="100"
            />
          </div>

          <div className="input-group">
            <label>Tutoring Sessions</label>
            <input
              type="number"
              name="Tutoring_Sessions"
              value={student.Tutoring_Sessions}
              onChange={handleStudentChange}
              min="0"
              max="20"
            />
          </div>

          <div className="input-group">
            <label>Physical Activity</label>
            <input
              type="number"
              name="Physical_Activity"
              value={student.Physical_Activity}
              onChange={handleStudentChange}
              min="0"
              max="24"
            />
          </div>
        </div>

        <button
          className="primary-button"
          onClick={analyzeStudent}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze Student"}
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      {result && (
        <div className="card result-card">
          <h2>AI Prediction Result</h2>

          <div className="score-display">
            <span>Predicted Exam Score</span>
            <strong>{result.predicted_exam_score}</strong>
          </div>

          <div className={`risk-badge ${riskClass(result.risk_level)}`}>
            Risk Level: {result.risk_level}
          </div>

          <h3>Personalized Recommendations</h3>

          <ul className="recommendation-list">
            {result.recommendations.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {explanation && (
        <div className="card">
          <h2>Why did the AI predict this?</h2>

          <p className="muted">
            The following factors had the strongest influence on the
            prediction.
          </p>

          <div className="explanation-list">
            {explanation.explanation.map((item, index) => (
              <div className="explanation-item" key={index}>
                <div>
                  <strong>{item.feature}</strong>
                </div>

                <span
                  className={
                    item.impact >= 0
                      ? "impact-positive"
                      : "impact-negative"
                  }
                >
                  {item.impact >= 0 ? "+" : ""}
                  {item.impact}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderTeacherDashboard = () => (
    <div className="page">
      <div className="page-header">
        <h1>Teacher Dashboard</h1>
        <p>Class-level performance and risk overview.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Students</span>
          <strong>120</strong>
        </div>

        <div className="stat-card">
          <span>Average Score</span>
          <strong>69.86</strong>
        </div>

        <div className="stat-card">
          <span>Low Risk</span>
          <strong>72</strong>
        </div>

        <div className="stat-card">
          <span>Medium Risk</span>
          <strong>34</strong>
        </div>

        <div className="stat-card">
          <span>High Risk</span>
          <strong>14</strong>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h2>Risk Distribution</h2>

          <div className="risk-chart">
            <div className="chart-row">
              <span>Low</span>
              <div className="chart-track">
                <div className="chart-bar low-bar" style={{ width: "60%" }}>
                  72
                </div>
              </div>
            </div>

            <div className="chart-row">
              <span>Medium</span>
              <div className="chart-track">
                <div
                  className="chart-bar medium-bar"
                  style={{ width: "28%" }}
                >
                  34
                </div>
              </div>
            </div>

            <div className="chart-row">
              <span>High</span>
              <div className="chart-track">
                <div className="chart-bar high-bar" style={{ width: "12%" }}>
                  14
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Performance Trend</h2>

          <div className="trend-chart">
            {[64.2, 66.8, 68.4, 69.86].map((score, index) => (
              <div className="trend-column" key={index}>
                <div
                  className="trend-bar"
                  style={{ height: `${score * 2}px` }}
                >
                  <span>{score}</span>
                </div>

                <small>
                  {["Term 1", "Term 2", "Term 3", "Current"][index]}
                </small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Students Requiring Attention</h2>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Score</th>
                <th>Risk</th>
                <th>Recommended Action</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Student 001</td>
                <td>82.4</td>
                <td>
                  <span className="table-risk low">Low</span>
                </td>
                <td>Continue Monitoring</td>
              </tr>

              <tr>
                <td>Student 002</td>
                <td>68.7</td>
                <td>
                  <span className="table-risk medium">Medium</span>
                </td>
                <td>Improve Attendance</td>
              </tr>

              <tr>
                <td>Student 003</td>
                <td>57.9</td>
                <td>
                  <span className="table-risk high">High</span>
                </td>
                <td>Immediate Intervention</td>
              </tr>

              <tr>
                <td>Student 004</td>
                <td>73.5</td>
                <td>
                  <span className="table-risk low">Low</span>
                </td>
                <td>Continue Monitoring</td>
              </tr>

              <tr>
                <td>Student 005</td>
                <td>61.8</td>
                <td>
                  <span className="table-risk medium">Medium</span>
                </td>
                <td>Additional Tutoring</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderWhatIf = () => (
    <div className="page">
      <div className="page-header">
        <h1>What-If Analysis</h1>
        <p>
          Simulate how changes in student behavior could affect predicted
          performance.
        </p>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h2>Current Student</h2>

          <div className="input-group">
            <label>Hours Studied</label>
            <input
              type="number"
              name="Hours_Studied"
              value={whatIf.Hours_Studied}
              onChange={handleWhatIfChange}
            />
          </div>

          <div className="input-group">
            <label>Attendance (%)</label>
            <input
              type="number"
              name="Attendance"
              value={whatIf.Attendance}
              onChange={handleWhatIfChange}
            />
          </div>

          <div className="input-group">
            <label>Sleep Hours</label>
            <input
              type="number"
              name="Sleep_Hours"
              value={whatIf.Sleep_Hours}
              onChange={handleWhatIfChange}
            />
          </div>

          <div className="input-group">
            <label>Previous Score</label>
            <input
              type="number"
              name="Previous_Scores"
              value={whatIf.Previous_Scores}
              onChange={handleWhatIfChange}
            />
          </div>

          <div className="input-group">
            <label>Tutoring Sessions</label>
            <input
              type="number"
              name="Tutoring_Sessions"
              value={whatIf.Tutoring_Sessions}
              onChange={handleWhatIfChange}
            />
          </div>

          <div className="input-group">
            <label>Physical Activity</label>
            <input
              type="number"
              name="Physical_Activity"
              value={whatIf.Physical_Activity}
              onChange={handleWhatIfChange}
            />
          </div>
        </div>

        <div className="card">
          <h2>What-If Scenario</h2>

          <div className="input-group">
            <label>New Hours Studied</label>
            <input
              type="number"
              name="WhatIf_Hours_Studied"
              value={whatIf.WhatIf_Hours_Studied}
              onChange={handleWhatIfChange}
              min="0"
              max="50"
            />
          </div>

          <div className="input-group">
            <label>New Attendance (%)</label>
            <input
              type="number"
              name="WhatIf_Attendance"
              value={whatIf.WhatIf_Attendance}
              onChange={handleWhatIfChange}
              min="0"
              max="100"
            />
          </div>

          <div className="input-group">
            <label>New Tutoring Sessions</label>
            <input
              type="number"
              name="WhatIf_Tutoring_Sessions"
              value={whatIf.WhatIf_Tutoring_Sessions}
              onChange={handleWhatIfChange}
              min="0"
              max="20"
            />
          </div>

          <button
            className="primary-button"
            onClick={runWhatIf}
            disabled={whatIfLoading}
          >
            {whatIfLoading ? "Simulating..." : "Run Simulation"}
          </button>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      {whatIfResult && (
        <div className="card result-card">
          <h2>Simulation Result</h2>

          <div className="comparison-grid">
            <div className="comparison-box">
              <span>Current Score</span>
              <strong>{whatIfResult.current_score}</strong>

              <small>
                Risk: {whatIfResult.current_risk}
              </small>
            </div>

            <div className="comparison-arrow">→</div>

            <div className="comparison-box">
              <span>What-If Score</span>
              <strong>{whatIfResult.improved_score}</strong>

              <small>
                Risk: {whatIfResult.improved_risk}
              </small>
            </div>
          </div>

          <div className="improvement-box">
            Expected Improvement:
            <strong>
              {whatIfResult.expected_improvement >= 0 ? "+" : ""}
              {whatIfResult.expected_improvement}
            </strong>
          </div>

          <h3>Changes Applied</h3>

          <ul className="recommendation-list">
            {whatIfResult.changes.map((change, index) => (
              <li key={index}>{change}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderExplanation = () => (
    <div className="page">
      <div className="page-header">
        <h1>AI Explanation</h1>
        <p>
          Explainable AI shows which factors influenced the prediction.
        </p>
      </div>

      {!explanation ? (
        <div className="card empty-card">
          <h2>No explanation available yet</h2>
          <p>
            Go to the Student Dashboard and click{" "}
            <strong>Analyze Student</strong> to generate an AI explanation.
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="score-display">
            <span>Model Prediction</span>
            <strong>{explanation.prediction}</strong>
          </div>

          <h2>Top Influencing Factors</h2>

          <div className="explanation-list">
            {explanation.explanation.map((item, index) => (
              <div className="explanation-item" key={index}>
                <div>
                  <strong>{item.feature}</strong>
                  <div className="impact-label">
                    {item.impact >= 0
                      ? "Positive influence"
                      : "Negative influence"}
                  </div>
                </div>

                <span
                  className={
                    item.impact >= 0
                      ? "impact-positive"
                      : "impact-negative"
                  }
                >
                  {item.impact >= 0 ? "+" : ""}
                  {item.impact}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">AI</div>

          <div>
            <h2>Student AI</h2>
            <span>Performance Intelligence</span>
          </div>
        </div>

        <nav>
          <button
            className={activePage === "student" ? "active" : ""}
            onClick={() => setActivePage("student")}
          >
            <span>▣</span>
            Student Dashboard
          </button>

          <button
            className={activePage === "teacher" ? "active" : ""}
            onClick={() => setActivePage("teacher")}
          >
            <span>▥</span>
            Teacher Dashboard
          </button>

          <button
            className={activePage === "whatif" ? "active" : ""}
            onClick={() => setActivePage("whatif")}
          >
            <span>↗</span>
            What-If Analysis
          </button>

          <button
            className={activePage === "explanation" ? "active" : ""}
            onClick={() => setActivePage("explanation")}
          >
            <span>✦</span>
            AI Explanation
          </button>
        </nav>

        <div className="sidebar-footer">
          <span>AI Student Performance System</span>
          <small>v1.0</small>
        </div>
      </aside>

      <main className="main-content">
        {activePage === "student" && renderStudentDashboard()}
        {activePage === "teacher" && renderTeacherDashboard()}
        {activePage === "whatif" && renderWhatIf()}
        {activePage === "explanation" && renderExplanation()}
      </main>
    </div>
  );
}

export default App;