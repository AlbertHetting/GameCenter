import { Routes, Route, Navigate } from "react-router";
import Splash from "./pages/Splash";
import QuickGuide from "./pages/QuickGuide";
import Profile from "./pages/Profile";
import Browse from "./pages/Browse";
import LoginProfileMain from "./pages/LoginProfileMain";
import JoinGame from "./pages/JoinGameCode";
import Lobby from "./pages/Lobby";
import RequireAuth from "./components/RequireAuth";
import Wait from "./pages/Waitscreen";
import Guessing from "./pages/Guessing";
import Performer1 from "./pages/Performer1";
import Performer2 from "./pages/Performer2";
import RoundWinner from "./pages/RoundWinner";
import GameEnd from "./pages/Gameend";

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
          <Route path="/room/:code" element={<RequireAuth><Lobby /></RequireAuth>} />
          <Route path="/room/:code/standby" element={<RequireAuth><Wait /></RequireAuth>} />
          <Route path="/room/:code/performer1" element={<RequireAuth><Performer1 /></RequireAuth>} />
          <Route path="/room/:code/performer2" element={<RequireAuth><Performer2 /></RequireAuth>} />
          <Route path="/room/:code/guessing" element={<RequireAuth><Guessing /></RequireAuth>} />
          <Route path="/room/:code/round-winner" element={<RequireAuth><RoundWinner /></RequireAuth>} />
          <Route path="/room/:code/gameend" element={<RequireAuth><GameEnd /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/browse" replace />} />

        </Routes>
      </main>
    </>
  );
}
