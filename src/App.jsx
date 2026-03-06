import React from 'react';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import './App.css';
import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import Predict from './components/Predict.jsx';
import Home from './pages/Home.jsx';
import About from './components/About.jsx';
import ArticlesPage from './components/ArticlesPage.jsx';
import GoodThoughts from './pages/GoodThoughts.jsx';
import PredictImage from './components/PredictImage.jsx';

function App() {
  return (
    <BrowserRouter>
      <div className="h-screen">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/predict-image" element={<PredictImage />} />
          <Route path="/about" element={<About />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/thoughts" element={<GoodThoughts />} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;