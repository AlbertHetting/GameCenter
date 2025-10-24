import { Routes, Route, Navigate } from "react-router";
import Splash from "./pages/Splash";
import QuickGuide from "./pages/QuickGuide";
import Profile from "./pages/Profile";
import Browse from "./pages/Browse";
import LoginProfileMain from "./pages/LoginProfileMain";
import JoinGame from "./pages/JoinGameCode";
import RequireAuth from "./components/RequireAuth";

export default function App() {
  return (
    <>
      <main>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="guide" element={<QuickGuide />} />
          <Route path="profile" element={<Profile />} />
          <Route path="login" element={<LoginProfileMain />} />
          <Route path="/browse" element={<RequireAuth> <Browse /> </RequireAuth>}/>
          <Route path="/join" element={<RequireAuth> <JoinGame /> </RequireAuth>}/>
        </Routes>
      </main>
    </>
  );
}
