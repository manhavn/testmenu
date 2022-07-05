const { body } = document;
const { parent: windowParent } = window;

const draggable = "draggable";
const dropEnable = "dropenable";
const dropEnter = "dropenter";
const dropShow = "dropshow";
const dragEnable = "dragenable";
const moveFixedEnable = "movefixedenable";
const none = "none";
const emptyString = "";
const vTrue = "true";
const transferTypeDrag = "drag";

const styleDropShow = "#04aa6d 1px solid";
const styleDropEnter = "#f40a0d 1px dashed";
const styleTransferElement = "#990055 1px dashed";

const editElement = "editElement";

const dropShowTrue = `[${dropShow}="${vTrue}"]`;
const draggableTrue = `[${draggable}="${vTrue}"]`;
const dropEnableTrue = `[${dropEnable}="${vTrue}"]`;

const dragStartData = "dragStartData";
const moveFixedData = "moveFixedData";
const transferElement = "transferElement";
const transferType = "transferType";
const targetSelected = "targetSelected";
const startMouseMove = "startMouseMove";
const popupElement = "popupElement";
const state = {
  setState: function (key, value, callback) {
    if (this[key] !== value) {
      this[key] = value;
      if (callback) callback();
    }
  },
};

const showMenu = "showMenu";
const menu = {
  setState: function (key, value, callback) {
    if (this[key] !== value) {
      this[key] = value;
      if (callback) callback();
    }
  },
  setMenuElement: function () {
    if (!this[showMenu]) return;
    const outlineElement = document.createElement("div");
    // const { offsetWidth, offsetHeight } = state[popupElement];

    outlineElement.style.right = "200px";
    outlineElement.style.bottom = "200px";
    outlineElement.style.position = "fixed";

    // outlineElement.style.width = `${offsetWidth}px`;
    // outlineElement.style.height = `${offsetHeight}px`;
    // outlineElement.style.outline = styleDropEnter;
    outlineElement.style.zIndex = "1";
    body.appendChild(outlineElement);

    const menu = document.createElement("div");
    menu.style.position = "absolute";
    menu.style.width = "100%";
    // menu.style.display = "flex";
    // menu.style.justifyContent = "space-between";
    menu.style.top = "-30px";

    const button = document.createElement("button");
    button.style.cursor = "pointer";
    button.innerHTML = "Menu";
    button.onclick = function () {
      console.log(2222);
      state.setState(popupElement, null);
      outlineElement.remove();
    };
    menu.appendChild(button);

    const button2 = document.createElement("button");
    button2.style.cursor = "pointer";
    button2.innerHTML = "X";
    button2.onclick = function () {
      console.log("open menu");
      state.setState(popupElement, null);
      outlineElement.remove();
    };
    menu.appendChild(button2);

    outlineElement.appendChild(menu);
  },
};

/*
 * BEGIN MOVE TOOL
 */
