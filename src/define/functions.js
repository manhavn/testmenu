import {
  DRAGGABLE,
  DRAGTYPE,
  DROPTYPE,
  ELEMENT_ID,
  LAYOUT_TYPE,
  MAIN_TYPE,
  MAINID,
  MOVETYPE,
  POPUP_BACKGROUND,
  POPUP_LAYOUT,
  POPUP_WIDGET,
  TEASER_BACKGROUND,
  TEASER_LAYOUT,
} from "./consts";

import dataJson from "../json/popup-shop-custom.json";
import teaserLayout from "../json/teaser_layouts/teaser-layout-01.json";
import popupLayout from "../json/popup_layouts/popup-layout-01.json";
import popupWidget from "../json/popup_widgets/popup-widget-01.json";

export const iframeState = getNewTimeString();
export const iframeMainElementSelected = getNewTimeString("imes");

export const after = "after";
export const before = "before";
export const emptyString = "";

export function jsonAppendDataHtmlByID({
  childElementIds,
  parentElement,
  childElements,
  mainId,
  id,
  layoutType,
  dragType,
  dropType,
  moveType,
}) {
  childElementIds.forEach((value) => {
    const dataElement = childElements[value];
    switch (dataElement.type) {
      case "text":
        parentElement.innerHTML += dataElement.value;
        break;
      case "tag":
        const { childElementIds } = dataElement;
        const element = document.createElement(dataElement.tagName);

        // setAttribute
        if (mainId) element.setAttribute(MAINID, mainId);
        if (id) {
          element.setAttribute(ELEMENT_ID, id);
        } else {
          element.setAttribute(ELEMENT_ID, new Date().getTime().toString());
        }
        (dataElement.attribute || []).forEach(({ name, value }) => {
          element.setAttribute(name, value);
        });
        if (layoutType) element.setAttribute(LAYOUT_TYPE, layoutType);
        if (dragType) element.setAttribute(DRAGTYPE, dragType);
        if (dropType) element.setAttribute(DROPTYPE, dropType);
        if (moveType) element.setAttribute(MOVETYPE, moveType);
        // setAttribute

        // Style
        if (dataElement.style.length > 0) {
          const styleElement = document.createElement("style");
          (dataElement.style || []).forEach(({ location, css }) => {
            styleElement.innerHTML += `${location} { ${css} } `;
          });
          element.appendChild(styleElement);
        }
        // Style

        if (childElementIds.length > 0) {
          jsonAppendDataHtmlByID({
            childElementIds,
            parentElement: element,
            childElements,
            mainId,
          });
        }
        parentElement.appendChild(element);
        break;
      default:
        break;
    }
  });
}

export function addStringDataToHtml(stringData, element) {
  const temp = document.createElement("div");
  temp.innerHTML = stringData;
  element.appendChild(temp.firstChild);
  temp.remove();
}

export function getNewTimeString(prefix = "") {
  return `${prefix}${new Date().getTime().toString()}`;
}

export function jsonElementToHtml({ tagName, attribute, style }) {
  const element = document.createElement(tagName);
  (attribute || []).forEach(({ name, value }) => {
    element.setAttribute(name, value);
  });
  const styleElement = document.createElement("style");
  (style || []).forEach(({ location, css }) => {
    styleElement.innerHTML += `${location} { ${css} } `;
  });
  element.appendChild(styleElement);
  return element;
}

export function iframeBodyOnMousedown(mainElement, contentWindow) {
  if (mainElement && mainElement.getAttribute(DRAGGABLE)) {
    mainElement.removeAttribute(DRAGGABLE);
  }
  if (mainElement.id && mainElement.getAttribute(DRAGTYPE)) {
    mainElement[DRAGGABLE] = true;
    contentWindow[iframeState].setState(iframeMainElementSelected, mainElement);
  }
}

export function insertElementToElement(drop, drag, moveName, contentWindow) {
  switch (moveName) {
    case after:
      drop.parentElement.insertBefore(drag, drop.nextSibling);
      break;
    case before:
      drop.parentElement.insertBefore(drag, drop);
      break;
    default:
      drop.appendChild(drag);
      break;
  }
  contentWindow.document
    .querySelectorAll(`[${DROPTYPE}]`)
    .forEach((value) => (value.style = {}));
}

export function moving(drop, drag, contentWindow, moveName) {
  insertElementToElement(drop, drag, moveName, contentWindow);
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
}

export function dragging(drop, drag, contentWindow, moveName) {
  const documentIframe = contentWindow.document;
  const newElementId = new Date().getTime().toString();
  switch (drag.getAttribute(DRAGTYPE)) {
    case TEASER_LAYOUT:
      documentIframe.querySelectorAll(`[${DROPTYPE}]`).forEach((value) => {
        const { display } = value.style;
        value.style = {};
        value.style.display = display;
      });
      drop.removeAttribute(DROPTYPE);
      console.log(drag.id);
      // const popupLayout = JSON.parse(``);
      dataJson.teaserScreenBackground.childElementIds = [newElementId];
      teaserLayout.teaserLayout.childElementIds.forEach((value) => {
        dataJson.childElements[newElementId] =
          teaserLayout.childElements[value];
      });
      dataJson.childElements = {
        ...dataJson.childElements,
        ...teaserLayout.childElements,
      };

      jsonAppendDataHtmlByID({
        childElementIds: dataJson.teaserScreenBackground.childElementIds,
        parentElement: drop,
        childElements: dataJson.childElements,
        mainId: newElementId,
        id: newElementId,
        layoutType: drag.id,
        moveType: TEASER_LAYOUT,
      });
      documentIframe.querySelector(
        `[${MAIN_TYPE}="${TEASER_BACKGROUND}"]`
      ).style = {};
      break;
    case POPUP_LAYOUT:
      documentIframe.querySelectorAll(`[${DROPTYPE}]`).forEach((value) => {
        const { display } = value.style;
        value.style = {};
        value.style.display = display;
      });
      drop.removeAttribute(DROPTYPE);
      console.log(drag.id);
      // const popupLayout = JSON.parse(``);
      dataJson.popupScreenBackground.childElementIds = [newElementId];
      popupLayout.popupLayout.childElementIds.forEach((value) => {
        dataJson.childElements[newElementId] = popupLayout.childElements[value];
      });
      dataJson.childElements = {
        ...dataJson.childElements,
        ...popupLayout.childElements,
      };

      jsonAppendDataHtmlByID({
        childElementIds: dataJson.popupScreenBackground.childElementIds,
        parentElement: drop,
        childElements: dataJson.childElements,
        mainId: newElementId,
        id: newElementId,
        layoutType: drag.id,
      });
      documentIframe.querySelector(
        `[${MAIN_TYPE}="${POPUP_BACKGROUND}"]`
      ).style = {};
      break;
    case POPUP_WIDGET:
      const temp = document.createElement("div");
      jsonAppendDataHtmlByID({
        childElementIds: popupWidget.popupWidget.childElementIds,
        parentElement: temp,
        childElements: popupWidget.childElements,
        mainId: newElementId,
        id: newElementId,
        layoutType: drag.id,
      });

      insertElementToElement(drop, temp.firstChild, moveName, contentWindow);
      temp.remove();
      documentIframe.querySelector(
        `[${MAIN_TYPE}="${POPUP_BACKGROUND}"]`
      ).style = {};
      break;
    default:
      break;
  }
}

export function setAfterBeforeAppend(
  { offsetLeft, offsetTop, offsetHeight },
  { layerY },
  props
) {
  const positionY = layerY - (offsetTop + offsetHeight / 2);
  props.setDragElementOverY(positionY >= 0);
}
