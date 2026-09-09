import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import './App.css'
import Dashboard from "./pages/dashboard";
import Alarms from "./pages/alarms";
import Stopwatch from "./pages/stopwatch";
import TimerPage from "./pages/timepage";

function App() {


  return (
    
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/alarms" element={<Alarms />} />
         <Route path="/stopwatch" element={<Stopwatch />} />
        <Route path="/timer" element={<TimerPage />} />
      
      </Routes>
  )
}

export default App
