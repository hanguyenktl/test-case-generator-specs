import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/shell/Layout';
import Directory from './pages/Directory';
import ManualTestAuthoringPrototype from './prototypes/manual-test-authoring';
import AITestCaseGenerationPrototype from './prototypes/ai-test-case-generation';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Hub Homepage */}
        <Route path="/" element={
          <Layout breadcrumbs={["TestOps", "Prototype Hub"]}>
            <Directory />
          </Layout>
        } />

        {/* Individual Prototype Routes */}
        <Route path="/prototypes/manual-test-authoring" element={<ManualTestAuthoringPrototype />} />
        <Route path="/prototypes/ai-test-case-generation" element={<AITestCaseGenerationPrototype />} />

        {/* Fallback */}
        <Route path="*" element={
          <Layout>
            <div className="p-20 text-center">404 - Prototype Not Found</div>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}
