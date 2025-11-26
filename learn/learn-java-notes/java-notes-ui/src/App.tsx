import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotesList from "./pages/NotesList";
import NoteDetails from "./pages/NoteDetails";
import CreateNote from "./pages/CreateNote";
import EditNote from "./pages/EditNote";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NotesList />} />
        <Route path="/note/:id" element={<NoteDetails />} />
        <Route path="/create" element={<CreateNote />} />
        <Route path="/edit/:id" element={<EditNote />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
