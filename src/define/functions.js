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
  TEMPLATE,
} from "./consts";

export const iframeState = getNewTimeString();
export const iframeMainElementSelected = getNewTimeString("imes");

export const after = "after";
export const before = "before";
export const lastChild = "lastChild";
export const firstChild = "firstChild";
export const emptyString = "";

export function jsonAppendDataHtmlByID({
  originData,
  originName,
  newChildData,
  newChildElement,

  parentElement,
  mainId,
  layoutType,
  dragType,
  dropType,
  moveType,
  addNewElement,
}) {
  switch (newChildElement.type) {
    case "text":
    case "svg":
      parentElement.innerHTML += newChildElement.value;
      originData.childElements[originName] = {
        ...newChildElement,
      };
      break;
    case "tag":
      const { childElementIds } = newChildElement;
      const element = document.createElement(newChildElement.tagName);

      // setAttribute
      const attributes = newChildElement.attribute || [];
      attributes.forEach(({ name, value }) => {
        element.setAttribute(name, value);
      });

      if (addNewElement) {
        newChildElement.attribute = attributes;
        if (mainId) {
          element.setAttribute(MAINID, mainId);
          newChildElement.attribute.push({
            editName: false,
            editValue: false,
            name: MAINID,
            value: mainId,
          });
        }
        if (originName) {
          element.setAttribute(ELEMENT_ID, originName);
          newChildElement.attribute.push({
            editName: false,
            editValue: false,
            name: ELEMENT_ID,
            value: originName,
          });
        }
        if (layoutType) {
          element.setAttribute(LAYOUT_TYPE, layoutType);
          newChildElement.attribute.push({
            editName: false,
            editValue: false,
            name: LAYOUT_TYPE,
            value: layoutType,
          });
        }
        if (dragType) {
          element.setAttribute(DRAGTYPE, dragType);
          newChildElement.attribute.push({
            editName: false,
            editValue: false,
            name: DRAGTYPE,
            value: dragType,
          });
        }
        if (dropType) {
          element.setAttribute(DROPTYPE, dropType);
          newChildElement.attribute.push({
            editName: false,
            editValue: false,
            name: DROPTYPE,
            value: dropType,
          });
        }
        if (moveType) {
          element.setAttribute(MOVETYPE, moveType);
          newChildElement.attribute.push({
            editName: false,
            editValue: false,
            name: MOVETYPE,
            value: moveType,
          });
        }
      }
      // setAttribute

      // Style
      const styles = newChildElement.style || [];
      if (styles.length > 0) {
        const styleElement = document.createElement("style");
        styles.forEach(({ location, css }) => {
          styleElement.innerHTML += `${location} { ${css} } `;
        });
        element.appendChild(styleElement);
      }
      // Style

      // script
      if (newChildElement.script) {
        const scriptElement = document.createElement("script");
        scriptElement.innerHTML = newChildElement.script;
        element.appendChild(scriptElement);
      }
      // script

      originData.childElements[originName] = {
        ...newChildElement,
        childElementIds: [],
      };

      if (childElementIds.length > 0) {
        childElementIds.forEach((value, index) => {
          const newChildId = `${originName}-${index}`;
          originData.childElements[originName].childElementIds.push(newChildId);
          jsonAppendDataHtmlByID({
            originData,
            originName: newChildId,
            newChildData,
            newChildElement: newChildData.childElements[value],

            parentElement: element,
            mainId,
            addNewElement,
          });
        });
      }
      parentElement.appendChild(element);
      break;
    default:
      break;
  }
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

export function insertElementToElement(
  drop,
  drag,
  contentWindow,
  dataJson,
  moveName
) {
  let arr;
  let childElements;
  const newArray = [];
  switch (moveName) {
    case after:
      childElements = dataJson.childElements[drop.parentElement.id];
      arr = childElements.childElementIds;
      const nextItem = (drop.nextSibling && drop.nextSibling.id) || drop.id;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] === nextItem) {
          if (drop.nextSibling) {
            newArray.push(drag.id);
            newArray.push(nextItem);
          } else {
            newArray.push(nextItem);
            newArray.push(drag.id);
          }
        } else if (arr[i] !== drag.id) {
          newArray.push(arr[i]);
        }
      }
      drop.parentElement.insertBefore(drag, drop.nextSibling);
      break;
    case before:
      childElements = dataJson.childElements[drop.parentElement.id];
      arr = childElements.childElementIds;
      const prevItem = drop.id;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] === prevItem) {
          newArray.push(drag.id);
          newArray.push(prevItem);
        } else if (arr[i] !== drag.id) {
          newArray.push(arr[i]);
        }
      }
      drop.parentElement.insertBefore(drag, drop);
      break;
    case firstChild:
      childElements = dataJson.childElements[drop.id];
      arr = childElements.childElementIds;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== drag.id) {
          newArray.push(arr[i]);
        }
      }
      newArray.unshift(drag.id);
      drop.appendChild(drag);
      break;
    default:
    case lastChild:
      childElements = dataJson.childElements[drop.id];
      arr = childElements.childElementIds;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== drag.id) {
          newArray.push(arr[i]);
        }
      }
      newArray.push(drag.id);
      drop.appendChild(drag);
      break;
  }
  if (childElements) childElements.childElementIds = newArray;
  contentWindow.document
    .querySelectorAll(`[${DROPTYPE}]`)
    .forEach((value) => (value.style = {}));
}

export function moving(drop, drag, contentWindow, dataJson, moveName) {
  insertElementToElement(drop, drag, contentWindow, dataJson, moveName);
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

export function dragging(
  drop,
  drag,
  contentWindow,
  { dataJson, teaserLayout, popupLayout, popupWidget, template },
  moveName
) {
  if (moveName) console.log("moveName src/define/functions.js 237", moveName);
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
      teaserLayout.teaserLayout.childElementIds.forEach((value) => {
        dataJson.teaserScreenBackground.childElementIds = [newElementId];
        jsonAppendDataHtmlByID({
          originData: dataJson,
          originName: newElementId,
          newChildData: teaserLayout,
          newChildElement: teaserLayout.childElements[value],

          parentElement: drop,
          mainId: newElementId,
          layoutType: drag.id,
          moveType: TEASER_LAYOUT,
          addNewElement: true,
        });
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
      popupLayout.popupLayout.childElementIds.forEach((value) => {
        dataJson.popupScreenBackground.childElementIds = [newElementId];
        jsonAppendDataHtmlByID({
          originData: dataJson,
          originName: newElementId,
          newChildData: popupLayout,
          newChildElement: popupLayout.childElements[value],

          parentElement: drop,
          mainId: newElementId,
          layoutType: drag.id,
          addNewElement: true,
        });
      });
      documentIframe.querySelector(
        `[${MAIN_TYPE}="${POPUP_BACKGROUND}"]`
      ).style = {};
      break;
    case POPUP_WIDGET:
      popupWidget.popupWidget.childElementIds.forEach((value, index) => {
        const newChildId = `${newElementId}-${index}`;
        dataJson.childElements[drop.id].childElementIds.push(newChildId);
        jsonAppendDataHtmlByID({
          originData: dataJson,
          originName: newChildId,
          newChildData: popupWidget,
          newChildElement: popupWidget.childElements[value],

          parentElement: drop,
          mainId: newChildId,
          layoutType: drag.id,
          addNewElement: true,
        });
      });
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

export function setAfterBeforeAppend(
  { offsetLeft, offsetTop, offsetHeight },
  { layerY },
  props
) {
  const positionY = layerY - (offsetTop + offsetHeight / 2);
  props.setDragElementOverY(positionY >= 0);
}
