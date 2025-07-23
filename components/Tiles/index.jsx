import React, { useEffect } from "react";

import s from "./tiles.module.css";

const Tiles = () => {
  const [_t, setT] = React.useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setT((prev) => prev + 1);
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className={s.container}></div>
    </>
  );
};

export default Tiles;
