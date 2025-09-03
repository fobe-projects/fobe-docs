import React, { useEffect, useState } from "react";
import { FaExternalLinkAlt, FaGithub } from "react-icons/fa";

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
  const [downLinks, setDownLinks] = useState([]);
  const [targetLink, setTargetLink] = useState("");
  const [flasherAble, setFlasherAble] = useState(false);

  const [selectedRelease, setSelectRelease] = useState({});
  const [selectedVariant, setSelectVariant] = useState("");

  const [variantOpts, setVariantOpts] = useState([]);
  const [releaseOpts, setReleaseOpts] = useState([]);

  useEffect(() => {
    updateUrls();
  }, [selectedRelease, selectedVariant]);

  useEffect(() => {
    setReleaseOpts(
      releases.map((pkg, index) => (
        <option
          key={index}
          value={pkg.tag_name}
          data-updated_at={pkg.updated_at}
          data-date_fm={pkg.date_fm}
          data-release_url={pkg.html_url}
        >
          {pkg.tag_name}
        </option>
      )),
    );

    setVariantOpts(
      boardAscription.variants
        ? boardAscription.variants.map((variant, index) => (
            <option key={index} value={variant}>
              {variant}
            </option>
          ))
        : [],
    );

    setSelectRelease({
      release: releases[0].tag_name,
      updated_at: releases[0].updated_at,
      date_fm: releases[0].date_fm,
      release_url: releases[0].html_url,
    });

    if (boardAscription.variants) setSelectVariant(boardAscription.variants[0]);
  }, []);

  const updateUrls = () => {
    // https://github.com/fobe-projects/micropython/releases/download/v1.26.0/FOBE_QUILL_ESP32S3_MESH-20250902-v1.26.0.bin
    let base_url = "";
    if (ascription.toLowerCase() === "micropython") {
      base_url = `/api/github/fobe-projects/micropython/releases/download/${selectedRelease.release}/${boardAscription.id}-${selectedRelease.date_fm}-${selectedRelease.release}`;
    } else if (ascription.toLowerCase() === "circuitpython") {
      //todo
      base_url = `/api/github/fobe-projects/circuitpython/releases/download/${selectedRelease.release}/${boardAscription.id}-${selectedRelease.date_fm}-${selectedRelease.release}`;
    }
    console.log(ascription, base_url);

    let tarLink = "";
    const dls = boardAscription.package.map((f_type) => {
      const res = {
        f_type,
        url: `${base_url}.${f_type}`,
      };

      if (isEsp32 && f_type == "bin") {
        tarLink = res.url;
        setFlasherAble(true);
      }

      return res;
    });
    setDownLinks(dls);
    console.log(dls);

    if (tarLink.length <= 0) {
      tarLink = dls[0].url;
    }
    console.log("target link", tarLink);
    setTargetLink(tarLink);
  };

  const onFlash = () => {
    onFlashClick({
      title: `${ascription} - ${selectedVariant.length > 0 ? selectedVariant + " - " : ""}${selectedRelease.release}`,
      url: targetLink,
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
          <span>{selectedRelease.release}</span>
          {downLinks.map((dl, idx) => (
            <a key={idx} href={dl.url} download>
              {" "}
              {dl.f_type}{" "}
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

        <select
          onChange={(e) => {
            setSelectRelease({
              release: e.target.value,
              updated_at: e.target.selectedOptions[0].dataset.updated_at,
              date_fm: e.target.selectedOptions[0].dataset.date_fm,
              release_url: e.target.selectedOptions[0].dataset.release_url,
            });
          }}
        >
          {releaseOpts}
        </select>

        {flasherAble ? (
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
