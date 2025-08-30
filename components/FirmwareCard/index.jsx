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
  const [binLink, setBinLink] = useState("");
  const [uf2Link, setUf2Link] = useState("");
  const [targetLink, setTargetLink] = useState("");

  const [selectedVersion, setSelectVersion] = useState({});
  const [selectedVariant, setSelectVariant] = useState("");

  const [variantOpts, setVariantOpts] = useState([]);
  const [variantVers, setVariantVers] = useState([]);

  useEffect(() => {
    updateUrls();
  }, [selectedVersion, selectedVariant]);

  useEffect(() => {
    const versionOptions = [];
    boardAscription.packages.forEach((pkg, index) => {
      if (pkg.variants && pkg.variants.length > 0) {
        setVariantOpts(
          pkg.variants.map((variant, vIndex) => (
            <option key={vIndex} value={variant}>
              {variant}
            </option>
          )),
        );
      }

      versionOptions.push(
        <option
          key={index}
          value={pkg.version}
          data-bin={pkg.bin}
          data-uf2={pkg.uf2}
        >
          {pkg.version}
        </option>,
      );
    });
    setVariantVers(versionOptions);

    setSelectVersion({
      version: boardAscription.packages[0].version,
      bin: boardAscription.packages[0].bin,
      uf2: boardAscription.packages[0].uf2,
    });
    if (boardAscription.packages[0].variants)
      setSelectVariant(boardAscription.packages[0].variants[0]);
  }, []);

  const updateUrls = () => {
    const url = `xxx/xxx/xxx/${boardAscription.id}/${selectedVariant.length > 0 ? selectedVariant + "-" : ""}${selectedVersion.version}`; // TODO
    console.log(ascription, url);

    const pkgUrl =
      "/temp/adafruit-circuitpython-makergo_esp32c3_supermini-en_x_pirate-9.2.8";
    setBinLink(`${pkgUrl}.bin`);
    setUf2Link(`${pkgUrl}.uf2`);
    setTargetLink(binLink);
  };

  const onFlash = () => {
    onFlashClick({
      title: `${ascription} - ${selectedVariant.length > 0 ? selectedVariant + " - " : ""}${selectedVersion.version}`,
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
        {variantOpts.length > 0 ? (
          <select onChange={(e) => setSelectVariant(e.target.value)}>
            {variantOpts}
          </select>
        ) : null}

        <select
          onChange={(e) => {
            setSelectVersion({
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
          {variantVers}
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
