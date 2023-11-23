import React, { useState, useEffect } from "react";
import './App.css';

const u = "http://localhost:8000"

function App() {

  const [message, setMessage] = useState("")
  useEffect(() => {
    fetch(u + "/api/superPublisher")
      .then((res) => res.json())
      .then((data) => setMessage(data.json))
  })

  return (
    <div className="App">
      <p>{message}</p>
    </div>
  );
}

export default App;
