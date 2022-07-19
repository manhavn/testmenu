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
  WIDGETTYPE,
} from "./consts";

export const iframeState = getNewTimeString();
export const iframeMainElementSelected = getNewTimeString("imes");

export const after = "after";
export const before = "before";
export const lastChild = "lastChild";
export const firstChild = "firstChild";
export const emptyString = "";
export const defaultString = "default";
export const textString = "text";
export const svgString = "svg";
export const tagString = "tag";
export const styleString = "style";
export const scriptString = "script";
export const divString = "div";

export function jsonAppendDataHtmlByID({
  originData,
  originName,
  newChildData,
  newChildElement,

  moveName,
  dropChild,
  fatherId,
  parentElement,
  mainId,
  layoutType,
  dragType,
  dropType,
  moveType,
  addNewElement,

  addAndSetPosition,
  iframeDrop,
  contentWindow,
  moveNameType,
}) {
  switch (newChildElement.type) {
    case textString:
    case svgString:
      parentElement.innerHTML += newChildElement.value;
      originData.childElements[originName] = {
        ...newChildElement,
      };
      break;
    case tagString:
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
          newChildElement.mainId = mainId;
          newChildElement.attribute.push({
            editName: false,
            editValue: false,
            name: MAINID,
            value: mainId,
          });
        }
        if (originName) {
          newChildElement.originName = originName;
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
        const styleElement = document.createElement(styleString);
        styles.forEach(({ location, css }) => {
          styleElement.innerHTML += `${location} { ${css} } `;
        });
        element.appendChild(styleElement);
      }
      // Style

      // script
      if (newChildElement.script) {
        const scriptElement = document.createElement(scriptString);
        scriptElement.innerHTML = newChildElement.script;
        element.appendChild(scriptElement);
      }
      // script

      if (fatherId) {
        newChildElement.fatherId = fatherId;
      }

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

            fatherId,
            parentElement: element,
            mainId,
            addNewElement,
          });
        });
      }
      switch (moveName) {
        case after:
          parentElement.insertBefore(element, dropChild.nextSibling);
          break;
        case before:
          parentElement.insertBefore(element, dropChild);
          break;
        default:
          parentElement.appendChild(element);
          break;
      }
      if (addAndSetPosition && contentWindow && element.id) {
        const { pageX, pageY } = iframeDrop;
        const moveElement = contentWindow.document.getElementById(element.id);
        const { offsetWidth, offsetHeight, style } = moveElement;
        mouseMovingChangePosition(
          contentWindow,
          pageX,
          pageY,
          offsetWidth,
          offsetWidth / 2,
          offsetHeight,
          offsetHeight / 2,
          moveNameType,
          moveElement.getAttribute(WIDGETTYPE),
          style,
          originData,
          mainId
        );
      }
      break;
    default:
      break;
  }
}

export function addStringDataToHtml(stringData, element) {
  const temp = document.createElement(divString);
  temp.innerHTML = stringData;
  element.appendChild(temp.firstChild);
  temp.remove();
}

export function getNewTimeString(prefix = emptyString) {
  return `${prefix}${new Date().getTime().toString()}`;
}

export function jsonElementToHtml({ tagName, attribute, style }) {
  const element = document.createElement(tagName);
  (attribute || []).forEach(({ name, value }) => {
    element.setAttribute(name, value);
  });
  const styleElement = document.createElement(styleString);
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

function changeJsonDataAppendItem(
  dataJson,
  dropMainId,
  dragId,
  newArray,
  childType,
  checkAppend
) {
  const newFatherElement = dataJson.childElements[dropMainId];
  const arr = newFatherElement.childElementIds;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== dragId) {
      newArray.push(arr[i]);
    }
  }
  if (checkAppend) {
    switch (childType) {
      case firstChild:
        newArray.unshift(dragId);
        break;
      default:
      case lastChild:
        newArray.push(dragId);
        break;
    }
  }
  return newFatherElement;
}

function changeJsonDataItemAfter(
  dataJson,
  dropMainId,
  nextItem,
  dragId,
  drop,
  newArray,
  checkAppend
) {
  const newFatherElement = dataJson.childElements[dropMainId];
  const arr = newFatherElement.childElementIds;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === nextItem) {
      if (drop.nextSibling) {
        if (checkAppend) {
          newArray.push(dragId);
          newArray.push(nextItem);
        } else {
          newArray.push(nextItem);
        }
      } else {
        newArray.push(nextItem);
        if (checkAppend) newArray.push(dragId);
      }
    } else if (arr[i] !== dragId) {
      newArray.push(arr[i]);
    }
  }
  return newFatherElement;
}

function changeJsonDataItemBefore(
  dataJson,
  dropMainId,
  prevItem,
  dragId,
  newArray,
  checkAppend
) {
  const newFatherElement = dataJson.childElements[dropMainId];
  const arr = newFatherElement.childElementIds;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === prevItem) {
      if (checkAppend) {
        newArray.push(dragId);
        newArray.push(prevItem);
      } else {
        newArray.push(prevItem);
      }
    } else if (arr[i] !== dragId) {
      newArray.push(arr[i]);
    }
  }
  return newFatherElement;
}

