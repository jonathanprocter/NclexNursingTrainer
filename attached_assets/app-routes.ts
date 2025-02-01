// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QuestionBank from "./pages/QuestionBank";
import Layout from "./components/Layout";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/questions" element={<QuestionBank />} />
          {/* Other routes */}
          <Route path="/" element={<QuestionBank />} /> {/* Make QuestionBank the default route */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
