import React from "react";
import logo from "./voyager-logo.png";
import "./load.css";

function Loading() {
  return (
    <div 
      className="loader-container" 
      style={{ 
        border: "none", 
        borderLeft: "none", 
        borderRight: "none", 
        outline: "none",
        boxShadow: "none",
        backgroundRepeat: "no-repeat" 
      }}
    >
      <div className="logo-reveal">
        <img src={logo} alt="Voyager Logo" />
      </div>

      <p className="loading-text">Designing Your Trip</p>
      <div className="progress-line"></div>
    </div>
  );
}

export default Loading;
