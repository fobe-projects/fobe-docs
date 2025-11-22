import { ESPLoader, Transport } from "esptool-js";
import React, { useEffect, useRef, useState } from "react";
import {
  FaAngleRight,
  FaArrowLeft,
  FaBolt,
  FaChalkboard,
  FaCheck,
  FaCode,
  FaEraser,
  FaExternalLinkAlt,
  FaSearch,
  FaTerminal,
} from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

import fsBoards from "../../static/boards/boards.json";
import fsFirmwares from "../../static/boards/firmware.json";
import { Dfu } from "./dfu";
import Monitor from "./monitor";
import styles from "./styles.module.css";
import { useFirmwareManager } from "./useFirmwareManager";

const releaseTake = 3;

const BoardGrid = ({ boards, onClick }) => {
  const [showMonitor, setShowMonitor] = useState(false);
  const [displayBoards, setDisplayBoards] = useState([]);

  const openSerialCon = () => {
    setShowMonitor(true);
  };

  const hideMonitor = () => {
    setShowMonitor(false);
  };

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

  useEffect(() => {
    setDisplayBoards(boards);
  }, [boards]);

  return (
    <div>
      <div className={styles.containerHeader}>
        <div className={styles.containerHeaderTitle}>
          <h3>
            <FaBolt />
            Flasher
          </h3>
          <button className={styles.roundedButton} onClick={openSerialCon}>
            <FaTerminal />
            <span>Console</span>
          </button>
          <Monitor show={showMonitor} onClose={hideMonitor} />
        </div>
        <div className={styles.containerHeaderLabel}>
          <h4>Choose device</h4>
        </div>
      </div>

      <div className={styles.boardSearchField}>
        <label
          htmlFor="board-search"
          className={styles.boardSearchIcon}
          aria-hidden
        >
          <FaSearch />
        </label>
        <input
          type="text"
          placeholder="Filter"
          id="board-search"
          onChange={onSearchChange}
          className={styles.boardSearch}
          aria-label="Filter boards"
        />
      </div>

      <ul className={styles.list}>
        {displayBoards.map((board, index) => (
          <li key={index} onClick={() => onClick("BoSel", board)}>
            <button>
              <img
                className={styles.icon}
                title="fobe"
                src={`img/manufacturer/${board.manufacturer}.png`}
              ></img>
              <span>{board.name}</span>
            </button>
            <div className={styles.featureTags}>
              <img
                className={styles.icon}
                src={`/img/features/${board.mcu_manufacturer}.svg`}
              />
              {board.features?.map((feature, idx) => (
                <img
                  key={idx}
                  className={styles.icon}
                  src={`/img/features/${feature}.svg`}
                />
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const FirmwareGrid = ({ firmwares, series, title, onClick }) => {
  return (
    <div>
      <div className={styles.containerHeader}>
        <div className={styles.containerHeaderTitle}>
          <div>
            <button onClick={() => onClick("None")}>
              <FaArrowLeft />
            </button>
            <h3>
              <FaChalkboard />
              {title}
            </h3>
          </div>
        </div>
        <div className={styles.containerHeaderLabel}>
          <h4>Choose firmware</h4>
        </div>
      </div>

      <ul className={styles.list}>
        {Object.entries(firmwares)
          .filter(([_, fw]) => {
            if (series == "nrf52") {
              return fw.packages.some((d) => d === "zip");
            } else if (series == "esp32") {
              return fw.packages.some((d) => d === "bin");
            }
            return false;
          })
          .map(([key, _]) => (
            <li key={key} onClick={() => onClick("FwSel", key)}>
              <button>
                <span>
                  <FaAngleRight />
                </span>
                <span>{fsFirmwares[key].name}</span>
              </button>
              <a
                href={`https://github.com/fobe-projects/${key == "Meshtastic" ? "meshtastic-firmware" : key}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <FaExternalLinkAlt />
              </a>
            </li>
          ))}
      </ul>
    </div>
  );
};

const ReleaseGrid = ({
  firmware,
  board,
  releases,
  onBackward,
  onDfuEnter,
  onFlash,
  onPkgDownload,
}) => {
  // selectorOpts 与 selectedRelease 结构不一样！
  const [selectorOpts, setSelectorOpts] = useState([]);
  const [selectedRelease, setSelectedRelease] = useState({});
  const [packages, setPackages] = useState([]);
  const [erase, setErase] = useState(false);
  const [dfuOK, setDfuOK] = useState(false);

  // 获取第一个 - 之后的内容
  const getDate = (str) => str.split("-")[1] || "";

  const onSelectRelease = (e) => {
    const tag = releases[e.target.selectedOptions[0].dataset.rel];
    setSelectedRelease({ ...tag, value: e.target.value });
  };

  useEffect(() => {
    const boardAscription = board["firmwares"][firmware];
    setPackages(boardAscription["packages"]);

    const boardFwId = boardAscription["id"];
    const selectorOptions = [];
    // 处理 releases：按board过滤，从json解出每日打包版本，加入到select选项列表，并排序列表，限制数量
    releases.forEach((rel, index) => {
      rel.packages
        .filter((d) => {
          if (firmware.toLowerCase() == "meshtastic") {
            return (
              d.startsWith(`firmware-${boardFwId}-`) &&
              d.indexOf("zip") == -1 &&
              d.indexOf("update") == -1
            );
          }
          return d.startsWith(`${boardFwId}-`); // boardID-
        })
        .sort((a, b) => getDate(b).localeCompare(getDate(a)))
        .slice(-releaseTake)
        .forEach((d, idxx) => {
          if (firmware.toLowerCase() == "meshtastic") {
            // firmware-{boardID}-{releaseTag}-{type}.{fSuffix}
            const rel_val = d.slice(d.indexOf(boardFwId) + boardFwId.length);
            const ignore_str_idx = rel_val.lastIndexOf(".");
            selectorOptions.push(
              <option
                key={`${index}-${idxx}`}
                data-rel={index}
                data-type={rel_val.slice(ignore_str_idx)}
                value={rel_val.slice(0, ignore_str_idx)}
              >
                {rel_val.slice(1, ignore_str_idx)}
              </option>,
            );
            return;
          }

          const firstDashIdx = d.indexOf("-");
          const releaseVal =
            firstDashIdx !== -1 ? d.slice(firstDashIdx + 1) : d;
          const ignoreStrIdx = releaseVal.lastIndexOf(".tar.xz");
          // option value: 后面下载固件拼装路径使用
          // "fobe_idea_mesh_tracker_c1-20250916-10.0.0-beta.3-2-gc9d65d14f2.tar.xz"
          // => "20250916-10.0.0-beta.3-2-gc9d65d14f2.tar.xz"
          // option date-rel: 在原 releases 位置
          selectorOptions.push(
            <option
              key={`${index}-${idxx}`}
              data-rel={index}
              value={releaseVal}
            >
              {releaseVal.slice(0, ignoreStrIdx)}
            </option>,
          );
        });
    });
    setSelectorOpts(selectorOptions);

    if (selectorOptions.length > 0) {
      setSelectedRelease({
        ...releases[selectorOptions[0].props["data-rel"]],
        value: selectorOptions[0].props.value,
      });
    }
  }, [releases]);

  useEffect(() => {
    board.dfuOK ? setDfuOK(true) : setDfuOK(false);
  }, [board]);

  return (
    <div>
      <div className={styles.containerHeader}>
        <div className={styles.containerHeaderTitle}>
          <div>
            <button onClick={() => onBackward("BoSel", -1)}>
              <FaArrowLeft />
            </button>
            <h3>
              <FaChalkboard />
              {board.name}
              <FaAngleRight />
              {fsFirmwares[firmware].name}
            </h3>
          </div>
          <div className={styles.iconSelectorNoClose}>
            <select
              id={"pkg-selector"}
              value=""
              onChange={async (e) => {
                const pkgType = e.target.value;
                if (!pkgType) return;
                await onPkgDownload(selectedRelease, pkgType);
              }}
            >
              <option value="" disabled>
                Download
              </option>
              {packages.map((f_type, idx) => (
                <option key={idx} value={f_type}>
                  {f_type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.containerContent}>
          <div className={styles.iconSelectorFloatLabel}>
            <label htmlFor="release-select"> Release</label>
            <select id="release-select" onChange={onSelectRelease}>
              {selectorOpts}
            </select>
          </div>
          <div>
            <b>Release Note</b>
            {selectedRelease.note ? (
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                {selectedRelease.note}
              </ReactMarkdown>
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                *No release note available.*
              </ReactMarkdown>
            )}
          </div>
        </div>
      </div>

      <div className={styles.blockLine} />

      <div className={styles.containerContent}>
        <div className={styles.containerContent}>
          {board.series == "nrf52" ? (
            <button className={styles.roundedButton} onClick={onDfuEnter}>
              {dfuOK ? <FaCheck /> : <FaCode />}
              <span>Enter DFU mode</span>
              <div className={styles.tooltip} role="tooltip">
                Enter DFU mode - this mode enables you to flash your firmware.
                If you did not trigger the DFU mode manually, please click this
                button.
              </div>
            </button>
          ) : null}

          <button className={styles.roundedButton}>
            <FaEraser />
            <label htmlFor="eraseOrNot">Flash with erase</label>
            <input
              type="checkbox"
              id="eraseOrNot"
              checked={erase}
              onChange={(e) => setErase(e.target.checked)}
            />
            <div className={styles.tooltip} role="tooltip">
              Erase your device before Flash operation.
            </div>
          </button>

          <button
            className={styles.roundedButton}
            onClick={() => {
              onFlash("RelSel", selectedRelease, erase);
            }}
          >
            <FaTerminal />
            <span>Flash</span>
            <div className={styles.tooltip} role="tooltip">
              Upload the firmware into your device. Existing firmware will get
              overwritten. If you did not trigger DFU mode manually, use the{" "}
              <b>Enter DFU mode</b> before flashing
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

const Flasher = () => {
  const [view, setView] = useState("Default");
  const [boardData, setBoardData] = useState({});
  const [firmware, setFirmware] = useState("");
  const [releases, setReleases] = useState({});
  const release = useRef(null);
  const boardFwId = useRef(null);
  const erase = useRef(false);

  const [flashStatus, setFlashStatus] = useState("");
  const [progress, setProgress] = useState(0);

  const { fileCache, fetchedPackage, fetchFirmwares } = useFirmwareManager();

  const loadBoardData = async (id) => {
    if (boardData.id == id) {
      return;
    }
    try {
      const [boardObj, markdownText] = await Promise.all([
        fetch(`/boards/${id}/board.json`).then((res) => res.json()),
        fetch(`/boards/${id}/README.md`).then((res) => res.text()),
      ]);
      boardObj.description = markdownText;
      setBoardData(boardObj);
    } catch (err) {
      console.error(`load board: ${id} error`, err);
      setBoardData([]);
    }
  };

  const handleChangeStep = async (type, arg, arg1) => {
    if (type === "BoSel") {
      if (arg == -1) {
        setView("FwSel");
        return;
      }
      await loadBoardData(arg.id);
      setView("FwSel");
    } else if (type === "FwSel") {
      setFirmware(arg);
      boardFwId.current = boardData["firmwares"][arg]["id"];
      setReleases(fsFirmwares[arg].releases);
      setView("RelSel");
    } else if (type === "RelSel") {
      release.current = arg;
      setView("Flash");
      await new Promise((resolve) => setTimeout(resolve, 100));
      erase.current = arg1;
      handleFlash();
    } else {
      setView("Default");
    }
  };

  const handleEnterDfuMode = async () => {
    try {
      await Dfu.forceDfuMode(await navigator.serial.requestPort({}));
      boardData.dfuOK = true;
      setBoardData({ ...boardData });
    } catch (error) {
      console.log(`Force DFU mode ERROR: ${error.message}`);
    }
  };

  const handleFlash = async () => {
    setFlashStatus("Flashing...");
    setProgress(1);

    if (boardData.series == "nrf52") {
      await flashNRF52();
    } else if (boardData.series == "esp32") {
      await flashESP32();
    }
  };

  const flashNRF52 = async () => {
    try {
      const port = await navigator.serial.requestPort({});

      let content;
      if (fetchedPackage.current == `${release.current.pkg}-ota.zip`) {
        content = fileCache.current.get("zip")?.blob;
      }
      if (!content) {
        await fetchFirmwares({
          ascription: firmware,
          boardID: boardFwId.current,
          dir: release.current.dir,
          pkg: release.current.value,
          pkgType: "zip",
        });
        content = fileCache.current.get("zip")?.blob;
      }
      if (!content) throw new Error("No firmware available");

      // const zipData = await response.blob();

      setFlashStatus("Connecting to the device, This may take some time...");

      const dfu = new Dfu(port, erase.current);
      await dfu.dfuUpdate(content, async (progress) => {
        setProgress(progress);
      });
      // Optionally set progress to 100 on complete
      setProgress(100);
      setFlashStatus("Flashed");
    } catch (error) {
      // Optionally handle error (could set progress to 0 or display error)
      setProgress(-1);
      setFlashStatus(error.message);
    }
  };

  const flashESP32 = async () => {
    let transport = null;
    const reset = async () => {
      if (transport) {
        await transport.setRTS(true);
        await transport.setDTR(false);
        await new Promise((resolve) => setTimeout(resolve, 100));
        await transport.setDTR(true);
        await transport.setRTS(false);
        transport.disconnect().catch(() => {});
      }
    };
    try {
      const port = await navigator.serial.requestPort();
      transport = new Transport(port, true);
      const loader = new ESPLoader({
        transport,
        baudrate: 115200,
      });
      await loader.main();
      const targetChip = boardData.mcu;
      if (targetChip != loader.chip.CHIP_NAME) {
        await reset();
        setFlashStatus(
          `Chip not match between target(${targetChip}) and connected device(${loader.chip.CHIP_NAME})! Stop flash!`,
        );
        return;
      }
      let content;
      if (fetchedPackage.current == release.current.pkg) {
        content = fileCache.current.get("bin")?.buffer;
      }
      if (!content) {
        await fetchFirmwares({
          ascription: firmware,
          boardID: boardFwId.current,
          dir: release.current.dir,
          pkg: release.current.value,
        });
        content = fileCache.current.get("bin")?.buffer;
      }
      if (!content) throw new Error("No firmware available");
      let binary = "";
      for (let i = 0; i < content.byteLength; i++) {
        binary += String.fromCharCode(content[i]);
      }
      content = binary;
      await loader.writeFlash({
        fileArray: [
          {
            data: content,
            address: loader.chip.BOOTLOADER_FLASH_OFFSET,
          },
        ],
        flashSize: "keep",
        eraseAll: erase.current,
        compress: true,
        flashMode: "keep",
        flashFreq: "keep",
        reportProgress: (fileIndex, written, total) => {
          const progressPercent = (written / total) * 100;
          setProgress(progressPercent);
        },
      });
      setProgress(100);
      setFlashStatus("Flashed");
      await reset();
    } catch (error) {
      setFlashStatus(error.message);
      setProgress(-1);
    } finally {
      transport && transport.disconnect().catch(() => {});
    }
  };

  const handleDownload = async (selectedRelease, pkgType) => {
    let downloaded = false;
    if (firmware == "meshtastic") {
      downloaded =
        fetchedPackage.current !== `${selectedRelease.value}-${pkgType}`;
    } else {
      downloaded = fetchedPackage.current !== selectedRelease.value;
    }

    if (downloaded) {
      await fetchFirmwares({
        ascription: firmware,
        boardID: boardFwId.current,
        dir: selectedRelease.dir,
        pkg: selectedRelease.value,
        pkgType,
      });
    }
    const f_data = fileCache.current.get(pkgType);
    if (f_data) {
      const tempLink = document.createElement("a");
      tempLink.href = f_data.url;
      tempLink.download = f_data.name;
      tempLink.click();
      tempLink.remove();
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.autoScroller}>
        {view == "Flash" ? (
          <div>
            <div className={styles.containerHeader}>
              <div className={styles.containerHeaderTitle}>
                <div>
                  <button
                    onClick={() => {
                      setView("RelSel");
                    }}
                  >
                    <FaArrowLeft />
                  </button>
                  <h3>
                    <FaChalkboard />
                    {boardData.name}
                    <FaAngleRight />
                    {fsFirmwares[firmware].name}
                  </h3>
                </div>
              </div>
              <div className={styles.containerHeaderLabel}>
                <h5>{flashStatus}</h5>
                <button
                  className={styles.roundedButton}
                  disabled={progress > 0 && progress < 100}
                  onClick={handleFlash}
                >
                  Flash Again
                </button>
              </div>
              <progress
                className={`${styles.flashProgress} ${progress == -1 ? styles.flashProgressError : ""}`}
                value={progress}
                max="100"
              ></progress>
            </div>
          </div>
        ) : view == "RelSel" ? (
          <ReleaseGrid
            firmware={firmware}
            board={boardData}
            releases={releases}
            onBackward={handleChangeStep}
            onDfuEnter={handleEnterDfuMode}
            onFlash={handleChangeStep}
            onPkgDownload={handleDownload}
          />
        ) : view == "FwSel" ? (
          <FirmwareGrid
            firmwares={boardData.firmwares}
            series={boardData.series}
            title={boardData.name}
            onClick={handleChangeStep}
          />
        ) : (
          <BoardGrid boards={fsBoards} onClick={handleChangeStep} />
        )}
      </div>
    </div>
  );
};

export default Flasher;
