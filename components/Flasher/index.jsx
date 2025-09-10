import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import releases from "../../src/releases.json";
import EspFlasher from "../EspFlasher";
import FirmwareCard from "../FirmwareCard";
import Monitor from "../Monitor";
import styles from "./styles.module.css";

const BoardGrid = ({ path }) => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(path)
      .then((res) => res.json())
      .then((data) => setBoards(data))
      .catch(() => setBoards([]))
      .finally(() => setLoading(false));
  }, [path]);

  const handleBoardClick = (board) => {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("id", board.id);
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.pushState(null, "", newUrl);
    window.dispatchEvent(new Event("urlchange"));
  };

  if (loading) {
    return <p>Loading boards…</p>;
  }

  return (
    <section className={styles.boardGrid}>
      <div className={styles.container}>
        {boards.map((board, index) => (
          <article key={index}>
            <div
              className={styles.boardGridItem}
              onClick={() => handleBoardClick(board)}
              style={{ cursor: "pointer" }}
            >
              <a>
                <div className={styles.boardGridImage}>
                  <img src={board.image} alt={board.name} loading="lazy" />
                </div>
                <strong title={board.name}>{board.name}</strong>
                <span>By {board.manufacturer}</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const Board = ({ path }) => {
  const [description, setDescription] = useState("");
  const [boardAttr, setBoardAttr] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEsp32, setIsEsp32] = useState(false);

  const [showFlasher, setShowFlasher] = useState(false);
  const [flasherInfo, setFlasherInfo] = useState({});

  const [micropythonReleases, setMicropythonReleases] = useState([]);
  const [circuitpythonReleases, setCircuitpythonReleases] = useState([]);
  const [meshtasticReleases, setMeshtasticReleases] = useState([]);

  useEffect(() => {
    setLoading(true);

    (async () => {
      try {
        const [boardsData, markdownText] = await Promise.all([
          fetch(`${path}/index.json`).then((res) => res.json()),
          fetch(`${path}/README.md`).then((res) => res.text()),
        ]);

        setBoardAttr(boardsData);
        setIsEsp32(boardsData.mcu.toLowerCase().includes("esp32"));
        setDescription(markdownText);

        setMicropythonReleases(releases.micropython);
        setCircuitpythonReleases(releases.circuitpython);
        setMeshtasticReleases(releases.meshtastic);

        console.log("Loaded data");
      } catch (err) {
        console.error("load error", err);
        setBoardAttr([]);
        setDescription("");
      } finally {
        setLoading(false);
      }
    })();
  }, [path]);

  if (loading) {
    return <p>Loading board ......</p>;
  }

  const openFlasher = (packageInfo) => {
    setShowFlasher(true);
    setFlasherInfo(packageInfo);
  };

  return (
    <div className={styles.board}>
      <div className={styles.boardDescription}>
        <div className={styles.boardDescriptionImage}>
          <img src={boardAttr.image} alt={boardAttr.name} loading="lazy" />
          <h1>{boardAttr.name}</h1>
        </div>
        <div className={styles.boardDescriptionContent}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {description}
          </ReactMarkdown>
        </div>
      </div>

      <div className={styles.boardFirmware}>
        {circuitpythonReleases.length > 0 ? (
          <FirmwareCard
            ascription="CircuitPython"
            description={`CircuitPython is a programming language designed to simplify
              experimenting and learning to code on low-cost microcontroller
              boards, This is the firmware of CircuitPython that will work with
              the <b>${boardAttr.name}</b> Board.`}
            gitUrl="https://github.com/adafruit/circuitpython"
            officialUrl="https://circuitpython.org/"
            boardAscription={boardAttr.circuitpython}
            releases={circuitpythonReleases}
            isEsp32={isEsp32}
            onFlashClick={openFlasher}
          />
        ) : null}

        {micropythonReleases.length > 0 ? (
          <FirmwareCard
            ascription="Micropython"
            description={`Micropython is a programming language designed to simplify
              experimenting and learning to code on low-cost microcontroller
              boards, This is the firmware of Micropython that will work with
              the <b>${boardAttr.name}</b> Board.`}
            gitUrl="https://github.com/fobe-projects/micropython"
            officialUrl="https://micropython.org/"
            boardAscription={boardAttr.micropython}
            releases={micropythonReleases}
            isEsp32={isEsp32}
            onFlashClick={openFlasher}
          />
        ) : null}

        {meshtasticReleases.length > 0 ? (
          <FirmwareCard
            ascription="Meshtastic"
            description={`Meshtastic is a project that enables you to use inexpensive LoRa radios as a long range off-grid communication platform in areas without existing or reliable communications infrastructure.`}
            gitUrl="https://github.com/fobe-projects/meshtastic-firmware"
            officialUrl="https://meshtastic.org/"
            boardAscription={boardAttr.meshtastic}
            releases={meshtasticReleases}
            isEsp32={isEsp32}
            onFlashClick={openFlasher}
          />
        ) : null}

        <EspFlasher
          isShow={showFlasher}
          onClose={() => setShowFlasher(false)}
          packageInfo={flasherInfo}
          targetChip={boardAttr.mcu}
        />
      </div>
    </div>
  );
};

const Flasher = (args) => {
  const [id, setId] = useState(null);

  useEffect(() => {
    const handleUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get("id");
      setId(id);
    };

    const wrapHistoryMethod = (type) => {
      const orig = window.history[type];
      window.history[type] = function (...args) {
        const rv = orig.apply(this, args);
        window.dispatchEvent(new Event("urlchange"));
        return rv;
      };
    };
    wrapHistoryMethod("pushState");
    wrapHistoryMethod("replaceState");

    window.addEventListener("urlchange", handleUrlChange);
    window.addEventListener("popstate", handleUrlChange);

    handleUrlChange();

    return () => {
      window.removeEventListener("urlchange", handleUrlChange);
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, []);
  return id == null ? (
    <>
      <header>
        <h1>Firmware Hub</h1>
      </header>
      <BoardGrid path={args.boards_path} />
      <Monitor />
    </>
  ) : (
    <Board path={`/boards/${id}`} />
  );
};

export default Flasher;
