import { useEffect, useState } from "react";
import Header from "./header";
import Menu from "./menu";
import Nav from "./nav";
import "./frame.css";
import {
  DRAGGABLE,
  DROPTYPE,
  MAINID,
  MOVETYPE,
  WIDGET,
} from "../define/consts";

import dataJson from "../json/popup.json";

function getNewTimeString(prefix = "") {
  return `${prefix}${new Date().getTime().toString()}`;
}

function getCloneElementDrag(drag) {
  const dragId = new Date().getTime().toString();
  return `<div id="${dragId}" 
            mainid="${dragId}" 
            movetype="${drag.getAttribute(MOVETYPE)}">
              <div mainid="${dragId}">
                <div mainid="${dragId}">hello ${drag.id}</div>
              </div>
              <p mainid="${dragId}">
                ${drag.innerHTML}
                <style>
                  #dr111 {
                    color: red;
                  }
                </style>
              </p>
            </div>`;
}

const iframeState = getNewTimeString();
const iframeMainElementSelected = getNewTimeString("imes");

const styleOutlineMain = "#f00 2px solid";
const styleOutlineMainDrop = "#00f 1px dashed";

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
  const [contentWindow, setContentWindow] = useState(null);
  const [body, setBody] = useState(null);

  const [dragenter, setDragenter] = useState(null);

  function iframeBodyOnMousedown(mainElement, contentWindow) {
    if (mainElement && mainElement.getAttribute(DRAGGABLE)) {
      mainElement.removeAttribute(DRAGGABLE);
    }
    if (mainElement.id && mainElement.getAttribute(MOVETYPE)) {
      mainElement[DRAGGABLE] = true;
      contentWindow[iframeState].setState(
        iframeMainElementSelected,
        mainElement
      );
    }
  }

  function moving(drop, drag, contentWindow) {
    drop.appendChild(drag);
    if (contentWindow[iframeState]) {
      const mainElement = contentWindow[iframeState][iframeMainElementSelected];
      if (mainElement) {
        mainElement.style.outline = "";
        mainElement.onmouseout = null;
        mainElement.ondragstart = null;
        mainElement.ondragend = null;
        mainElement.onmousedown = null;
        mainElement.onclick = null;
        mainElement.removeAttribute(DRAGGABLE);
      }
    }
    contentWindow.document
      .querySelectorAll(`[${DROPTYPE}]`)
      .forEach((value) => {
        value.style.outline = "";
      });
  }

  function dragging(drop, drag, contentWindow) {
    switch (drag.getAttribute(MOVETYPE)) {
      case WIDGET:
        const newElement = document.createElement("div");
        newElement.innerHTML = getCloneElementDrag(drag);
        drop.appendChild(newElement.firstChild);
        contentWindow.document
          .querySelectorAll(`[${DROPTYPE}]`)
          .forEach((value) => {
            value.style.outline = "";
          });
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    if (iframeWebWindow) {
      const { contentWindow } = iframeWebWindow.target;
      setContentWindow(contentWindow);
      setBody(contentWindow.document.body);
    }
  }, [iframeWebWindow]);

  useEffect(() => {
    if (contentWindow && body) {
      contentWindow[iframeState] = {
        setState: function (key, value, callback) {
          if (this[key] !== value) {
            this[key] = value;
            if (callback) callback();
          }
        },
      };

      contentWindow.onmouseover = () => setResetDragData((v) => !v);
      contentWindow.onmouseout = () => setResetDragData((v) => !v);

      contentWindow.onresize = function () {
        const { innerWidth, innerHeight } = contentWindow;
        console.log(innerWidth, innerHeight);
      };

      body.onmouseover = ({ target }) => {
        const mainId = target.getAttribute(MAINID);
        if (mainId) {
          const mainElement = contentWindow.document.getElementById(mainId);
          mainElement.style.outline = styleOutlineMain;
          if (mainElement.contains(target)) {
            target.onmousedown = () => {
              const dropNameType = mainElement.getAttribute(MOVETYPE);
              if (dropNameType) {
                contentWindow.document
                  .querySelectorAll(`[${DROPTYPE}="${dropNameType}"]`)
                  .forEach((value) => {
                    value.style.outline = styleOutlineMainDrop;
                  });

                mainElement.ondragstart = setIframeDragStart;
                mainElement.ondragend = setIframeDragEnd;
                iframeBodyOnMousedown(mainElement, contentWindow);
              }
            };
            target.onmouseup = () => {
              contentWindow.document
                .querySelectorAll(`[${DROPTYPE}]`)
                .forEach((value) => {
                  value.style.outline = "";
                });

              mainElement.ondragstart = null;
              mainElement.ondragend = null;
              mainElement.removeAttribute(DRAGGABLE);
            };
            target.onclick = () => {
              console.log(mainId);
            };
            mainElement.onmouseout = () => {
              mainElement.style.outline = "";
              mainElement.onmouseout = null;
              target.onmousedown = null;
              target.onmouseup = null;
              target.onclick = null;
            };
          }
        }
      };
      body.ondragenter = setDragenter;
      body.ondragexit = () => setDragenter(null);
      body.ondragover = (ev) => ev.preventDefault();
      body.ondrop = (ev) => ev.preventDefault();
    }
  }, [body, contentWindow]);

  useEffect(() => {
    setMenuDragEnd(null);
    setDragenter(null);
  }, [resetDragData]);

  useEffect(() => {
    if (menuDragStart && contentWindow) {
      setMouseDown("");
      setSelected("");
      setIframeDragStart("");
      setIframeDragEnd("");

      const dropNameType = menuDragStart.target.getAttribute(MOVETYPE);
      if (dropNameType) {
        contentWindow.document
          .querySelectorAll(`[${DROPTYPE}="${dropNameType}"]`)
          .forEach((value) => {
            value.style.outline = styleOutlineMainDrop;
          });
      }
    }
  }, [contentWindow, menuDragStart]);

  useEffect(() => {
    if (menuDragEnd && dragenter && contentWindow) {
      const { target } = dragenter;
      const { target: targetDrag } = menuDragEnd;
      if (targetDrag.getAttribute(MOVETYPE) === target.getAttribute(DROPTYPE)) {
        dragging(target, targetDrag, contentWindow);
      } else {
        contentWindow.document
          .querySelectorAll(
            `[${DROPTYPE}="${targetDrag.getAttribute(MOVETYPE)}"]`
          )
          .forEach((value) => {
            if (value.contains(target)) {
              dragging(value, targetDrag, contentWindow);
            }
          });
      }

      setDragenter(null);
      setMouseDown("");
      setSelected("");
      setMenuDragEnd(null);
    }
  }, [contentWindow, dragenter, menuDragEnd]);

  useEffect(() => {
    if (iframeDragEnd && iframeDragStart && dragenter && contentWindow) {
      const { target } = dragenter;
      const { target: targetDrag } = iframeDragStart;
      if (targetDrag !== target) {
        if (
          targetDrag.getAttribute(MOVETYPE) === target.getAttribute(DROPTYPE)
        ) {
          moving(target, targetDrag, contentWindow);
        } else {
          contentWindow.document
            .querySelectorAll(
              `[${DROPTYPE}="${targetDrag.getAttribute(MOVETYPE)}"]`
            )
            .forEach((value) => {
              if (value.contains(target)) {
                moving(value, targetDrag, contentWindow);
              }
            });
        }
      }
      setDragenter(null);
      setIframeDragStart(null);
      setIframeDragEnd(null);
    }
  }, [iframeDragStart, iframeDragEnd, dragenter, contentWindow]);

  // BODY load data
  const newElement123 = document.createElement("div");
  const newElement = document.createElement("div");
  newElement123.innerHTML = dataJson.teaser;
  newElement.appendChild(newElement123.firstChild);
  newElement123.innerHTML = dataJson.popup;
  newElement.appendChild(newElement123.firstChild);
  // BODY load data

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
            // src="/iframe.html"
            srcDoc={newElement.innerHTML}
            frameBorder="0"
            width={"100%"}
            height={"100%"}
          />
        </div>
      </div>
    </>
  );
}
