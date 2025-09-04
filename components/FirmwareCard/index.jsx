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
}) => {
  const [flasherAble, setFlasherAble] = useState(false);

  const [selectedRelease, setSelectRelease] = useState({});
  const [selectedVariant, setSelectVariant] = useState("");

  const [variantOpts, setVariantOpts] = useState([]);
  const [releaseOpts, setReleaseOpts] = useState([]);

  const { fileCache, fetchedPackage, fetchFirmwares } = useFirmwareManager();

  useEffect(() => {
    const verOpts = [];
    releases.forEach((ver, index) => {
      if (ver.assets.some((ass) => ass.startsWith(boardAscription.id))) {
        verOpts.push(
          <option key={index} value={ver.build}>
            {ver.build}
          </option>,
        );
      }
    });
    setReleaseOpts(verOpts);

    setVariantOpts(
      boardAscription.variants
        ? boardAscription.variants.map((variant, index) => (
            <option key={index} value={variant}>
              {variant}
            </option>
          ))
        : [],
    );

    if (releases && releases.length > 0) {
      setSelectRelease({
        tag_name: releases[0].tag_name,
        build: releases[0].build,
        prerelease: releases[0].prerelease,
        updated_at: releases[0].updated_at,
        date_fm: releases[0].date_fm,
        release_url: releases[0].html_url,
      });
    }

    if (boardAscription.variants) setSelectVariant(boardAscription.variants[0]);

    if (isEsp32 && boardAscription.packages.some((pg) => pg === "bin")) {
      setFlasherAble(true);
    }

    console.log(selectedVariant); // workless feature, not use yet.
  }, []);

  const onSelectRelease = (e) => {
    const tag = releases[e.target.selectedIndex];
    setSelectRelease({
      tag_name: tag.tag_name,
      build: tag.build,
      prerelease: tag.prerelease,
      updated_at: tag.updated_at,
      date_fm: tag.date_fm,
      release_url: tag.html_url,
    });
  };

  const handleDownload = async (f_type) => {
    if (fetchedPackage.current !== selectedRelease.build) {
      const boardID = boardAscription.id;
      await fetchFirmwares({ ascription, selectedRelease, boardID });
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
      url: fileCache.current.get("bin")?.url, // 传给 flasher
      buffer: fileCache.current.get("bin")?.buffer, // 直接 Uint8Array，也可以传
      boardID: boardAscription.id,
      ascription,
      selectedRelease,
    });
  };

  return (
    <>
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
            <small>Last Update: {selectedRelease.updated_at}</small>
          </p>

          <div className={styles.boardFirmwareNote}>
            <a
              href={`${selectedRelease.release_url}`}
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
            {variantOpts.length > 0 ? (
              <select onChange={(e) => setSelectVariant(e.target.value)}>
                {variantOpts}
              </select>
            ) : null}

            <select onChange={onSelectRelease}>{releaseOpts}</select>

            {boardAscription.packages.length > 0 ? (
              flasherAble ? (
                <button onClick={onFlash}> Flash </button>
              ) : (
                <a
                  href="#"
                  download
                  onClick={(e) => {
                    e.preventDefault();
                    handleDownload(boardAscription.packages[0]);
                  }}
                >
                  Download {boardAscription.packages[0]}
                </a>
              )
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default FirmwareCard;
