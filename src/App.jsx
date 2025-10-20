import { Routes, Route, Navigate } from "react-router";
import Nav from "./components/Nav";
import Splash from "./pages/Splash";

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Splash />} />
        </Routes>
      </main>
    </>
  );
}
