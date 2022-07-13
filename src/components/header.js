import React from "react";
import "./header.css";

export default function Header({ exportSettings, loadDefaultSettings }) {
  return (
    <div className={"header"}>
      <button onClick={exportSettings}>export</button>
      <button onClick={loadDefaultSettings}>load default</button>
    </div>
  );
}
