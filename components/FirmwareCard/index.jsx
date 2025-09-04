import React, { useEffect, useRef,useState } from "react";
import { FaExternalLinkAlt, FaGithub } from "react-icons/fa";
import tar from "tar-stream";
import { XzReadableStream } from "xz-decompress";

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

  const fileCache = useRef(new Map());
  const fetched_package = useRef("");

  useEffect(() => {
    setReleaseOpts(
      releases.map((pkg, index) => (
        <option key={index} value={pkg.build}>
          {pkg.build}
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
      tag_name: releases[0].tag_name,
      build: releases[0].build,
      prerelease: releases[0].prerelease,
      updated_at: releases[0].updated_at,
      date_fm: releases[0].date_fm,
      release_url: releases[0].html_url,
    });

    if (boardAscription.variants) setSelectVariant(boardAscription.variants[0]);

    if (isEsp32 && boardAscription.packages.some((pg) => pg === "bin")) {
      setFlasherAble(true);
    }
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
    if (fetched_package.current != selectedRelease.build) {
      await fetch_firmwares();
    }
    const f_data = fileCache.current.get(f_type);
    if (f_data) {
      const tempLink = document.createElement("a");
      tempLink.href = f_data.url;
      tempLink.download = f_data.name;
      document.body.appendChild(tempLink);
      tempLink.click();
      tempLink.remove();
    }
  };

  const fetch_firmwares = async () => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let fireware_url = "";
          if (ascription.toLowerCase() === "micropython") {
            fireware_url = `/api/github/fobe-projects/micropython/releases/download/${selectedRelease.tag_name}/${boardAscription.id}-${selectedRelease.date_fm}-${selectedRelease.build}.tar.xz`;
          }
          console.log(ascription, fireware_url);

          const response = await fetch(fireware_url);
          if (!response.ok) {
            throw new Error(`Download error: ${response.status}`);
          }

          const decompressedResponse = new Response(
            new XzReadableStream(response.body),
          );
          const decompressedArrayBuffer =
            await decompressedResponse.arrayBuffer();

          const extract = tar.extract();

          extract.on("entry", (header, stream, next) => {
            const chunks = [];
            stream.on("data", (chunk) => chunks.push(chunk));
            stream.on("end", () => {
              const size = chunks.reduce((acc, cur) => acc + cur.length, 0);
              const fileBuffer = new Uint8Array(size);
              let offset = 0;
              for (const chunk of chunks) {
                fileBuffer.set(chunk, offset);
                offset += chunk.length;
              }

              let f_type = "";
              if (header.name.endsWith(".bin")) f_type = "bin";
              else if (header.name.endsWith(".hex")) f_type = "hex";
              else if (header.name.endsWith(".uf2")) f_type = "uf2";
              else if (header.name.endsWith(".elf")) f_type = "elf";
              else if (header.name.endsWith(".app-bin")) f_type = "app-bin";

              const blob = new Blob([fileBuffer], {
                type: "application/octet-stream",
              });
              const url = URL.createObjectURL(blob);

              fileCache.current.set(f_type, { name: header.name, url });
              next();
            });
            stream.resume();
          });

          extract.on("finish", () => {
            fetched_package.current = selectedRelease.build;
            resolve();
          });

          extract.end(new Uint8Array(decompressedArrayBuffer));
        } catch (err) {
          console.error("Decompressed has error:", err);
          reject(err);
        }
      })();
    });
  };

  const onFlash = async () => {
    await handleDownload("-");
    onFlashClick({
      title: `${ascription} - ${selectedVariant.length > 0 ? selectedVariant + " - " : ""}${selectedRelease.build}`,
      url: fileCache.current.get("bin"),
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

        {flasherAble ? (
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
        )}
      </div>
    </div>
  );
};

export default FirmwareCard;
