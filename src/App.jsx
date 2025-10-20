import { Routes, Route, Navigate} from "react-router";
import Splash from "./pages/Splash";
import QuickGuide from "./pages/QuickGuide";
import Profile from "./pages/Profile";
import Browse from "./pages/Browse";

export default function App() {
  return (
    <>
      <main>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="guide" element={<QuickGuide />} />
          <Route path="profile" element={<Profile />} />
          <Route path="browse" element={<Browse />} />
        </Routes>
      </main>
    </>
  );
}