import EspFlasher from "@site/components/EspFlasher";
import React, { useEffect, useState } from "react";
import { FaExternalLinkAlt, FaGithub } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  const [selectedCpyVer, setSelectCpyVer] = useState({});
  const [selectedMpyVer, setSelectMpyVer] = useState({});

  const [showFlasher, setShowFlasher] = useState(false);
  const [flasherInfo, setFlasherInfo] = useState({});

  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetch(`${path}/index.json`).then((res) => res.json()),
      fetch(`${path}/README.md`).then((res) => res.text()),
    ])
      .then(([boardsData, markdownText]) => {
        setBoardAttr(boardsData);
        setSelectCpyVer({
          version: boardsData.circuitpython.packages[0].version,
          bin: boardsData.circuitpython.packages[0].bin,
          uf2: boardsData.circuitpython.packages[0].uf2,
        });
        setSelectMpyVer({
          version: boardsData.micropython.packages[0].version,
          bin: boardsData.micropython.packages[0].bin,
          uf2: boardsData.micropython.packages[0].uf2,
        });
        setDescription(markdownText);
        console.log("boards / markdown loaded");
      })
      .catch((err) => {
        console.error("加载失败", err);
        setBoardAttr([]);
        setDescription("");
      })
      .finally(() => setLoading(false));
  }, [path]);

  if (loading) {
    return <p>Loading boards…</p>;
  }

  const openFlasher = ({ ascription, version, url }) => {
    setShowFlasher(true);
    setFlasherInfo({
      ascription: ascription,
      version: version,
      url: url,
    });
  };

  console.log(boardAttr);
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
        {boardAttr.circuitpython.enabled ? (
          <div className={styles.boardFirmwareContent}>
            <div className={styles.boardFirmwareTitle}>
              <h2>CircuitPython</h2>
              <div>
                <a
                  href="https://github.com/adafruit/circuitpython"
                  target="_blank" rel="noreferrer"
                >
                  {" "}
                  <FaGithub size={20} />
                </a>
                <a href="https://circuitpython.org/" target="_blank" rel="noreferrer">
                  {" "}
                  <FaExternalLinkAlt size={20} />
                </a>
              </div>
            </div>

            <p>
              CircuitPython is a programming language designed to simplify
              experimenting and learning to code on low-cost microcontroller
              boards, This is the firmware of CircuitPython that will work with
              the <b>{boardAttr.name}</b> Board.
            </p>
            <p>
              <small>Last Update: {boardAttr.circuitpython.last_update}</small>
            </p>

            <div className={styles.boardFirmwareNote}>
              <a
                href={`https://github.com/adafruit/circuitpython/releases/tag/${selectedCpyVer.version}`}
                target="_blank" rel="noreferrer"
              >
                Release Notes
              </a>
              <div>
                <span>{selectedCpyVer.version}</span>
                {/* TODO */}
                {selectedCpyVer.bin ? (
                  <a href="" download>
                    bin
                  </a>
                ) : null}
                {selectedCpyVer.uf2 ? (
                  <a href="" download>
                    uf2
                  </a>
                ) : null}
              </div>
            </div>
            <div className={styles.boardFirmwareSelect}>
              <select
                onChange={(e) => {
                  setSelectCpyVer({
                    version: e.target.value,
                    bin:
                      e.target.selectedOptions[0].dataset.bin.toLowerCase() ===
                      "true",
                    uf2:
                      e.target.selectedOptions[0].dataset.uf2.toLowerCase() ===
                      "true",
                  });
                }}
              >
                {boardAttr.circuitpython.packages.map((pkg, index) => (
                  <option
                    key={index}
                    value={pkg.version}
                    data-bin={pkg.bin}
                    data-uf2={pkg.uf2}
                  >
                    {pkg.version}
                  </option>
                ))}
              </select>

              {boardAttr.mcu.toLowerCase().includes("esp32") &&
              selectedCpyVer.bin ? (
                <button
                  onClick={() =>
                    openFlasher({
                      ascription: "Circuitpython",
                      version: selectedCpyVer.version,
                      url: "/temp/adafruit-circuitpython-makergo_esp32c3_supermini-en_x_pirate-9.2.8.bin",
                    })
                  }
                >
                  Flash
                </button>
              ) : (
                // TODO
                <a
                  href="/temp/adafruit-circuitpython-makergo_esp32c3_supermini-en_x_pirate-9.2.8.bin"
                  download
                >
                  Download
                </a>
              )}
            </div>
          </div>
        ) : null}

        {boardAttr.micropython.enabled ? (
          <div className={styles.boardFirmwareContent}>
            <div className={styles.boardFirmwareTitle}>
              <h2>Micropython</h2>
              <div>
                <a
                  href="https://github.com/micropython/micropython"
                  target="_blank" rel="noreferrer"
                >
                  {" "}
                  <FaGithub size={20} />
                </a>
                <a href="https://micropython.org/" target="_blank" rel="noreferrer">
                  {" "}
                  <FaExternalLinkAlt size={20} />
                </a>
              </div>
            </div>

            <p>
              Micropython is a programming language designed to simplify
              experimenting and learning to code on low-cost microcontroller
              boards, This is the firmware of Micropython that will work with
              the <b>{boardAttr.name}</b> Board.
            </p>
            <p>
              <small>Last Update: {boardAttr.micropython.last_update}</small>
            </p>

            <div className={styles.boardFirmwareNote}>
              <a
                href={`https://github.com/micropython/micropython/releases/tag/${selectedMpyVer.version}`}
                target="_blank" rel="noreferrer"
              >
                Release Notes
              </a>
              <div>
                <span>{selectedMpyVer.version}</span>
                {/* TODO */}
                {selectedMpyVer.bin ? (
                  <a href="" download>
                    bin
                  </a>
                ) : null}
                {selectedMpyVer.uf2 ? (
                  <a href="" download>
                    uf2
                  </a>
                ) : null}
              </div>
            </div>
            <div className={styles.boardFirmwareSelect}>
              <select
                onChange={(e) => {
                  setSelectMpyVer({
                    version: e.target.value,
                    bin:
                      e.target.selectedOptions[0].dataset.bin.toLowerCase() ===
                      "true",
                    uf2:
                      e.target.selectedOptions[0].dataset.uf2.toLowerCase() ===
                      "true",
                  });
                }}
              >
                {boardAttr.micropython.packages.map((pkg, index) => (
                  <option
                    key={index}
                    value={pkg.version}
                    data-bin={pkg.bin}
                    data-uf2={pkg.uf2}
                  >
                    {pkg.version}
                  </option>
                ))}
              </select>

              {boardAttr.mcu.toLowerCase().includes("esp32") &&
              selectedMpyVer.bin ? (
                <button
                  onClick={() => {
                    openFlasher({
                      ascription: "Micropython",
                      version: selectedCpyVer.version,
                      url: "/temp/adafruit-circuitpython-makergo_esp32c3_supermini-en_x_pirate-9.2.8.bin",
                    });
                  }}
                >
                  Flash
                </button>
              ) : (
                // TODO
                <a
                  href="/temp/adafruit-circuitpython-makergo_esp32c3_supermini-en_x_pirate-9.2.8.bin"
                  download
                >
                  Download
                </a>
              )}
            </div>
          </div>
        ) : null}

        <EspFlasher
          isShow={showFlasher}
          onClose={() => setShowFlasher(false)}
          packageInfo={flasherInfo}
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
    <BoardGrid path={args.boards_path} />
  ) : (
    <Board path={`/boards/${id}`} />
  );
};

export default Flasher;
