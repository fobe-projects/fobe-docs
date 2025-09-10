import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import releases from "../../src/releases.json";
import EspFlasher from "../EspFlasher";
import FirmwareCard from "../FirmwareCard";
import Monitor from "../Monitor";
import styles from "./styles.module.css";

const BoardGrid = ({ boards }) => {
  const handleBoardClick = (board) => {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("id", board.id);
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.pushState(null, "", newUrl);
    window.dispatchEvent(new Event("urlchange"));
  };

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

const Board = ({ board }) => {
  const [isEsp32, setIsEsp32] = useState(false);

  const [showFlasher, setShowFlasher] = useState(false);
  const [flasherInfo, setFlasherInfo] = useState({});

  const [micropythonReleases, setMicropythonReleases] = useState([]);
  const [circuitpythonReleases, setCircuitpythonReleases] = useState([]);
  const [meshtasticReleases, setMeshtasticReleases] = useState([]);

  useEffect(() => {
    setMicropythonReleases(releases.micropython);
    setCircuitpythonReleases(releases.circuitpython);
    setMeshtasticReleases(releases.meshtastic);
  }, []);

  useEffect(() => {
    setIsEsp32(board.mcu.toLowerCase().includes("esp32"));
  }, [board]);

  const openFlasher = (packageInfo) => {
    setShowFlasher(true);
    setFlasherInfo(packageInfo);
  };

  return (
    <div className={styles.board}>
      <div className={styles.boardDescription}>
        <div className={styles.boardDescriptionImage}>
          <img src={board.image} alt={board.name} loading="lazy" />
          <h1>{board.name}</h1>
        </div>
        <div className={styles.boardDescriptionContent}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {board.description}
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
              the <b>${board.name}</b> Board.`}
            gitUrl="https://github.com/fobe-projects/circuitpython"
            officialUrl="https://circuitpython.org/"
            boardAscription={board.circuitpython}
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
              the <b>${board.name}</b> Board.`}
            gitUrl="https://github.com/fobe-projects/micropython"
            officialUrl="https://micropython.org/"
            boardAscription={board.micropython}
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
            boardAscription={board.meshtastic}
            releases={meshtasticReleases}
            isEsp32={isEsp32}
            onFlashClick={openFlasher}
          />
        ) : null}

        <EspFlasher
          isShow={showFlasher}
          onClose={() => setShowFlasher(false)}
          packageInfo={flasherInfo}
          targetChip={board.mcu}
        />
      </div>
    </div>
  );
};

const Flasher = (args) => {
  const [boardId, setBoardId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [boards, setBoards] = useState([]);
  const [boardData, setBoardData] = useState({});

  const [displayBoards, setDisplayBoards] = useState([]);

  const onSearchChange = (e) => {
    const keyword = e.target.value.toLowerCase();
    const filteredBoards = boards.filter(
      (board) =>
        board.name.toLowerCase().includes(keyword) ||
        board.manufacturer.toLowerCase().includes(keyword),
    );
    setDisplayBoards(filteredBoards);
    if (keyword === "") setDisplayBoards(boards);
  };

  const loadBoardData = async (id) => {
    setLoading(true);
    try {
      const [boardObj, markdownText] = await Promise.all([
        fetch(`/boards/${id}/index.json`).then((res) => res.json()),
        fetch(`/boards/${id}/README.md`).then((res) => res.text()),
      ]);
      boardObj.description = markdownText;
      setBoardData(boardObj);
    } catch (err) {
      console.error(`load board: ${id} error`, err);
      setBoardData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get("id");
      if (id) {
        loadBoardData(id);
      }
      setBoardId(id);
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

    fetch(args.boards_path)
      .then((res) => res.json())
      .then((data) => {
        setBoards(data);
        setDisplayBoards(data);
      })
      .catch(() => setBoards([]))
      .finally(() => setLoading(false));

    return () => {
      window.removeEventListener("urlchange", handleUrlChange);
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, []);

  return loading ? (
    <p>Loading boards…</p>
  ) : boardId == null ? (
    <>
      <header>
        <h1>Firmware Hub</h1>
        <input
          type="text"
          placeholder="Search boards..."
          id="board-search"
          onChange={onSearchChange}
        />
      </header>
      <BoardGrid boards={displayBoards} />
      <Monitor />
    </>
  ) : (
    <Board board={boardData} />
  );
};

export default Flasher;
