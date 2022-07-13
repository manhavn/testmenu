import React from "react";
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
  TEMPLATE,
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
  lastChild,
} from "../define/functions";

const styleOutlineMain = "#f00 2px solid";
const styleOutlineMainDrop = "#00f 1px dashed";

const navList = [
  { name: "Teaser", value: TEASER_LAYOUT },
  { name: "Popup", value: POPUP_LAYOUT },
  { name: "Widget", value: POPUP_WIDGET },
  { name: "Templs", value: TEMPLATE },
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

  const [dataJson, setDataJson] = useState(null);
  const [teaserLayout, setTeaserLayout] = useState(null);
  const [popupLayout, setPopupLayout] = useState(null);
  const [popupWidget, setPopupWidget] = useState(null);
  const [template, setTemplate] = useState(null);

  const [dragId, setDragId] = useState("");

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

      body.onmouseover = ({ target, layerX, layerY }) => {
        const mainId = target.getAttribute(MAINID);
        const documentIframe = contentWindow.document;

        if (mainId) {
          const mainElement = documentIframe.getElementById(mainId);
          if (mainElement) {
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
        case TEMPLATE:
          console.log(TEMPLATE);
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
      setResetDragData((v) => !v);

      const { target } = menuDragStart;
      const dropNameType = target.getAttribute(DRAGTYPE);
      if (dropNameType) {
        let url;
        const hostApi = "http://localhost:9999";

        const documentIframe = contentWindow.document;
        let elementBackground;
        switch (dropNameType) {
          case TEASER_LAYOUT:
            url = `${hostApi}/teaser_layouts/${target.id}.json`;

            elementBackground = documentIframe.querySelector(
              `[${MAIN_TYPE}="${TEASER_BACKGROUND}"]`
            );
            elementBackground.style.position = "fixed";
            elementBackground.style.width = "100%";
            elementBackground.style.height = "100%";
            elementBackground.style.backgroundColor = "rgba(0,255,166,0.24)";
            break;
          case POPUP_LAYOUT:
            url = `${hostApi}/popup_layouts/${target.id}.json`;

            elementBackground = documentIframe.querySelector(
              `[${MAIN_TYPE}="${POPUP_BACKGROUND}"]`
            );
            elementBackground.style.backgroundColor = "rgba(0,255,0,0.24)";
            break;
          case POPUP_WIDGET:
            url = `${hostApi}/popup_widgets/${target.id}.json`;

            documentIframe
              .querySelectorAll(`[${DROPTYPE}="${dropNameType}"]`)
              .forEach((value) => {
                value.style.outline = styleOutlineMainDrop;
                value.style.zIndex = 999;
              });
            break;
          case TEMPLATE:
            url = `${hostApi}/templates/${target.id}.json`;

            console.log("menuDragStart: ", TEMPLATE);
            break;
          default:
            break;
        }
        fetch(url)
          .then((res) => {
            return res.json();
          })
          .then((data) => {
            switch (dropNameType) {
              case TEASER_LAYOUT:
                setTeaserLayout(data);
                break;
              case POPUP_LAYOUT:
                setPopupLayout(data);
                break;
              case POPUP_WIDGET:
                setPopupWidget(data);
                break;
              case TEMPLATE:
                setTemplate(data);
                break;
              default:
                break;
            }
            setDragId(target.id);
          });
      }
    }
  }, [contentWindow, menuDragStart]);

  useEffect(() => {
    if (dragId && menuDragEnd && dragenter && contentWindow && dataJson) {
      setDragId("");
      const { target } = dragenter;
      const { target: targetDrag } = menuDragEnd;
      if (targetDrag.getAttribute(DRAGTYPE) === target.getAttribute(DROPTYPE)) {
        dragging(target, targetDrag, contentWindow, {
          dataJson,
          teaserLayout,
          popupLayout,
          popupWidget,
          template,
        });
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
                dragging(
                  dropChild,
                  targetDrag,
                  contentWindow,
                  {
                    dataJson,
                    teaserLayout,
                    popupLayout,
                    popupWidget,
                    template,
                  },
                  moveName
                );
              } else {
                dragging(value, targetDrag, contentWindow, {
                  dataJson,
                  teaserLayout,
                  popupLayout,
                  popupWidget,
                  template,
                });
              }
            }
          });
      }
      setDragenter(null);
      setMouseDown("");
      setSelected("");
      setMenuDragEnd(null);
    }
  }, [
    contentWindow,
    dataJson,
    dragElementOverY,
    dragId,
    dragenter,
    menuDragEnd,
    popupLayout,
    popupWidget,
    teaserLayout,
    template,
  ]);

  useEffect(() => {
    if (iframeDragEnd && iframeDragStart && dragenter && contentWindow) {
      const { target } = dragenter;
      const { target: targetDrag } = iframeDragStart;
      let moveName = lastChild;
      if (targetDrag !== target) {
        if (
          targetDrag.getAttribute(DRAGTYPE) === target.getAttribute(DROPTYPE)
        ) {
          moving(target, targetDrag, contentWindow, dataJson, moveName);
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
                  moving(
                    dropChild,
                    targetDrag,
                    contentWindow,
                    dataJson,
                    moveName
                  );
                } else {
                  moving(value, targetDrag, contentWindow, dataJson, moveName);
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
    dataJson,
    dragElementOverY,
    dragenter,
    iframeDragEnd,
    iframeDragStart,
  ]);

  useEffect(() => {
    if (dragenter && contentWindow && iframeDragStart) {
      let setOver;
      setDragElementOverY(true);

      const dragElementOver = contentWindow.document.querySelectorAll(
        `[${DRAGTYPE}="${iframeDragStart.target.getAttribute(DRAGTYPE)}"]`
      );
      const { target } = dragenter;
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
  }, [contentWindow, dragenter, iframeDragStart]);

  useEffect(() => {
    if (dragElementOver && dragover) {
      setAfterBeforeAppend(dragElementOver, dragover, { setDragElementOverY });
    }
  }, [dragElementOver, dragover]);

  useEffect(() => {
    if (dataJson) {
      const headElement = document.createElement("head");
      addStringDataToHtml(
        `<style>body{background: white}</style>`,
        headElement
      );

      const bodyElement = document.createElement("body");

      const { teaserScreenBackground, popupScreenBackground, childElements } =
        dataJson;
      if (teaserScreenBackground) {
        const { childElementIds } = teaserScreenBackground;
        const teaserBackground = jsonElementToHtml(teaserScreenBackground);
        bodyElement.appendChild(teaserBackground);

        if (childElementIds.length > 0) {
          teaserBackground.removeAttribute(DROPTYPE);
          childElementIds.forEach((value) => {
            jsonAppendDataHtmlByID({
              originData: dataJson,
              originName: value,
              newChildData: dataJson,
              newChildElement: childElements[value],

              parentElement: teaserBackground,
              addNewElement: false,
            });
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
          childElementIds.forEach((value) => {
            jsonAppendDataHtmlByID({
              originData: dataJson,
              originName: value,
              newChildData: dataJson,
              newChildElement: childElements[value],

              parentElement: popupBackground,
              addNewElement: false,
            });
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
    }
  }, [dataJson]);

  useEffect(() => {
    fetch("http://localhost:9999/popup-shop-custom.json")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setDataJson(data);
      })
      .catch();
  }, []);

  function exportSettings() {
    console.log(JSON.stringify(dataJson));
  }

  function loadDefaultSettings() {
    setDataJson(null);
    setSrcDoc(null);
    fetch("http://localhost:9999/default-data.json")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setDataJson(data);
      })
      .catch();
  }

  return (
    <>
      <Header
        exportSettings={exportSettings}
        loadDefaultSettings={loadDefaultSettings}
      />
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
