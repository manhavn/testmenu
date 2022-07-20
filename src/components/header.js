import React from "react";
import "./header.css";

export default function Header({
  exportSettings,
  loadDefaultSettings,
  undo,
  redo,
}) {
  return (
    <div className={"header"}>
      <button onClick={undo}>undo</button>
      <button onClick={redo}>redo</button>
      <button onClick={exportSettings}>export</button>
      <button onClick={loadDefaultSettings}>load default</button>
    </div>
  );
}
