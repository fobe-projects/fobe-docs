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
                  <img
                    src="https://circuitpython.org/assets/images/boards/large/raspberry_pi_pico.jpg"
                    alt="Image of Board"
                    loading="lazy"
                  />
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
  const [description, setMarkdown] = useState("");
  const [board_attr, setBoards] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetch(`${path}/index.json`).then((res) => res.json()),
      fetch(`${path}/README.md`).then((res) => res.text()),
    ])
      .then(([boardsData, markdownText]) => {
        setBoards(boardsData);
        setMarkdown(markdownText);
        console.log("boards / markdown loaded");
      })
      .catch((err) => {
        console.error("加载失败", err);
        setBoards([]);
        setMarkdown("");
      })
      .finally(() => setLoading(false));
  }, [path]);

  if (loading) {
    return <p>Loading boards…</p>;
  }

  return (
    <div className={styles.board}>
      <div className={styles.boardDescription}>
        <div className={styles.boardDescriptionImage}>
          <img src={board_attr.image} alt={board_attr.name} loading="lazy" />
          <h1>{board_attr.name}</h1>
        </div>
        <div className={styles.boardDescriptionContent}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {description}
          </ReactMarkdown>
        </div>
      </div>

      {board_attr.circuitpython.enabled ? (
        <div className={styles.boardFirmware}>
          <div className={styles.boardFirmwareContent}>
            <div className={styles.boardFirmwareTitle}>
              <h2>CircuitPython</h2>
              <div>
                <a>
                  {" "}
                  <FaGithub size={20} />
                </a>
                <a>
                  {" "}
                  <FaExternalLinkAlt size={20} />
                </a>
              </div>
            </div>

            <p>
              CircuitPython is a programming language designed to simplify
              experimenting and learning to code on low-cost microcontroller
              boards, This is the firmware of CircuitPython that will work with
              the <b>{board_attr.name}</b> Board.
            </p>
            <p>
              <small>Last Update: 2025-01-01</small>
            </p>

            <div className={styles.boardFirmwareNote}>
              <a>Release Notes for 9.2.8</a>
              <div>
                <a>[.bin]</a>
                <a>[.uf2]</a>
              </div>
            </div>
            <div className={styles.boardFirmwareSelect}>
              <select>
                <option value="v1.0.0">ENGLISH</option>
                <option value="v2.0.0">CHINESE (PINYIN)</option>
              </select>
              <select>
                <option value="v1.0.0">v1.0.0</option>
                <option value="v1.1.0">v1.1.0</option>
                <option value="v2.0.0">v2.0.0</option>
              </select>
              <button>Flash</button>
            </div>
          </div>
        </div>
      ) : null}
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
