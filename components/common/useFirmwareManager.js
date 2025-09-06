import { useRef } from "react";
import tar from "tar-stream";
import { XzReadableStream } from "xz-decompress";

// hook for download firmware and decompressed

export function useFirmwareManager() {
  const fileCache = useRef(new Map());
  const fetchedPackage = useRef("");

  const fetchFirmwares = async ({ ascription, selectedRelease, boardID }) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let firmware_url = "";
          let domain = "https://github.com";
          // domain = "/api/github";
          if (ascription.toLowerCase() === "micropython") {
            firmware_url = `${domain}/fobe-projects/micropython/releases/download/${selectedRelease.tag_name}/${boardID}-${selectedRelease.date_fm}-${selectedRelease.build}.tar.xz`;
          } else if (ascription.toLowerCase() === "circuitpython") {
            firmware_url = `${domain}/fobe-projects/circuitpython/releases/download/${selectedRelease.tag_name}/${boardID}-${selectedRelease.date_fm}-${selectedRelease.build}.tar.xz`;
          } else if (ascription.toLowerCase() === "meshtastic") {
            // TODO 目前还没有真实路径参考修改，组成规则可能不同
            firmware_url = `${domain}/fobe-projects/meshtastic-firmware/releases/download/${selectedRelease.tag_name}/${boardID}-${selectedRelease.date_fm}-${selectedRelease.build}.tar.xz`;
          }

          const response = await fetch(firmware_url, {
            headers: {
              Accept: "application/vnd.github.v3+json",
              "Access-Control-Allow-Origin": "*",
            },
          });
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
        }
      })();
    });
  };

  return { fileCache, fetchedPackage, fetchFirmwares };
}
