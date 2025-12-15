import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DrawingStudio from "./pages/DrawingStudio";
import StoryMode from "./pages/StoryMode";
import PuzzleAdventures from "./pages/PuzzleAdventures";
import MusicBlocks from "./pages/MusicBlocks";
import PhotoAlbumEnhanced from "./pages/PhotoAlbum/PhotoAlbumEnhanced";
import Layout from "./components/Layout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="drawing" element={<DrawingStudio />} />
        <Route path="story" element={<StoryMode />} />
        <Route path="puzzle" element={<PuzzleAdventures />} />
        <Route path="music" element={<MusicBlocks />} />
        <Route path="photo-album" element={<PhotoAlbumEnhanced />} />
      </Route>
    </Routes>
  );
}

export default App;
