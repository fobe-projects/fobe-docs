import React, { useEffect, useState } from "react";
import { FaExternalLinkAlt, FaGithub } from "react-icons/fa";

import { useFirmwareManager } from "../common/useFirmwareManager";
import styles from "./styles.module.css";

const FirmwareCard = ({
  ascription,
  description,
  gitUrl,
  officialUrl,
  boardAscription,
  releases,
  isEsp32,
  onFlashClick,
  release_take = 3,
}) => {
  const [flasherAble, setFlasherAble] = useState(false);

  const [selectedRelease, setSelectRelease] = useState({});
  const [releaseOpts, setReleaseOpts] = useState([]);
  const [serialSupport, setSerialSupport] = useState(false);

  const { fileCache, fetchedPackage, fetchFirmwares, loading } =
    useFirmwareManager();

  const boardID = boardAscription.id;

  const getDate = (str) => str.split("-")[1] || "";

  useEffect(() => {
    const versionOptions = [];
    releases.forEach((rel, index) => {
      rel.packages
        .filter((d) => {
          if (ascription == "Meshtastic") {
            return (
              d.startsWith(`firmware-${boardID}`) &&
              d.indexOf("zip") == -1 &&
              d.indexOf("update") == -1
            );
          }
          return d.startsWith(boardID);
        })
        .sort((a, b) => getDate(b).localeCompare(getDate(a)))
        .slice(-release_take)
        .forEach((d, idxx) => {
          if (ascription == "Meshtastic") {
            const rel_val = d.slice(d.indexOf("-", 9) + 1); // 9 is "firmware-".length
            const ignore_str_idx = rel_val.lastIndexOf(".");
            versionOptions.push(
              <option
                key={`${index}-${idxx}`}
                data-rel={index}
                data-type={rel_val.slice(ignore_str_idx)}
                value={rel_val}
              >
                {rel_val.slice(0, ignore_str_idx)}
              </option>,
            );
            return;
          }

          const firstDashIndex = d.indexOf("-");
          const rel_val =
            firstDashIndex !== -1 ? d.slice(firstDashIndex + 1) : d;
          const ignore_str_idx = rel_val.lastIndexOf(".tar.xz");

          versionOptions.push(
            <option key={`${index}-${idxx}`} data-rel={index} value={rel_val}>
              {rel_val.slice(0, ignore_str_idx)}
            </option>,
          );
        });
    });
    setReleaseOpts(versionOptions);

    if (versionOptions.length > 0) {
      setSelectRelease({
        ...releases[0],
        value: versionOptions[0].props.value,
      });
    }

    setSerialSupport("serial" in navigator);
    if (isEsp32 && boardAscription.packages.some((pg) => pg === "bin")) {
      setFlasherAble(true);
    }
  }, []);

  const onSelectRelease = (e) => {
    const tag = releases[e.target.selectedOptions[0].dataset.rel];
    setSelectRelease({ ...tag, value: e.target.value });
  };

  const handleDownload = async (f_type) => {
    if (fetchedPackage.current !== selectedRelease.value) {
      await fetchFirmwares({
        ascription,
        boardID,
        dir: selectedRelease.dir,
        pkg: selectedRelease.value,
      });
    }
    const f_data = fileCache.current.get(f_type);
    if (f_data) {
      const tempLink = document.createElement("a");
      tempLink.href = f_data.url;
      tempLink.download = f_data.name;
      tempLink.click();
      tempLink.remove();
    }
  };

  const onFlash = () => {
    onFlashClick({
      url: fileCache.current.get("bin")?.url,
      buffer: fileCache.current.get("bin")?.buffer,
      boardID: boardID,
      ascription,
      pkg: selectedRelease.value,
      dir: selectedRelease.dir,
    });
  };

  return (
    <>
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
          <p>Downloading firmware...</p>
        </div>
      )}
      {releaseOpts.length > 0 ? (
        <div className={styles.boardFirmwareContent}>
          <div className={styles.boardFirmwareTitle}>
            <h2>{ascription}</h2>
            <div>
              <a href={gitUrl} target="_blank" rel="noreferrer">
                {" "}
                <FaGithub size={20} />
              </a>
              <a href={officialUrl} target="_blank" rel="noreferrer">
                {" "}
                <FaExternalLinkAlt size={20} />
              </a>
            </div>
          </div>

          <p dangerouslySetInnerHTML={{ __html: description }} />
          <p>
            {ascription.toLowerCase() == "meshtastic" ? null : (
              <small>Last Update: {selectedRelease.updated_at}</small>
            )}
          </p>

          <div className={styles.boardFirmwareNote}>
            <a
              href={`https://github.com/fobe-projects/${ascription == "Meshtastic" ? "meshtastic-firmware" : ascription}/releases/tag/${selectedRelease.dir}`}
              target="_blank"
              rel="noreferrer"
            >
              Release Notes
            </a>

            <div>
              <span>{selectedRelease.tag_name}</span>
              {boardAscription.packages.map((f_type, idx) => (
                <a
                  key={idx}
                  href="#"
                  download
                  onClick={(e) => {
                    e.preventDefault();
                    handleDownload(f_type);
                  }}
                >
                  {f_type}
                </a>
              ))}
            </div>
          </div>
          <div className={styles.boardFirmwareSelect}>
            <select onChange={onSelectRelease}>{releaseOpts}</select>

            {boardAscription.packages.length > 0 ? (
              flasherAble ? (
                serialSupport ? (
                  <button onClick={onFlash}> Flash </button>
                ) : (
                  <button disabled>
                    No serial support.Please use a different browser.
                  </button>
                )
              ) : (
                <button
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDownload(boardAscription.packages[0]);
                  }}
                >
                  Download {boardAscription.packages[0]}
                </button>
              )
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default FirmwareCard;