export function insertElementToElement(
  drop,
  drag,
  contentWindow,
  dataJson,
  moveName
) {
  let childElements, childElementsNewDrop;
  const newArray = [];
  const newArrayNewDrop = [];
  const dragMainId = drag.getAttribute(MAINID);
  const dragFatherId = dataJson.childElements[dragMainId].fatherId;
  let dropMainId;
  let dropParentElement;

  switch (moveName) {
    case after:
      dropParentElement = drop.parentElement;
      dropMainId = dropParentElement.id;
      const nextItem = (drop.nextSibling && drop.nextSibling.id) || drop.id;
      if (dragFatherId === dropMainId) {
        childElements = changeJsonDataItemAfter(
          dataJson,
          dragFatherId,
          nextItem,
          drag.id,
          drop,
          newArray,
          true
        );
      } else {
        childElementsNewDrop = changeJsonDataItemAfter(
          dataJson,
          dropMainId,
          nextItem,
          drag.id,
          drop,
          newArrayNewDrop,
          true
        );
        childElements = changeJsonDataItemAfter(
          dataJson,
          dragFatherId,
          nextItem,
          drag.id,
          drop,
          newArray,
          false
        );
      }
      dropParentElement.insertBefore(drag, drop.nextSibling);
      break;
    case before:
      dropParentElement = drop.parentElement;
      dropMainId = dropParentElement.id;
      const prevItem = drop.id;
      if (dragFatherId === dropMainId) {
        childElements = changeJsonDataItemBefore(
          dataJson,
          dragFatherId,
          prevItem,
          drag.id,
          newArray,
          true
        );
      } else {
        childElementsNewDrop = changeJsonDataItemBefore(
          dataJson,
          dropMainId,
          prevItem,
          drag.id,
          newArrayNewDrop,
          true
        );
        childElements = changeJsonDataItemBefore(
          dataJson,
          dragFatherId,
          prevItem,
          drag.id,
          newArray,
          false
        );
      }
      dropParentElement.insertBefore(drag, drop);
      break;
    default:
    case firstChild:
    case lastChild:
      const childType = moveName === firstChild ? firstChild : lastChild;
      dropMainId = drop.id;
      if (dragFatherId === dropMainId) {
        childElements = changeJsonDataAppendItem(
          dataJson,
          dragFatherId,
          drag.id,
          newArray,
          childType,
          true
        );
      } else {
        childElementsNewDrop = changeJsonDataAppendItem(
          dataJson,
          dropMainId,
          drag.id,
          newArrayNewDrop,
          childType,
          true
        );
        childElements = changeJsonDataAppendItem(
          dataJson,
          dragFatherId,
          drag.id,
          newArray,
          childType,
          false
        );
      }
      if (moveName === firstChild && drop.firstChild) {
        drop.insertBefore(drag, drop.firstChild);
      } else {
        drop.appendChild(drag);
      }
      break;
  }
  if (childElements) childElements.childElementIds = newArray;
  if (childElementsNewDrop)
    childElementsNewDrop.childElementIds = newArrayNewDrop;
  contentWindow.document
    .querySelectorAll(`[${DROPTYPE}]`)
    .forEach((value) => (value.style = {}));
}

export function moving(drop, drag, contentWindow, dataJson, moveName) {
  insertElementToElement(drop, drag, contentWindow, dataJson, moveName);
  if (contentWindow[iframeState]) {
    const mainElement = contentWindow[iframeState][iframeMainElementSelected];
    if (mainElement) {
      mainElement.style.outline = emptyString;
      mainElement.onmouseout = null;
      mainElement.ondragstart = null;
      mainElement.ondragend = null;
      mainElement.onmousedown = null;
      mainElement.onclick = null;
      mainElement.removeAttribute(DRAGGABLE);
      contentWindow[iframeState].setState(iframeMainElementSelected, null);
    }
  }
}

