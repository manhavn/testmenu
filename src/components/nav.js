import React from "react";
import { useEffect, useState } from "react";
import "./nav.css";
import { emptyString } from "../define/functions";

export default function Nav({ navSelected, setSelected, navList }) {
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
      setSelected(navSelected === btnClick ? emptyString : btnClick);
      setBtnClick(emptyString);
    }
  }, [btnClick, action, divClick, setSelected, navSelected]);

  return (
    <div className={"nav"} onClick={() => setDivClick(true)}>
      {(navList || []).map(({ name, value }, index) => (
        <button
          key={index}
          className={navSelected === value ? "btn btn-active" : "btn"}
          onClick={() => setBtnClick(value)}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