const moveTool = {
  returnFalse: function () {
    return false;
  },
  getTransformTranslate: function ({ x, y }, ox, oy) {
    return `translate(${x - ox}px, ${y - oy}px)`;
  },
  ondragstart: function ({ x, y, target }) {
    body.onselectstart = moveTool.returnFalse;
    body.ondragover = moveTool.ondragover;
    body.ondragenter = moveTool.ondragenter;
    body.ondragexit = moveTool.ondragexit;
    body.ondragend = moveTool.ondragend;
    body.ondrop = moveTool.ondrop;

    const { style } = target;
    state.setState(transferElement, target);
    state.setState(dragStartData, { x, y, style });
    style.outline = styleTransferElement;
  },
  ondragover: function (ev) {
    if (state[dragStartData]) {
      const { x, y, style } = state[dragStartData];
      style.pointerEvents = none;
      style.transform = moveTool.getTransformTranslate(ev, x, y);
    }
    ev.preventDefault();
  },
  ondragenter: function ({ target }) {
    if (state[transferType] === transferTypeDrag) {
      switch (vTrue) {
        case target.getAttribute(dropEnable):
          target.setAttribute(dropEnter, vTrue);
          target.style.outline = styleDropEnter;
          break;
        case target.parentElement.getAttribute(dropEnable):
          target.parentElement.setAttribute(dropEnter, vTrue);
          break;
        default:
      }
    }
  },
  ondragexit: function ({ target }) {
    if (state[transferType] === transferTypeDrag) {
      switch (vTrue) {
        case target.getAttribute(dropEnable):
          target.removeAttribute(dropEnter);
          target.style.outline = styleDropShow;
          break;
        case target.parentElement.getAttribute(dropEnable):
          target.parentElement.removeAttribute(dropEnter);
          break;
        default:
      }
    }
  },
  ondrop: function (ev) {
    body.ondrop = null;

    const { target } = ev;
    if (state[transferType] === transferTypeDrag) {
      if (state[transferElement] !== target) {
        switch (vTrue) {
          case target.getAttribute(dropEnable):
            target.appendChild(state[transferElement]);
            break;
          case target.parentElement.getAttribute(dropEnable):
            target.parentElement.appendChild(state[transferElement]);
            break;
          default:
        }
      }
    }
    ev.preventDefault();
  },
  ondragend: function () {
    body.onselectstart = null;
    body.ondragstart = null;
    body.ondragover = null;
    body.ondragenter = null;
    body.ondragexit = null;
    body.ondragend = null;

    const te = state[transferElement];
    te.removeAttribute(draggable);
    te.style.outline = emptyString;

    const { style } = state[dragStartData];
    style.transform = emptyString;
    style.pointerEvents = emptyString;

    document.querySelectorAll(dropShowTrue).forEach((value) => {
      value.removeAttribute(dropShow);
      value.style.outline = emptyString;
      if (value.getAttribute(dropEnter)) value.removeAttribute(dropEnter);
    });
  },
  onmousemove: function ({ pageX, pageY }) {
    if (!state[moveFixedData]) return;

    const { innerWidth, innerHeight, scrollX, scrollY } = window;
    const { style, offsetWidth, offsetHeight, layerX, layerY, target } =
      state[moveFixedData];

    if (!state[startMouseMove]) {
      state.setState(startMouseMove, true);
      body.onselectstart = moveTool.returnFalse;

      style.position = "fixed";
      target.onclick = moveTool.returnFalse;
    }

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
  },
  onmousedown: function ({ target, layerX, layerY }) {
    switch (vTrue) {
      case target.getAttribute(dragEnable):
        body.ondragstart = moveTool.ondragstart;

        document.querySelectorAll(draggableTrue).forEach((value) => {
          value.removeAttribute(draggable);
        });

        target.draggable = true;
        state.setState(transferType, transferTypeDrag);
        document.querySelectorAll(dropEnableTrue).forEach((value) => {
          value.setAttribute(dropShow, vTrue);
          value.style.outline = styleDropShow;
        });
        break;
      case target.getAttribute(moveFixedEnable):
        const { style, offsetWidth, offsetHeight, onclick } = target;
        state.setState(moveFixedData, {
          style,
          offsetWidth,
          offsetHeight,
          layerX,
          layerY,
          target,
          onclick,
        });
        window.onmousemove = moveTool.onmousemove;
        break;
      default:
        return;
    }

    state.setState(targetSelected, target, () => {
      if (
        !target.getAttribute(dragEnable) &&
        !target.getAttribute(moveFixedEnable)
      ) {
        document.querySelectorAll(draggableTrue).forEach((value) => {
          value.removeAttribute(draggable);
        });
        document.querySelectorAll(dropShowTrue).forEach((value) => {
          value.removeAttribute(dropShow);
          value.style.outline = emptyString;
          if (value.getAttribute(dropEnter)) value.removeAttribute(dropEnter);
        });
      }
    });
  },
};
body.onmousedown = moveTool.onmousedown;
/*
 * END MOVE TOOL
 */

/*
 * BEGIN BODY MESSAGE
 */
const bodyMessage = {
  onmouseover: function (e) {
    windowParent.postMessage(
      {
        type: "body-mouseover",
        message: { id: e.target.id },
      },
      "*"
    );
  },
  onmouseup: function (e) {
    windowParent.postMessage(
      {
        type: "body-mouseup",
        message: { id: e.target.id },
      },
      "*"
    );
  },
};
body.onmouseup = bodyMessage.onmouseup;
body.onmouseover = function (ev) {
  bodyMessage.onmouseover(ev);

  const { target } = ev;
  const { parentElement } = target;

  function extracted(selectedElement) {
    if (!window.onclick && !state[popupElement]) {
      window.onclick = function () {
        window.onclick = null;
        state.setState(popupElement, selectedElement, menu.setMenuElement);
      };
    }
  }

  if (parentElement && parentElement.getAttribute(editElement)) {
    extracted(parentElement);
  } else if (target.getAttribute(editElement)) {
    extracted(target);
  }
};
/*
 * END BODY MESSAGE
 */

/*
 * BEGIN WINDOW MESSAGE
 */
const windowMessage = {
  onmouseup: function () {
    if (state[startMouseMove]) {
      state.setState(startMouseMove, null);
      window.onmousemove = null;
      const { target, onclick } = state[moveFixedData];
      setTimeout(function () {
        target.onclick = onclick;
      }, 100);
    }
    if (state[moveFixedData]) {
      state.setState(moveFixedData, null);
    }

    windowParent.postMessage(
      {
        type: "iframe-mouseup",
        message: ["ok mouseup!"],
      },
      "*"
    );
  },
  onfocus: function () {
    windowParent.postMessage(
      {
        type: "iframe-focus",
        message: ["ok focus!"],
      },
      "*"
    );
  },
};
window.onmouseup = windowMessage.onmouseup;
window.onfocus = windowMessage.onfocus;
window.onmessage = (ev) => {
  if (typeof ev.data !== "object") return;
  switch (ev.data.type) {
    case "add-widget":
      const [dragType, dragElement] = ev.data.message;
      console.log(dragType, dragElement);
      break;
    default:
  }
};
/*
 * END WINDOW MESSAGE
 */