export function dragging(
  drop,
  drag,
  contentWindow,
  iframeDrop,
  { dataJson, teaserLayout, popupLayout, popupWidget },
  moveName,
  dropChild
) {
  const { document: documentIframe } = contentWindow;
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

          moveName,
          dropChild,
          fatherId: drop.id,
          parentElement: drop,
          mainId: newElementId,
          layoutType: drag.id,
          moveType: TEASER_LAYOUT,
          addNewElement: true,
          addAndSetPosition: true,
          iframeDrop,
          contentWindow,
          moveNameType: TEASER_LAYOUT,
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

          moveName,
          dropChild,
          fatherId: drop.id,
          parentElement: drop,
          mainId: newElementId,
          layoutType: drag.id,
          addNewElement: true,
          addAndSetPosition: false,
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

          moveName,
          dropChild,
          fatherId: drop.id,
          parentElement: drop,
          mainId: newChildId,
          layoutType: drag.id,
          addNewElement: true,
          addAndSetPosition: true,
          iframeDrop,
          contentWindow,
          moveNameType: POPUP_WIDGET,
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

export function getNewPercentValue(p, l, i) {
  let o = p - l;
  if (o < 0) {
    o = 0;
  } else {
    o = (100 * o) / i;
  }
  return o;
}

export function getNewPosition({ elLeft, elTop, elRight, elBottom }) {
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

export function getNewAbsolutePosition(m, l, f, s, c, t) {
  let n = (100 * (m - l - (f + s - c) / 2)) / c;
  if (n < 0 && t === POPUP_WIDGET) {
    n = 0;
  } else if (m - l < 0) {
    n = (100 * (-(f + s - c) / 2)) / c;
  }
  return n;
}

function mouseMovingChangePosition(
  contentWindow,
  pageX,
  pageY,
  offsetWidth,
  layerX,
  offsetHeight,
  layerY,
  moveNameType,
  widgetType,
  style,
  dataJson,
  mainId
) {
  const { innerWidth, innerHeight, scrollX, scrollY } = contentWindow;

  const positionMouseX = pageX - scrollX;
  const positionMouseY = pageY - scrollY;
  const positionMouseRightX = innerWidth + scrollX - pageX;
  const positionMouseRightY = innerHeight + scrollY - pageY;

  let elLeft, elTop, elRight, elBottom;
  const layerRightX = offsetWidth - layerX;
  const layerRightY = offsetHeight - layerY;

  switch (moveNameType) {
    case TEASER_LAYOUT:
      elLeft = getNewPercentValue(positionMouseX, layerX, innerWidth);
      elTop = getNewPercentValue(positionMouseY, layerY, innerHeight);
      elRight = getNewPercentValue(
        positionMouseRightX,
        layerRightX,
        innerWidth
      );
      elBottom = getNewPercentValue(
        positionMouseRightY,
        layerRightY,
        innerHeight
      );
      break;
    case POPUP_WIDGET:
      const { clientWidth, clientHeight } =
        contentWindow.document.querySelector(`[${DROPTYPE}="${POPUP_WIDGET}"]`);
      elLeft = getNewAbsolutePosition(
        positionMouseX,
        layerX,
        positionMouseX,
        positionMouseRightX,
        clientWidth,
        widgetType
      );
      elRight = getNewAbsolutePosition(
        positionMouseRightX,
        layerRightX,
        positionMouseX,
        positionMouseRightX,
        clientWidth,
        widgetType
      );
      elTop = getNewAbsolutePosition(
        positionMouseY,
        layerY,
        positionMouseY,
        positionMouseRightY,
        clientHeight,
        widgetType
      );
      elBottom = getNewAbsolutePosition(
        positionMouseRightY,
        layerRightY,
        positionMouseY,
        positionMouseRightY,
        clientHeight,
        widgetType
      );
      break;
    default:
      break;
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

  let indexOld = 0;
  let styleData;
  let elementData = dataJson.childElements[mainId];
  if (
    elementData &&
    elementData.attribute &&
    elementData.attribute.length > 0
  ) {
    styleData = elementData.attribute.filter(({ name }, index) => {
      if (name === styleString) {
        indexOld = index;
        return true;
      }
      return false;
    })[0];
  }
  let { editName, editValue } = styleData || {};
  let newStyleData = {
    editName: !!editName,
    editValue: !!editValue,
    name: styleString,
    value: `${left ? `left: ${left}; ` : emptyString}${
      top ? `top: ${top}; ` : emptyString
    }${right ? `right: ${right}; ` : emptyString}${
      bottom ? `bottom: ${bottom}; ` : emptyString
    }`,
  };
  if (indexOld === 0) {
    dataJson.childElements[mainId].attribute.push(newStyleData);
  } else {
    dataJson.childElements[mainId].attribute[indexOld] = newStyleData;
  }
}

export function movePositionElement(
  body,
  contentWindow,
  moveData,
  dataJson,
  props
) {
  const {
    mainId,
    style,
    offsetWidth,
    offsetHeight,
    layerX,
    layerY,
    moveNameType,
    widgetType,
  } = moveData;
  contentWindow.onmouseup = () => {
    contentWindow.onmouseup = null;
    contentWindow.onmousemove = null;
    body.onselectstart = null;
    props.setMoveFixedAbsoluteData(null);
  };
  contentWindow.onmouseout = ({ target }) => {
    target.style.cursor = emptyString;
  };
  contentWindow.onmousemove = ({ pageX, pageY, target }) => {
    if (target && target.style) target.style.cursor = defaultString;
    body.onselectstart = () => false;
    mouseMovingChangePosition(
      contentWindow,
      pageX,
      pageY,
      offsetWidth,
      layerX,
      offsetHeight,
      layerY,
      moveNameType,
      widgetType,
      style,
      dataJson,
      mainId
    );
  };
}
