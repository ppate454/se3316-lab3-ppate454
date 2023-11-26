import React, { useState, useEffect } from "react";
import './App.css';

function App() {

  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("api/superPublisher")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>{data}</p>
        <p>Hello</p>
      </header>
    </div>
  );
}

export default App;
