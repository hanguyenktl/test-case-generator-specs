import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/shell/Layout';
import Directory from './pages/Directory';

// We will import prototypes here as they are decomposed
// const TestCaseGenerator = React.lazy(() => import('./prototypes/test-case-generator'));

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
        <Route path="/prototypes/test-case-generator" element={
          <Layout breadcrumbs={["TestOps", "Prototypes", "Test Case Generator"]}>
            <div className="flex flex-col items-center justify-center h-full text-center p-10">
              <h2 className="text-2xl font-bold mb-2">Refactoring in Progress</h2>
              <p className="text-gray-500 max-w-md">
                The legacy prototype has been archived. Ready for the new monolith drop to begin Trial #1.
              </p>
            </div>
          </Layout>
        } />

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
