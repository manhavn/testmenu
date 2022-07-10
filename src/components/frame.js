import { useEffect, useState } from "react";
import Header from "./header";
import Menu from "./menu";
import Nav from "./nav";
import "./frame.css";
import {
  DRAGGABLE,
  DROPTYPE,
  MAINID,
  DRAGTYPE,
  POPUP_LAYOUT,
  TEASER_LAYOUT,
  POPUP_WIDGET,
  MAIN_TYPE,
  TEASER_BACKGROUND,
  POPUP_BACKGROUND,
  TEMPLATES,
  MOVETYPE,
} from "../define/consts";

import {
  addStringDataToHtml,
  after,
  before,
  dragging,
  iframeBodyOnMousedown,
  iframeState,
  jsonAppendDataHtmlByID,
  jsonElementToHtml,
  moving,
  setAfterBeforeAppend,
  emptyString,
} from "../define/functions";

import dataJson from "../json/popup-shop-custom.json";

const styleOutlineMain = "#f00 2px solid";
const styleOutlineMainDrop = "#00f 1px dashed";

const navList = [
  { name: "Teaser", value: TEASER_LAYOUT },
  { name: "Popup", value: POPUP_LAYOUT },
  { name: "Widget", value: POPUP_WIDGET },
  { name: "Templs", value: TEMPLATES },
];

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
  const [dragover, setDragover] = useState(null);
  const [dragElementOver, setDragElementOver] = useState(null);

  const [dragElementOverY, setDragElementOverY] = useState(null);

  const [srcDoc, setSrcDoc] = useState(null);

  const [moveFixedData, setMoveFixedData] = useState(null);

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

      contentWindow.onmousedown = () => {
        contentWindow.document
          .querySelectorAll(`[${MAIN_TYPE}]`)
          .forEach((value) => {
            const { display } = value.style;
            value.style = {};
            value.style.display = display;
          });
        setSelected("");
      };

      contentWindow.onmouseover = () => setResetDragData((v) => !v);
      contentWindow.onmouseout = () => setResetDragData((v) => !v);

      contentWindow.onresize = function () {
        const { innerWidth, innerHeight } = contentWindow;
        console.log(innerWidth, innerHeight);
      };

      body.onmouseover = ({ target, layerX, layerY }) => {
        const mainId = target.getAttribute(MAINID);
        const documentIframe = contentWindow.document;

        if (mainId) {
          const mainElement = documentIframe.getElementById(mainId);
          mainElement.style.outline = styleOutlineMain;
          if (mainElement.contains(target)) {
            target.onmousedown = () => {
              const dropNameType = mainElement.getAttribute(DRAGTYPE);
              if (dropNameType) {
                documentIframe
                  .querySelectorAll(`[${DROPTYPE}="${dropNameType}"]`)
                  .forEach((value) => {
                    value.style.outline = styleOutlineMainDrop;
                    value.style.zIndex = 999;
                  });

                mainElement.ondragstart = setIframeDragStart;
                mainElement.ondragend = setIframeDragEnd;
                iframeBodyOnMousedown(mainElement, contentWindow);
              }
              const moveNameType = mainElement.getAttribute(MOVETYPE);
              switch (moveNameType) {
                case TEASER_LAYOUT:
                  const { style, offsetWidth, offsetHeight, onclick } =
                    mainElement;
                  setMoveFixedData({
                    style,
                    offsetWidth,
                    offsetHeight,
                    layerX,
                    layerY,
                    mainElement,
                    onclick,
                  });
                  break;
                default:
                  break;
              }
            };
            target.onmouseup = () => {
              documentIframe
                .querySelectorAll(`[${DROPTYPE}]`)
                .forEach((value) => {
                  value.style.outline = "";
                  value.style.zIndex = "";
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
      body.ondragover = (ev) => {
        ev.preventDefault();
        setDragover(ev);
      };
      body.ondrop = (ev) => ev.preventDefault();
    }
  }, [body, contentWindow]);

  useEffect(() => {
    if (body && contentWindow && moveFixedData) {
      const { style, offsetWidth, offsetHeight, layerX, layerY } =
        moveFixedData;
      contentWindow.onmouseup = () => {
        contentWindow.onmouseup = null;
        contentWindow.onmousemove = null;
        body.onselectstart = null;
        setMoveFixedData(null);
      };
      contentWindow.onmouseout = ({ target }) => {
        target.style.cursor = "";
      };
      contentWindow.onmousemove = ({ pageX, pageY, target }) => {
        target.style.cursor = "default";
        body.onselectstart = () => false;
        const { innerWidth, innerHeight, scrollX, scrollY } = contentWindow;

        const positionMouseX = pageX - scrollX;
        const positionMouseY = pageY - scrollY;
        const positionMouseRightX = innerWidth + scrollX - pageX;
        const positionMouseRightY = innerHeight + scrollY - pageY;

        const layerRightX = offsetWidth - layerX;
        const layerRightY = offsetHeight - layerY;

        function getNewPercentValue(p, l, i) {
          let o = p - l;
          if (o < 0) {
            o = 0;
          } else {
            o = (100 * o) / i;
          }
          return o;
        }

        const elLeft = getNewPercentValue(positionMouseX, layerX, innerWidth);
        const elTop = getNewPercentValue(positionMouseY, layerY, innerHeight);
        const elRight = getNewPercentValue(
          positionMouseRightX,
          layerRightX,
          innerWidth
        );
        const elBottom = getNewPercentValue(
          positionMouseRightY,
          layerRightY,
          innerHeight
        );

        function getNewPosition({ elLeft, elTop, elRight, elBottom }) {
          let positionFixed = {};
          const left = `${elLeft}%`;
          const top = `${elTop}%`;
          const right = `${elRight}%`;
          const bottom = `${elBottom}%`;
          switch (true) {
            case elLeft < elRight && elTop < elBottom:
              positionFixed = { left, top };
              break;
            case elLeft > elRight && elTop < elBottom:
              positionFixed = { right, top };
              break;
            case elLeft < elRight && elTop > elBottom:
              positionFixed = { left, bottom };
              break;
            case elLeft > elRight && elTop > elBottom:
              positionFixed = { right, bottom };
              break;
            default:
              break;
          }
          return positionFixed;
        }

        const { left, top, right, bottom } = getNewPosition({
          elLeft,
          elTop,
          elRight,
          elBottom,
        });
        style.left = left || emptyString;
        style.top = top || emptyString;
        style.right = right || emptyString;
        style.bottom = bottom || emptyString;
      };
    }
  }, [body, contentWindow, moveFixedData]);

  useEffect(() => {
    setMenuDragEnd(null);
    setDragenter(null);
  }, [resetDragData]);

  useEffect(() => {
    if (contentWindow && selected) {
      const documentIframe = contentWindow.document;

      switch (selected) {
        case TEASER_LAYOUT:
          documentIframe.querySelector(
            `[${MAIN_TYPE}="${POPUP_BACKGROUND}"]`
          ).style.display = "none";
          documentIframe.querySelector(
            `[${MAIN_TYPE}="${TEASER_BACKGROUND}"]`
          ).style = {};
          break;
        case POPUP_LAYOUT:
        case POPUP_WIDGET:
          documentIframe.querySelector(
            `[${MAIN_TYPE}="${TEASER_BACKGROUND}"]`
          ).style.display = "none";
          documentIframe.querySelector(
            `[${MAIN_TYPE}="${POPUP_BACKGROUND}"]`
          ).style = {};
          break;
        default:
          break;
      }
    }
  }, [contentWindow, selected]);

  useEffect(() => {
    if (menuDragStart && contentWindow) {
      setMouseDown("");
      setSelected("");
      setIframeDragStart("");
      setIframeDragEnd("");

      const dropNameType = menuDragStart.target.getAttribute(DRAGTYPE);
      if (dropNameType) {
        const documentIframe = contentWindow.document;
        let elementBackground;
        switch (dropNameType) {
          case TEASER_LAYOUT:
            elementBackground = documentIframe.querySelector(
              `[${MAIN_TYPE}="${TEASER_BACKGROUND}"]`
            );
            elementBackground.style.position = "fixed";
            elementBackground.style.width = "100%";
            elementBackground.style.height = "100%";
            elementBackground.style.backgroundColor = "rgba(0,255,166,0.24)";
            break;
          case POPUP_LAYOUT:
            elementBackground = documentIframe.querySelector(
              `[${MAIN_TYPE}="${POPUP_BACKGROUND}"]`
            );
            elementBackground.style.backgroundColor = "rgba(0,255,0,0.24)";
            break;
          default:
            documentIframe
              .querySelectorAll(`[${DROPTYPE}="${dropNameType}"]`)
              .forEach((value) => {
                value.style.outline = styleOutlineMainDrop;
                value.style.zIndex = 999;
              });
            break;
        }
      }
    }
  }, [contentWindow, menuDragStart]);

  useEffect(() => {
    if (menuDragEnd && dragenter && contentWindow) {
      const { target } = dragenter;
      const { target: targetDrag } = menuDragEnd;
      if (targetDrag.getAttribute(DRAGTYPE) === target.getAttribute(DROPTYPE)) {
        dragging(target, targetDrag, contentWindow);
      } else {
        contentWindow.document
          .querySelectorAll(
            `[${DROPTYPE}="${targetDrag.getAttribute(DRAGTYPE)}"]`
          )
          .forEach((value) => {
            if (value.contains(target)) {
              let dropChild;
              for (let i = 0; i < value.childNodes.length; i++) {
                const childNode = value.childNodes[i];
                if (childNode.contains(target)) {
                  dropChild = childNode;
                  break;
                }
              }
              if (dropChild) {
                const moveName = dragElementOverY ? after : before;
                dragging(dropChild, targetDrag, contentWindow, moveName);
              } else {
                dragging(value, targetDrag, contentWindow);
              }
            }
          });
      }

      setDragenter(null);
      setMouseDown("");
      setSelected("");
      setMenuDragEnd(null);
    }
  }, [contentWindow, dragElementOverY, dragenter, menuDragEnd]);

  useEffect(() => {
    if (iframeDragEnd && iframeDragStart && dragenter && contentWindow) {
      const { target } = dragenter;
      const { target: targetDrag } = iframeDragStart;
      if (targetDrag !== target) {
        if (
          targetDrag.getAttribute(DRAGTYPE) === target.getAttribute(DROPTYPE)
        ) {
          moving(target, targetDrag, contentWindow);
        } else {
          contentWindow.document
            .querySelectorAll(
              `[${DROPTYPE}="${targetDrag.getAttribute(DRAGTYPE)}"]`
            )
            .forEach((value) => {
              if (value.contains(target)) {
                let dropChild;
                for (let i = 0; i < value.childNodes.length; i++) {
                  const childNode = value.childNodes[i];
                  if (childNode.contains(target)) {
                    dropChild = childNode;
                    break;
                  }
                }
                if (dropChild) {
                  let moveName;
                  switch (true) {
                    case targetDrag.nextSibling === dropChild:
                      moveName = after;
                      break;
                    case dropChild.nextSibling === targetDrag:
                      moveName = before;
                      break;
                    default:
                      moveName = dragElementOverY ? after : before;
                      break;
                  }
                  moving(dropChild, targetDrag, contentWindow, moveName);
                } else {
                  moving(value, targetDrag, contentWindow);
                }
              }
            });
        }
      }
      setDragenter(null);
      setIframeDragStart(null);
      setIframeDragEnd(null);
    }
  }, [
    contentWindow,
    dragElementOverY,
    dragenter,
    iframeDragEnd,
    iframeDragStart,
  ]);

  useEffect(() => {
    if (dragenter && contentWindow) {
      let setOver;
      setDragElementOverY(true);

      const { target } = dragenter;
      const dragElementOver = contentWindow.document.querySelectorAll(
        `[${DRAGTYPE}="${target.getAttribute(DRAGTYPE)}"]`
      );
      for (let i = 0; i < dragElementOver.length; i++) {
        const value = dragElementOver[i];
        if (value.contains(target)) {
          setOver = true;
          setDragElementOver(value);
          return;
        }
      }
      if (!setOver) setDragElementOver(null);
    }
  }, [contentWindow, dragenter]);

  useEffect(() => {
    if (dragElementOver && dragover) {
      setAfterBeforeAppend(dragElementOver, dragover, { setDragElementOverY });
    }
  }, [dragElementOver, dragover]);

  useEffect(() => {
    const headElement = document.createElement("head");
    addStringDataToHtml(`<style>body{background: white}</style>`, headElement);

    const bodyElement = document.createElement("body");

    const { teaserScreenBackground, popupScreenBackground, childElements } =
      dataJson;
    if (teaserScreenBackground) {
      const { childElementIds } = teaserScreenBackground;
      const teaserBackground = jsonElementToHtml(teaserScreenBackground);
      bodyElement.appendChild(teaserBackground);

      if (childElementIds.length > 0) {
        teaserBackground.removeAttribute(DROPTYPE);
        jsonAppendDataHtmlByID({
          childElementIds,
          parentElement: teaserBackground,
          childElements,
        });
      } else {
        teaserBackground.setAttribute(DROPTYPE, TEASER_LAYOUT);
      }
    }
    if (popupScreenBackground) {
      const { childElementIds } = popupScreenBackground;
      const popupBackground = jsonElementToHtml(popupScreenBackground);
      bodyElement.appendChild(popupBackground);

      if (childElementIds.length > 0) {
        popupBackground.removeAttribute(DROPTYPE);
        jsonAppendDataHtmlByID({
          childElementIds,
          parentElement: popupBackground,
          childElements,
        });
      } else {
        popupBackground.setAttribute(DROPTYPE, POPUP_LAYOUT);
      }
    }

    const srcDocData = document.createElement("div");
    srcDocData.appendChild(headElement);
    srcDocData.appendChild(bodyElement);

    setSrcDoc(srcDocData.innerHTML);
    srcDocData.remove();
  }, []);

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
          <Nav
            navSelected={selected}
            setSelected={setSelected}
            navList={navList}
          />
          <Menu
            navSelected={selected}
            setSelected={setSelected}
            setMouseUp={() => setMouseDown("")}
            mouseDown={mouseDown}
            setMouseDown={setMouseDown}
            setMenuDragStart={setMenuDragStart}
            setMenuDragEnd={setMenuDragEnd}
            navList={navList}
          />
        </div>
        <div className={"frame"}>
          <iframe
            onLoad={setIframeWebWindow}
            title={"title"}
            srcDoc={srcDoc || null}
            frameBorder="0"
            width={"100%"}
            height={"100%"}
          />
        </div>
      </div>
    </>
  );
}
