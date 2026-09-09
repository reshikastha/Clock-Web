import React from 'react'
import {
  AlarmClock,
  Clock3,
  Globe2,
  Plus,
  Timer,
} from "lucide-react";
import '../styles/dashboard.css';
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  return (
      <aside className="alarm-sidebar">
        <div className="alarm-logo-section">
          <div className="alarm-logo-clock">
            <span className="alarm-logo-hand" />
            <span className="alarm-logo-dot" />
          </div>

          <div>
            <h2>Clock</h2>
            <p>TIME INSTRUMENT</p>
          </div>
        </div>

        <nav className="alarm-navigation">
          <button onClick={() => navigate("/")}>
            <Globe2 />
            <span>World Clock</span>
          </button>

          <button onClick={() => navigate("/alarms")}>
            <AlarmClock />
            <span>Alarms</span>
  
          </button>

          <button onClick={() => navigate('/stopwatch')}>
            <Timer />
            <span>Stopwatch</span>
          </button>

          <button onClick={() => navigate('/timer')}>
            <Clock3 />
            <span>Timer</span>
          </button>
        </nav>

        <div className="alarm-local-zone">
          <p>LOCAL ZONE</p>
          <span>Australia/Adelaide</span>
        </div>
      </aside>
  )
}

export default Navbar