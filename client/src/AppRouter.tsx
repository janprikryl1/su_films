import type { FC } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MovieList } from "./pages/MovieList";
import { Index } from "./pages/Index";

export const AppRouter: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/movie-list" element={<MovieList />} />
        <Route path="/" element={<Index />} />
      </Routes>
    </BrowserRouter>
  );
};
