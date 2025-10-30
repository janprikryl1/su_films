import type { FC } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MovieList } from "./pages/MovieList";
import { Index } from "./pages/Index";
import {Navbar} from "@/components/Navbar.tsx";
import {AI} from "@/pages/AI.tsx";

export const AppRouter: FC = () => {
  return (
    <BrowserRouter>
        <Navbar/>
        <Routes>
            <Route path="/movie-list" element={<MovieList />} />
            <Route path="/ai" element={<AI />} />
            <Route path="/" element={<Index />} />
        </Routes>
    </BrowserRouter>
  );
};
