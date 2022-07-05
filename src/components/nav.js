import { useEffect, useState } from "react";
import "./nav.css";

export default function Nav({ navSelected, setSelected }) {
  const list = ["123", "456", "aaa", "789", "xyz"];

  const [action, setAction] = useState();
  const [divClick, setDivClick] = useState();
  const [btnClick, setBtnClick] = useState();

  useEffect(() => {
    if (divClick === true) {
      setDivClick(false);
      setAction(true);
    }

    if (action === true) {
      setAction(false);
      setSelected(navSelected === btnClick ? "" : btnClick);
      setBtnClick("");
    }
  }, [btnClick, action, divClick, setSelected, navSelected]);

  return (
    <div className={"nav"} onClick={() => setDivClick(true)}>
      {list.map((value, index) => (
        <button
          key={index}
          className={"btn"}
          onClick={() => setBtnClick(value)}
        >
          {navSelected === value ? "active" : "btn"}
          {` `}
          {value}
        </button>
      ))}
    </div>
  );
}
