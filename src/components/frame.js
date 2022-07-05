import { useEffect, useState } from "react";
import Header from "./header";
import Menu from "./menu";
import Nav from "./nav";
import "./frame.css";

export default function Frame() {
  const [selected, setSelected] = useState("");
  const [mouse, setMouse] = useState(false);
  const [mouseDown, setMouseDown] = useState("");

  const [resetDragData, setResetDragData] = useState(null);

  const [menuDragStart, setMenuDragStart] = useState(null);
  const [menuDragEnd, setMenuDragEnd] = useState(null);

  const [iframeDragStart, setIframeDragStart] = useState(null);
  const [iframeDragEnd, setIframeDragEnd] = useState(null);

  const [iframeWebWindow, setIframeWebWindow] = useState(null);
  const [dragenter, setDragenter] = useState(null);

  useEffect(() => {
    if (iframeWebWindow) {
      const contentWindow = iframeWebWindow.target.contentWindow;
      const { body } = contentWindow.document;

      contentWindow.onmouseover = () => setResetDragData((v) => !v);
      contentWindow.onmouseout = () => setResetDragData((v) => !v);

      contentWindow.onresize = function () {
        const { innerWidth, innerHeight } = contentWindow;
        console.log(innerWidth, innerHeight);
      };

      body.onmousedown = (ev) => {
        ev.target.draggable = true;
      };

      body.ondragenter = setDragenter;
      body.ondragexit = () => setDragenter(null);
      body.ondragover = (ev) => ev.preventDefault();
      body.ondrop = (ev) => ev.preventDefault();

      body.ondragstart = setIframeDragStart;
      body.ondragend = setIframeDragEnd;
    }
  }, [iframeWebWindow]);

  useEffect(() => {
    setMenuDragEnd(null);
    setDragenter(null);
  }, [resetDragData]);

  useEffect(() => {
    if (menuDragStart) {
      setMouseDown("");
      setSelected("");
      setIframeDragStart("");
      setIframeDragEnd("");
    }
  }, [menuDragStart]);

  useEffect(() => {
    if (menuDragEnd && dragenter) {
      dragenter.target.appendChild(menuDragEnd.target.cloneNode(true));
      setDragenter(null);
      setMouseDown("");
      setSelected("");
      setMenuDragEnd(null);
    }
  }, [dragenter, menuDragEnd]);

  useEffect(() => {
    if (iframeDragStart && iframeDragEnd && dragenter) {
      dragenter.target.appendChild(iframeDragStart.target);
      setDragenter(null);
      setIframeDragStart(null);
      setIframeDragEnd(null);
    }
  }, [iframeDragStart, iframeDragEnd, dragenter]);

  return (
    <>
      <Header />
      <div
        className={"desktop"}
        onClick={() => {
          if (!mouse) setSelected("");
        }}
      >
        <div
          className={"menu-nav"}
          onMouseOver={() => {
            setMouse(true);
          }}
          onMouseOut={() => {
            setMouse(false);
          }}
        >
          <Nav navSelected={selected} setSelected={setSelected} />
          <Menu
            navSelected={selected}
            setSelected={setSelected}
            setMouseUp={() => setMouseDown("")}
            mouseDown={mouseDown}
            setMouseDown={setMouseDown}
            setMenuDragStart={setMenuDragStart}
            setMenuDragEnd={setMenuDragEnd}
          />
        </div>
        <div className={"frame"}>
          <iframe
            onLoad={setIframeWebWindow}
            title={"title"}
            src="/iframe.html"
            frameBorder="0"
            width={"100%"}
            height={"100%"}
          />
        </div>
      </div>
    </>
  );
}
