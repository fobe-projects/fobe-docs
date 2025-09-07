import { useRef, useState } from "react";
import tar from "tar-stream";
import { XzReadableStream } from "xz-decompress";

// hook for download firmware and decompressed

export function useFirmwareManager() {
  const fileCache = useRef(new Map());
  const fetchedPackage = useRef("");
  const [loading, setLoading] = useState(false);

  const fetchFirmwares = async ({ ascription, selectedRelease, boardID }) => {
    return new Promise((resolve, reject) => {
      (async () => {
        setLoading(true);
        try {
          let firmware_url =
            "https://raw.githubusercontent.com/fobe-projects/fobe-projects.github.io/refs/heads/main/firmwares";
          if (ascription.toLowerCase() === "micropython") {
            firmware_url = `${firmware_url}/micropython/${boardID}-${selectedRelease.date_fm}-${selectedRelease.build}.tar.xz`;
          } else if (ascription.toLowerCase() === "circuitpython") {
            firmware_url = `${firmware_url}/circuitpython/${boardID.toLowerCase()}-${selectedRelease.date_fm}-${selectedRelease.build}.tar.xz`;
          } else if (ascription.toLowerCase() === "meshtastic") {
            firmware_url = `${firmware_url}/meshtastic/${boardID}-${selectedRelease.date_fm}-${selectedRelease.build}.tar.xz`;
          }

          const response = await fetch(firmware_url);
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

              console.log(`decompressed file: ${header.name}`);
              let f_type = "";
              if (header.name.endsWith(".bin")) f_type = "bin";
              else if (header.name.endsWith(".hex")) f_type = "hex";
              else if (header.name.endsWith(".uf2")) f_type = "uf2";
              else if (header.name.endsWith(".elf")) f_type = "elf";

              const blob = new Blob([fileBuffer], {
                type: "application/octet-stream",
              });
              const url = URL.createObjectURL(blob);

              fileCache.current.set(f_type, {
                name: header.name.split("/").pop(),
                url,
                buffer: fileBuffer,
              });
              next();
            });
            stream.resume();
          });

          extract.on("finish", () => {
            fetchedPackage.current = selectedRelease.build;
            resolve(fileCache.current);
          });

          extract.end(new Uint8Array(decompressedArrayBuffer));
        } catch (err) {
          reject(err);
        } finally {
          setLoading(false);
        }
      })();
    });
  };

  return { fileCache, fetchedPackage, fetchFirmwares, loading };
}
