import "./menu.css";

export default function Menu({
  navSelected,
  setSelected,
  setMouseUp,
  mouseDown,
  setMouseDown,
  setMenuDragStart,
  setMenuDragEnd,
}) {
  const listItem = [
    "Link 1",
    "Link 2",
    "Link 3",
    "Link 4",
    "Link 5",
    "Link 6",
    "Link 7",
  ];
  return (
    <div className={"absolute"}>
      <div
        className="menu"
        style={{ marginLeft: navSelected ? "0" : "-300px" }}
      >
        <button className={"close"} onClick={() => setSelected("")}>
          close
        </button>
        <div className={"title"}>{navSelected ? navSelected : "Menu"}</div>
        <div className="vertical-menu">
          {listItem.map((value, index) => (
            <div
              id={`item-${index + 1}`}
              key={index}
              onMouseUp={setMouseUp}
              onMouseDown={() => setMouseDown(`item-${index + 1}`)}
              className={mouseDown === `item-${index + 1}` ? "active" : ""}
              draggable="true"
              onDragStart={setMenuDragStart}
              onDragEnd={setMenuDragEnd}
            >
              {value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
