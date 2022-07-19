import React from "react";
import "./menu.css";
import { useEffect, useState } from "react";
import { emptyString } from "../define/functions";

export default function Menu({
  navSelected,
  setSelected,
  setMouseUp,
  mouseDown,
  setMouseDown,
  setMenuDragStart,
  setMenuDragEnd,
  navList,
}) {
  const [title, setTitle] = useState(emptyString);
  const [valueSelected, setValueSelected] = useState(emptyString);
  const [typeSelected, setTypeSelected] = useState(emptyString);
  const [listItem, setListItem] = useState([]);
  useEffect(() => {
    if (!navSelected) {
      setTitle(emptyString);
      return;
    }
    if (navList) {
      const menuSelectedItem = navList.filter(
        ({ value }) => value === navSelected && navSelected
      )[0];
      if (menuSelectedItem) {
        setTitle(menuSelectedItem.name);
        setValueSelected(menuSelectedItem.value);
        setTypeSelected(menuSelectedItem.type);
        setListItem([
          { name: "Link 1", menuId: `${menuSelectedItem.value}-01` },
          { name: "Link 2", menuId: `${menuSelectedItem.value}-02` },
          { name: "Link 3", menuId: `${menuSelectedItem.value}-03` },
          { name: "Link 4", menuId: `${menuSelectedItem.value}-04` },
          { name: "Link 5", menuId: `${menuSelectedItem.value}-05` },
        ]);
      }
    }
  }, [navList, navSelected]);
  return (
    <div className={"absolute"}>
      <div
        className="menu"
        style={{ marginLeft: navSelected ? "0" : "-300px" }}
      >
        <button className={"close"} onClick={() => setSelected(emptyString)}>
          close
        </button>
        <div className={"title"}>{title || "Menu"}</div>
        <div className="layout-widget-menu">
          {listItem.map(({ name, menuId }, index) => (
            <div
              id={menuId}
              key={index}
              onMouseUp={setMouseUp}
              onMouseDown={() => setMouseDown(menuId)}
              className={
                mouseDown === menuId
                  ? "active layout-widget-item"
                  : "layout-widget-item"
              }
              draggable="true"
              onDragStart={setMenuDragStart}
              onDragEnd={setMenuDragEnd}
              dragtype={typeSelected}
              menudragtype={valueSelected}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
