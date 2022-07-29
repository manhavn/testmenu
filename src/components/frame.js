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
  CLOSE_BUTTON,
  MENUDRAGTYPE,
  WIDGETTYPE,
} from "../define/consts";

import {
  addStringDataToHtml,
  after,
  before,
  dragging,
  iframeBodyOnMousedown,
  iframeState,
  jsonElementToHtml,
  moving,
  setAfterBeforeAppend,
  lastChild,
  movePositionElement,
  emptyString,
  dataActions,
  currentActionKey,
  snapShot,
  listActionKey,
  noneString,
  jsonLoadDataHtml,
} from "../define/functions";
import state from "../define/state";

const styleOutlineMain = "#000 1px solid";
const styleOutlineMainDrop = "#000 1px dashed";

const navList = [
  { name: "Teaser", value: TEASER_LAYOUT, type: TEASER_LAYOUT },
  { name: "Popup", value: POPUP_LAYOUT, type: POPUP_LAYOUT },
  { name: "Widget", value: POPUP_WIDGET, type: POPUP_WIDGET },
  { name: "close", value: CLOSE_BUTTON, type: POPUP_WIDGET },
  { name: "Templs", value: TEMPLATE, type: TEMPLATE },
];

export default function Frame() {
  const [selected, setSelected] = useState(emptyString);
  const [mouse, setMouse] = useState(false);
  const [mouseDown, setMouseDown] = useState(emptyString);

  const [resetDragData, setResetDragData] = useState(null);

  const [menuDragStart, setMenuDragStart] = useState(null);
  const [menuDragEnd, setMenuDragEnd] = useState(null);

  const [beginMove, setBeginMove] = useState(null);
  const [iframeDragStart, setIframeDragStart] = useState(null);
  const [iframeDragEnd, setIframeDragEnd] = useState(null);
  const [iframeDrop, setIframeDrop] = useState(null);

  const [iframeWebWindow, setIframeWebWindow] = useState(null);
  const [contentWindow, setContentWindow] = useState(null);
  const [documentIframe, setDocumentIframe] = useState(null);
  const [body, setBody] = useState(null);

  const [dragenter, setDragenter] = useState(null);
  const [dragover, setDragover] = useState(null);

  const [dragElementOver, setDragElementOver] = useState(null);
  const [dragElementOverY, setDragElementOverY] = useState(null);

  const [srcDoc, setSrcDoc] = useState(null);

  const [moveFixedAbsoluteData, setMoveFixedAbsoluteData] = useState(null);

  const [dataJson, setDataJson] = useState(null);
  const [teaserLayout, setTeaserLayout] = useState(null);
  const [popupLayout, setPopupLayout] = useState(null);
  const [popupWidget, setPopupWidget] = useState(null);
  const [template, setTemplate] = useState(null);

  const [dragId, setDragId] = useState(emptyString);

  const [screenType, setScreenType] = useState(null);
  const [editorId, setEditorId] = useState(null);
  const [contentChanged, setContentChanged] = useState(null);
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    if (selected) setScreenType(selected);
  }, [selected]);

  useEffect(() => {
    if (
      editor &&
      documentIframe &&
      dataJson &&
      editorId &&
      contentChanged === "blur"
    ) {
      setContentChanged("");
      const newDoc = document.createElement("div");
      newDoc.innerHTML = editor.html.get();
      documentIframe.getElementById(editorId).innerHTML =
        newDoc.firstChild.innerHTML;
      if (dataJson.childElements[editorId]) {
        dataJson.childElements[editorId].childElementIds.forEach((value) => {
          dataJson.childElements[value].value = newDoc.firstChild.innerHTML;
        });
      }
      editor.destroy();
      newDoc.remove();
      snapShot(dataJson);
    }
  }, [editor, contentChanged, editorId, documentIframe, dataJson]);

  useEffect(() => {
    if (iframeWebWindow) {
      const { contentWindow } = iframeWebWindow.target;
      setContentWindow(contentWindow);
      setDocumentIframe(contentWindow.document);
      setBody(contentWindow.document.body);

      contentWindow.contentChanged = function (ev) {
        setContentChanged(ev);
      };
      contentWindow.editFunc111 = function (editor) {
        setEditor(editor);
      };
    }
  }, [iframeWebWindow]);

  useEffect(() => {
    if (contentWindow && body && dataJson) {
      contentWindow[iframeState] = state;

      contentWindow.onmousedown = () => {
        contentWindow.document
          .querySelectorAll(`[${MAIN_TYPE}]`)
          .forEach((value) => {
            const { display } = value.style;
            value.style = {};
            value.style.display = display;
          });
        setSelected(emptyString);
      };

      body.onmouseover = ({ target }) => {
        let mainId = target.getAttribute(MAINID);
        const documentIframe = contentWindow.document;
        let checkContain = target;
        if (target.farthestViewportElement) {
          checkContain = target.farthestViewportElement.parentElement;
          mainId = checkContain.getAttribute(MAINID);
        }

        if (mainId) {
          const mainElement = documentIframe.getElementById(mainId);
          const checkContainId = checkContain.id;
          if (mainElement && checkContainId) {
            mainElement.style.outline = styleOutlineMain;
            const mainData = dataJson.childElements[mainId];
            const moveData = dataJson.childElements[checkContainId];
            if (
              mainData &&
              moveData &&
              mainElement.contains(checkContain) &&
              mainData.originName === mainId &&
              moveData.mainId === mainId &&
              moveData.originName === checkContainId
            ) {
              target.onmousedown = ({ layerX, layerY }) => {
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
                const widgetType = mainElement.getAttribute(WIDGETTYPE);
                const moveNameType = mainElement.getAttribute(MOVETYPE);
                const { style, offsetWidth, offsetHeight, onclick } =
                  mainElement;
                setMoveFixedAbsoluteData({
                  mainId,
                  style,
                  offsetWidth,
                  offsetHeight,
                  layerX,
                  layerY,
                  mainElement,
                  onclick,
                  moveNameType,
                  widgetType,
                });
              };
              target.onmouseup = () => {
                documentIframe
                  .querySelectorAll(`[${DROPTYPE}]`)
                  .forEach((value) => {
                    value.style.outline = emptyString;
                    value.style.zIndex = emptyString;
                  });

                mainElement.ondragstart = null;
                mainElement.ondragend = null;
                mainElement.removeAttribute(DRAGGABLE);
              };
              target.onclick = (ev) => {
                console.log(mainId);
                if (dataJson.childElements[ev.target.id]) {
                  dataJson.childElements[ev.target.id].childElementIds.forEach(
                    (value) => {
                      if (dataJson.childElements[value].type === "text") {
                        setEditorId(ev.target.id);
                        contentWindow.editor123(`[id="${ev.target.id}"]`);
                      }
                    }
                  );
                }
              };
              mainElement.onmouseout = () => {
                mainElement.style.outline = emptyString;
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
      body.ondrop = (ev) => {
        ev.preventDefault();
        setIframeDrop(ev);
      };

      const documentIframe = contentWindow.document;
      if (documentIframe && screenType) {
        if (screenType === TEASER_LAYOUT) {
          documentIframe.querySelector(
            `[${MAIN_TYPE}="${POPUP_BACKGROUND}"]`
          ).style.display = noneString;
          documentIframe.querySelector(
            `[${MAIN_TYPE}="${TEASER_BACKGROUND}"]`
          ).style = {};
        } else {
          documentIframe.querySelector(
            `[${MAIN_TYPE}="${TEASER_BACKGROUND}"]`
          ).style.display = noneString;
          documentIframe.querySelector(
            `[${MAIN_TYPE}="${POPUP_BACKGROUND}"]`
          ).style = {};
        }
      }
    }
  }, [body, contentWindow, dataJson, screenType]);

  useEffect(() => {
    if (body && contentWindow && moveFixedAbsoluteData) {
      movePositionElement(
        body,
        contentWindow,
        moveFixedAbsoluteData,
        dataJson,
        {
          setMoveFixedAbsoluteData,
          setBeginMove,
          beginMove,
          screenType,
        }
      );
    }
  }, [
    beginMove,
    body,
    contentWindow,
    dataJson,
    moveFixedAbsoluteData,
    screenType,
  ]);

  useEffect(() => {
    setMenuDragEnd(null);
    setDragenter(null);
  }, [resetDragData]);

  useEffect(() => {
    if (contentWindow && screenType) {
      const documentIframe = contentWindow.document;

      switch (screenType) {
        case TEASER_LAYOUT:
          documentIframe.querySelector(
            `[${MAIN_TYPE}="${POPUP_BACKGROUND}"]`
          ).style.display = noneString;
          documentIframe.querySelector(
            `[${MAIN_TYPE}="${TEASER_BACKGROUND}"]`
          ).style = {};
          break;
        case POPUP_LAYOUT:
        case POPUP_WIDGET:
          documentIframe.querySelector(
            `[${MAIN_TYPE}="${TEASER_BACKGROUND}"]`
          ).style.display = noneString;
          documentIframe.querySelector(
            `[${MAIN_TYPE}="${POPUP_BACKGROUND}"]`
          ).style = {};
          break;
        case TEMPLATE:
          break;
        default:
          break;
      }
    }
  }, [contentWindow, screenType]);

  useEffect(() => {
    if (menuDragStart && contentWindow) {
      setMouseDown(emptyString);
      setSelected(emptyString);
      setIframeDragStart(emptyString);
      setIframeDragEnd(emptyString);
      setResetDragData((v) => !v);

      const { target } = menuDragStart;
      const dropNameType = target.getAttribute(MENUDRAGTYPE);
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
          case CLOSE_BUTTON:
            url = `${hostApi}/close_buttons/${target.id}.json`;

            documentIframe
              .querySelectorAll(`[${DROPTYPE}="${POPUP_WIDGET}"]`)
              .forEach((value) => {
                value.style.outline = styleOutlineMainDrop;
                value.style.zIndex = 999;
              });
            break;
          case TEMPLATE:
            url = `${hostApi}/templates/${target.id}.json`;
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
              case CLOSE_BUTTON:
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
    if (
      dragId &&
      menuDragEnd &&
      iframeDrop &&
      dragenter &&
      contentWindow &&
      dataJson
    ) {
      setDragId(emptyString);
      const { target } = dragenter;
      const { target: targetDrag } = menuDragEnd;
      if (targetDrag.getAttribute(DRAGTYPE) === target.getAttribute(DROPTYPE)) {
        dragging(target, targetDrag, contentWindow, iframeDrop, {
          dataJson,
          teaserLayout,
          popupLayout,
          popupWidget,
        });
      } else {
        contentWindow.document
          .querySelectorAll(
            `[${DROPTYPE}="${targetDrag.getAttribute(DRAGTYPE)}"]`
          )
          .forEach((value) => {
            if (value.contains(target) && value !== target) {
              for (let i = 0; i < value.childNodes.length; i++) {
                const dropChild = value.childNodes[i];
                if (dropChild.contains(target)) {
                  dragging(
                    dropChild.parentElement,
                    targetDrag,
                    contentWindow,
                    iframeDrop,
                    {
                      dataJson,
                      teaserLayout,
                      popupLayout,
                      popupWidget,
                    },
                    dragElementOverY ? after : before,
                    dropChild
                  );
                  break;
                }
              }
            }
          });
      }
      setIframeDrop(null);
      setDragenter(null);
      setMouseDown(emptyString);
      setSelected(emptyString);
      setMenuDragEnd(null);
    }
  }, [
    contentWindow,
    dataJson,
    dragElementOverY,
    dragId,
    dragenter,
    iframeDrop,
    menuDragEnd,
    popupLayout,
    popupWidget,
    teaserLayout,
  ]);

  useEffect(() => {
    if (iframeDragEnd && iframeDragStart && dragenter && contentWindow) {
      const { target } = dragenter;
      const { target: targetDrag } = iframeDragStart;
      if (targetDrag !== target) {
        let moveName = lastChild;
        if (
          targetDrag.getAttribute(DRAGTYPE) === target.getAttribute(DROPTYPE)
        ) {
          moving(
            target,
            targetDrag,
            contentWindow,
            dataJson,
            moveName,
            screenType
          );
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
                    moveName,
                    screenType
                  );
                } else {
                  moving(
                    value,
                    targetDrag,
                    contentWindow,
                    dataJson,
                    moveName,
                    screenType
                  );
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
    screenType,
  ]);

  useEffect(() => {
    if (dragenter && contentWindow && (iframeDragStart || menuDragStart)) {
      let setOver;
      const iframeStart = iframeDragStart || menuDragStart;
      setDragElementOverY(true);

      const dragElementOver = contentWindow.document.querySelectorAll(
        `[${DRAGTYPE}="${iframeStart.target.getAttribute(DRAGTYPE)}"]`
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
  }, [contentWindow, dragenter, iframeDragStart, menuDragStart]);

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
            jsonLoadDataHtml({
              newChildData: dataJson,
              newChildElement: childElements[value],

              parentElement: teaserBackground,
            });
          });
        } else {
          teaserBackground.setAttribute(DROPTYPE, TEASER_LAYOUT);
        }
        if (screenType !== TEASER_LAYOUT) {
          teaserBackground.style.display = noneString;
        }
      }
      if (popupScreenBackground) {
        const { childElementIds } = popupScreenBackground;
        const popupBackground = jsonElementToHtml(popupScreenBackground);
        bodyElement.appendChild(popupBackground);

        if (childElementIds.length > 0) {
          popupBackground.removeAttribute(DROPTYPE);
          childElementIds.forEach((value) => {
            jsonLoadDataHtml({
              newChildData: dataJson,
              newChildElement: childElements[value],

              parentElement: popupBackground,
            });
          });
        } else {
          popupBackground.setAttribute(DROPTYPE, POPUP_LAYOUT);
        }
        if (screenType === TEASER_LAYOUT) {
          popupBackground.style.display = noneString;
        }
      }

      addStringDataToHtml(
        `<link href="https://cdn.jsdelivr.net/npm/froala-editor@latest/css/froala_editor.pkgd.min.css" rel="stylesheet" type="text/css" />`,
        headElement
      );
      addStringDataToHtml(
        `<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/froala-editor@latest/js/froala_editor.pkgd.min.js"></script>`,
        bodyElement
      );
      addStringDataToHtml(
        `<script>window.editor123 = function(qs){let editor = new FroalaEditor(qs,{
          toolbarInline: true,
          charCounterCount: false,
          events: {
    'focus': function () {
            window.contentChanged('focus')
    },
    'blur': function () {
            window.contentChanged('blur')
    }
  }
        },  function () {
  window.editFunc111(editor)
});}</script>`,
        bodyElement
      );

      const srcDocData = document.createElement("div");
      srcDocData.appendChild(headElement);
      srcDocData.appendChild(bodyElement);

      setSrcDoc(srcDocData.innerHTML);
      srcDocData.remove();
    }
    // eslint-disable-next-line
  }, [dataJson]);

  useEffect(() => {
    if (template && menuDragEnd && menuDragStart && dragenter) {
      setDataJson(null);
      setSrcDoc(null);
      setDataJson(template);

      setTemplate(null);
      setMenuDragEnd(null);
      setMenuDragStart(null);
      setDragenter(null);
    }
  }, [menuDragEnd, menuDragStart, dragenter, template]);

  useEffect(() => {
    fetch("http://localhost:9999/popup-shop-custom.json")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setDataJson(data);
        snapShot(data);
      })
      .catch();
  }, []);

  function exportSettings() {
    console.log(JSON.stringify(dataJson));
  }

  function undoRedoAction(checkUndo = false) {
    const dataListAction = dataActions[listActionKey];
    if (!dataListAction) return;
    const currentKey = dataActions[currentActionKey];
    let findKey = dataListAction.length - 1;
    dataListAction.forEach((value, key) => {
      if (value === currentKey) {
        findKey = key;
      }
    });
    let nextOrPrevKey;
    if (checkUndo) {
      if (findKey > 0) {
        nextOrPrevKey = dataListAction[findKey - 1];
      }
    } else {
      if (findKey < dataListAction.length - 1) {
        nextOrPrevKey = dataListAction[findKey + 1];
      }
    }
    if (!nextOrPrevKey) return;
    setDataJson(null);
    setSrcDoc(null);
    dataActions.setState(currentActionKey, nextOrPrevKey);
    const snapShotData = JSON.parse(dataActions[nextOrPrevKey]);
    setDataJson(snapShotData.snapData);
    setScreenType(snapShotData.screenType);
  }

  function undo() {
    undoRedoAction(true);
  }

  function redo() {
    undoRedoAction(false);
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
        snapShot(data, POPUP_LAYOUT);
      })
      .catch();
  }

  return (
    <>
      <Header
        undo={undo}
        redo={redo}
        exportSettings={exportSettings}
        loadDefaultSettings={loadDefaultSettings}
      />
      <div
        className={"desktop"}
        onClick={() => {
          if (!mouse) setSelected(emptyString);
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
            setMouseUp={() => setMouseDown(emptyString)}
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
