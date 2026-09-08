import { useState } from "react";

function App() {
  const [student, setStudent] = useState({
    Hours_Studied: 23,
    Attendance: 84,
    Sleep_Hours: 7,
    Previous_Scores: 75,
    Tutoring_Sessions: 2,
    Physical_Activity: 3
  });

  const [result, setResult] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [whatIfResult, setWhatIfResult] = useState(null);
  const [activePage, setActivePage] = useState("student");

  const handleChange = (e) => {
    setStudent({
      ...student,
      [e.target.name]: Number(e.target.value)
    });
  };

  const analyzeStudent = async () => {
    const predictionResponse = await fetch(
      "http://127.0.0.1:8000/predict",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(student)
      }
    );

    const predictionData = await predictionResponse.json();
    setResult(predictionData);

    const explanationResponse = await fetch(
      "http://127.0.0.1:8000/explain",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(student)
      }
    );

    const explanationData = await explanationResponse.json();
    setExplanation(explanationData);
  };

  const runWhatIf = async () => {
    const response = await fetch(
      "http://127.0.0.1:8000/what-if",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(student)
      }
    );

    const data = await response.json();
    setWhatIfResult(data);
  };

  return (
    <div className="app">

      <aside className="sidebar">

        <h2>AI Student Success</h2>

        <button onClick={() => setActivePage("student")}>
          Student Dashboard
        </button>

        <button onClick={() => setActivePage("teacher")}>
          Teacher Dashboard
        </button>

        <button onClick={() => setActivePage("whatif")}>
          What-If Analysis
        </button>

        <button onClick={() => setActivePage("explanation")}>
          AI Explanation
        </button>

      </aside>

      <main className="main-content">

        {/* STUDENT DASHBOARD */}
        {activePage === "student" && (
          <>
            <h1>Student Performance Dashboard</h1>

            <p>
              Enter student information for AI-powered performance analysis.
            </p>

            <div className="student-form">

              <label>
                Hours Studied
                <input
                  type="number"
                  name="Hours_Studied"
                  value={student.Hours_Studied}
                  onChange={handleChange}
                />
              </label>

              <label>
                Attendance (%)
                <input
                  type="number"
                  name="Attendance"
                  value={student.Attendance}
                  onChange={handleChange}
                />
              </label>

              <label>
                Sleep Hours
                <input
                  type="number"
                  name="Sleep_Hours"
                  value={student.Sleep_Hours}
                  onChange={handleChange}
                />
              </label>

              <label>
                Previous Score
                <input
                  type="number"
                  name="Previous_Scores"
                  value={student.Previous_Scores}
                  onChange={handleChange}
                />
              </label>

              <label>
                Tutoring Sessions
                <input
                  type="number"
                  name="Tutoring_Sessions"
                  value={student.Tutoring_Sessions}
                  onChange={handleChange}
                />
              </label>

              <label>
                Physical Activity
                <input
                  type="number"
                  name="Physical_Activity"
                  value={student.Physical_Activity}
                  onChange={handleChange}
                />
              </label>

              <button
                className="predict-button"
                onClick={analyzeStudent}
              >
                Analyze Student
              </button>

            </div>

            {result && (
              <div className="result-card">

                <h2>AI Prediction Result</h2>

                <h3>
                  Predicted Exam Score: {result.predicted_exam_score}
                </h3>

                <p>
                  Risk Level: <strong>{result.risk_level}</strong>
                </p>

                <h3>Personalized Recommendations</h3>

                <ul>
                  {result.recommendations.map((recommendation, index) => (
                    <li key={index}>
                      {recommendation}
                    </li>
                  ))}
                </ul>

              </div>
            )}

            {explanation && (
              <div className="result-card">

                <h2>Why did the AI predict this?</h2>

                <p>
                  The following factors had the strongest influence:
                </p>

                <ul>
                  {explanation.explanation.map((item, index) => (
                    <li key={index}>
                      <strong>{item.feature}</strong>
                      {" → "}
                      {item.impact > 0 ? "+" : ""}
                      {item.impact}
                    </li>
                  ))}
                </ul>

              </div>
            )}

          </>
        )}

        {/* TEACHER DASHBOARD */}
        {activePage === "teacher" && (
          <div>

            <h1>Teacher Dashboard</h1>

            <p>
              Monitor student performance and identify students who may need
              intervention.
            </p>

            <div className="result-card">

              <h2>Class Performance Overview</h2>

              <h3>Students Analyzed: 120</h3>
              <h3>Average Predicted Score: 69.86</h3>
              <h3>Low Risk: 72</h3>
              <h3>Medium Risk: 34</h3>
              <h3>High Risk: 14</h3>

              {/* Risk Chart */}
              <div className="risk-chart">

                <div className="risk-row">
                  <span>Low Risk</span>

                  <div className="risk-bar">
                    <div
                      className="risk-low"
                      style={{ width: "60%" }}
                    >
                      72
                    </div>
                  </div>
                </div>

                <div className="risk-row">
                  <span>Medium Risk</span>

                  <div className="risk-bar">
                    <div
                      className="risk-medium"
                      style={{ width: "28%" }}
                    >
                      34
                    </div>
                  </div>
                </div>

                <div className="risk-row">
                  <span>High Risk</span>

                  <div className="risk-bar">
                    <div
                      className="risk-high"
                      style={{ width: "12%" }}
                    >
                      14
                    </div>
                  </div>
                </div>

              </div>

              {/* Performance Trend */}
              <div className="result-card">

                <h2>📈 Performance Trend</h2>

                <p>
                  Average predicted performance across recent assessments.
                </p>

                <div className="trend-chart">

                  <div className="trend-item">
                    <div
                      className="trend-bar"
                      style={{ height: "64.2px" }}
                    >
                      64.2
                    </div>

                    <span>Assessment 1</span>
                  </div>

                  <div className="trend-item">
                    <div
                      className="trend-bar"
                      style={{ height: "66.8px" }}
                    >
                      66.8
                    </div>

                    <span>Assessment 2</span>
                  </div>

                  <div className="trend-item">
                    <div
                      className="trend-bar"
                      style={{ height: "68.4px" }}
                    >
                      68.4
                    </div>

                    <span>Assessment 3</span>
                  </div>

                  <div className="trend-item">
                    <div
                      className="trend-bar"
                      style={{ height: "69.86px" }}
                    >
                      69.86
                    </div>

                    <span>Assessment 4</span>
                  </div>

                </div>

              </div>

              {/* Student Risk Table */}
              <h2>Student Risk Overview</h2>

              <table className="student-table">

                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Predicted Score</th>
                    <th>Risk Level</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  <tr>
                    <td>Student 001</td>
                    <td>82.4</td>
                    <td className="low-risk">Low</td>
                    <td>Continue Monitoring</td>
                  </tr>

                  <tr>
                    <td>Student 002</td>
                    <td>68.7</td>
                    <td className="medium-risk">Medium</td>
                    <td>Improve Attendance</td>
                  </tr>

                  <tr>
                    <td>Student 003</td>
                    <td>57.9</td>
                    <td className="high-risk">High</td>
                    <td>Immediate Intervention</td>
                  </tr>

                  <tr>
                    <td>Student 004</td>
                    <td>73.5</td>
                    <td className="low-risk">Low</td>
                    <td>Continue Monitoring</td>
                  </tr>

                  <tr>
                    <td>Student 005</td>
                    <td>61.8</td>
                    <td className="medium-risk">Medium</td>
                    <td>Additional Tutoring</td>
                  </tr>

                </tbody>

              </table>

              {/* Students Requiring Attention */}
              <div className="result-card">

                <h2>🚨 Students Requiring Attention</h2>

                <ul>

                  <li>
                    <strong>Student 003</strong> — High Risk —
                    Immediate Intervention
                  </li>

                  <li>
                    <strong>Student 002</strong> — Medium Risk —
                    Improve Attendance
                  </li>

                  <li>
                    <strong>Student 005</strong> — Medium Risk —
                    Additional Tutoring
                  </li>

                </ul>

              </div>

            </div>

          </div>
        )}

        {/* WHAT-IF ANALYSIS */}
        {activePage === "whatif" && (
          <div>

            <h1>What-If Analysis</h1>

            <p>
              Simulate how changes in student behavior may affect predicted
              performance.
            </p>

            <div className="result-card">

              <h2>🔮 What-If Simulator</h2>

              <p>
                Adjust the student factors and simulate the expected
                improvement.
              </p>

              <label>
                Study Hours

                <input
                  type="number"
                  min="0"
                  max="50"
                  value={student.Hours_Studied}
                  onChange={(e) =>
                    setStudent({
                      ...student,
                      Hours_Studied: Number(e.target.value)
                    })
                  }
                />

              </label>

              <label>
                Attendance (%)

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={student.Attendance}
                  onChange={(e) =>
                    setStudent({
                      ...student,
                      Attendance: Number(e.target.value)
                    })
                  }
                />

              </label>

              <label>
                Tutoring Sessions

                <input
                  type="number"
                  min="0"
                  max="10"
                  value={student.Tutoring_Sessions}
                  onChange={(e) =>
                    setStudent({
                      ...student,
                      Tutoring_Sessions: Number(e.target.value)
                    })
                  }
                />

              </label>

              <button
                className="predict-button"
                onClick={runWhatIf}
              >
                Simulate Improvement
              </button>

            </div>

            {whatIfResult && (
              <div className="result-card">

                <h2>📊 Simulation Result</h2>

                <h3>
                  Current Predicted Score: {whatIfResult.current_score}
                </h3>

                <h3>
                  Improved Predicted Score: {whatIfResult.improved_score}
                </h3>

                <h3>
                  Expected Improvement: +
                  {whatIfResult.expected_improvement}
                </h3>

                <p>
                  <strong>Suggested Improvements:</strong>
                </p>

                <ul>
                  {whatIfResult.changes.map((change, index) => (
                    <li key={index}>
                      {change}
                    </li>
                  ))}
                </ul>

              </div>
            )}

          </div>
        )}

        {/* AI EXPLANATION */}
        {activePage === "explanation" && (
          <div>

            <h1>AI Explanation</h1>

            <p>
              Explainable AI shows which factors influenced the prediction.
            </p>

            {!explanation && (
              <div className="result-card">

                <h2>No explanation available yet</h2>

                <p>
                  Go to the Student Dashboard and click
                  <strong> Analyze Student </strong>
                  to generate an AI explanation.
                </p>

              </div>
            )}

            {explanation && (
              <div className="result-card">

                <h2>Why did the AI predict this?</h2>

                <h3>
                  Predicted Score: {explanation.prediction}
                </h3>

                <p>
                  Top factors influencing the prediction:
                </p>

                <ul>
                  {explanation.explanation.map((item, index) => (
                    <li key={index}>
                      <strong>{item.feature}</strong>
                      {" → "}
                      {item.impact > 0 ? "+" : ""}
                      {item.impact}
                    </li>
                  ))}
                </ul>

              </div>
            )}

          </div>
        )}

      </main>

    </div>
  );
}

export default App;