import React, { useEffect, useState } from "react";
import { FaExternalLinkAlt, FaGithub } from "react-icons/fa";

import styles from "./styles.module.css";

const FirmwareCard = ({
  ascription,
  description,
  gitUrl,
  officialUrl,
  releaseNoteUrl,
  boardAscription,
  isEsp32,
  onFlashClick,
}) => {
  const [selectedVersion, setSelectVersion] = useState({});
  const [binLink, setBinLink] = useState("");
  const [uf2Link, setUf2Link] = useState("");
  const [targetLink, setTargetLink] = useState("");

  useEffect(() => {
    selectVersion(boardAscription.packages[0]);
  }, []);

  const selectVersion = ({ version, bin, uf2 }) => {
    setSelectVersion({ version, bin, uf2 });

    // TODO
    const pkgUrl =
      "/temp/adafruit-circuitpython-makergo_esp32c3_supermini-en_x_pirate-9.2.8";
    setBinLink(`${pkgUrl}.bin`);
    setUf2Link(`${pkgUrl}.uf2`);
    setTargetLink(binLink);
  };

  const onSelectVersion = (e) => {
    selectVersion({
      version: e.target.value,
      bin: e.target.selectedOptions[0].dataset.bin.toLowerCase() === "true",
      uf2: e.target.selectedOptions[0].dataset.uf2.toLowerCase() === "true",
    });
  };

  const onFlash = () => {
    onFlashClick({
      title: `${ascription} - ${selectedVersion.version}`,
      url: binLink,
    });
  };

  return (
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
        <small>Last Update: {boardAscription.last_update}</small>
      </p>

      <div className={styles.boardFirmwareNote}>
        <a
          href={`${releaseNoteUrl}/${selectedVersion.version}`}
          target="_blank"
          rel="noreferrer"
        >
          Release Notes
        </a>
        <div>
          <span>{selectedVersion.version}</span>
          {selectedVersion.bin ? (
            <a href={binLink} download>
              {" "}
              bin{" "}
            </a>
          ) : null}
          {selectedVersion.uf2 ? (
            <a href={uf2Link} download>
              {" "}
              uf2{" "}
            </a>
          ) : null}
        </div>
      </div>
      <div className={styles.boardFirmwareSelect}>
        <select onChange={onSelectVersion}>
          {boardAscription.packages.map((pkg, index) => (
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

        {isEsp32 && selectedVersion.bin ? (
          <button onClick={onFlash}> Flash </button>
        ) : (
          <a href={targetLink} download>
            {" "}
            Download{" "}
          </a>
        )}
      </div>
    </div>
  );
};

export default FirmwareCard;
