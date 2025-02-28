import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import BookDetails from './BookDetails';
import SavedBooks from './SavedBooks';
import Navbar from './components/Navbar';
import AuthPage from './AuthPage';

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/books/details/:id" element={<BookDetails />} />
        <Route path="/saved-books" element={<SavedBooks />} />
      </Routes>
    </>
  );
};

export default App;