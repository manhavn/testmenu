import { useEffect, useState } from "react";
import "./nav.css";

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
      setSelected(navSelected === btnClick ? "" : btnClick);
      setBtnClick("");
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
