import "xterm/css/xterm.css";

import { ESPLoader, Transport } from "esptool-js";
import React, { useEffect, useRef, useState } from "react";

import { useFirmwareManager } from "../common/useFirmwareManager";
import styles from "./styles.module.css";

const EspFlasher = ({ isShow, onClose, packageInfo, targetChip }) => {
  const { fileCache, fetchFirmwares } = useFirmwareManager();

  const terminalRef = useRef(null);
  const termRef = useRef(null);
  const transportRef = useRef(null);

  const [TerminalClass, setTerminalClass] = useState(null);

  const [baudRate, setBaudRate] = useState(115200);
  const [erase, setErase] = useState(false);
  const [flashing, setFlashing] = useState(false);

  const [headerLabel, setHeaderLabel] = useState("");

  useEffect(() => {
    import("xterm").then((mod) => {
      setTerminalClass(() => mod.Terminal);
    });
  }, []);

  useEffect(() => {
    if (isShow && TerminalClass && terminalRef.current && !termRef.current) {
      const term = new TerminalClass({ convertEol: true });
      term.open(terminalRef.current);
      termRef.current = term;
      termRef.current.clear();
    }
    if (packageInfo.pkg) {
      const ignore_str_idx = packageInfo.pkg.lastIndexOf(".tar.xz");
      setHeaderLabel(
        `${packageInfo.ascription} - ${packageInfo.pkg.slice(0, ignore_str_idx)}`,
      );
    }

    return () => {
      if (!isShow) {
        if (transportRef.current) {
          transportRef.current.disconnect().catch(() => {});
          transportRef.current = null;
        }
        termRef.current = null;
      }
    };
  }, [isShow, TerminalClass]);

  const closeModal = () => {
    if (transportRef.current) {
      transportRef.current.disconnect().catch(() => {});
      transportRef.current = null;
    }
    if (onClose) onClose();
  };

  const uint8ArrayToBinaryString = (bytes) => {
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return binary;
  };

  const flashESP32 = async () => {
    setFlashing(true);
    const term = termRef.current;
    term.clean = term.clear;
    term.writeLine = term.writeln;

    try {
      // 请求串口
      const port = await navigator.serial.requestPort();
      const transport = new Transport(port, true);
      transportRef.current = transport;

      const loader = new ESPLoader({
        transport,
        baudrate: baudRate,
        terminal: term,
      });

      term.writeln("Preparing firmware...");

      await loader.main();

      if (targetChip != loader.chip.CHIP_NAME) {
        console.log(
          "chip not match between",
          targetChip,
          loader.chip.CHIP_NAME,
        );
        term.writeln(
          `Chip not match between target(${targetChip}) and connected device(${loader.chip.CHIP_NAME})! Stop flash!`,
        );
        await transportRef.current.disconnect();
        return;
      }

      let content = packageInfo.buffer;
      if (!content) content = fileCache.current.get("bin")?.buffer;
      if (!content) {
        // trigger download firmware
        await fetchFirmwares({
          ascription: packageInfo.ascription,
          boardID: packageInfo.boardID,
          dir: packageInfo.dir,
          pkg: packageInfo.pkg,
        });
        content = fileCache.current.get("bin")?.buffer;
      }

      if (!content) throw new Error("No firmware available");

      content = uint8ArrayToBinaryString(content);

      term.writeln("Starting flash...");

      await loader.writeFlash({
        fileArray: [
          {
            data: content,
            address: loader.chip.BOOTLOADER_FLASH_OFFSET,
          },
        ],
        flashSize: "keep",
        eraseAll: erase,
        compress: true,
        flashMode: "keep",
        flashFreq: "keep",
        reportProgress: (fileIndex, written, total) => {
          if (written === total) {
            term.writeln("Done flashing!");
          }
        },
      });

      term.writeln("Flash finished. Disconnecting device.");
      await transportRef.current.setRTS(true);
      await new Promise((resolve) => setTimeout(resolve, 100));
      await transportRef.current.setRTS(false);
      await transportRef.current.disconnect();
      transportRef.current = null;
    } catch (error) {
      term.writeln(`FLASH ERROR: ${error.message}`);
    } finally {
      setFlashing(false);
    }
  };

  return (
    <>
      {isShow && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{headerLabel}</h3>
              <span className={styles.closeButton} onClick={closeModal}>
                &times;
              </span>
            </div>

            <div className={styles.modalBody}>
              <div>
                <label>
                  Baud Rate:
                  <select
                    value={baudRate}
                    onChange={(e) => setBaudRate(Number(e.target.value))}
                  >
                    <option value={115200}>115200</option>
                    <option value={230400}>230400</option>
                    <option value={460800}>460800</option>
                    <option value={921600}>921600</option>
                  </select>
                </label>

                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={erase}
                    onChange={(e) => setErase(e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                  <span className={styles.labelText}>Perform full erase</span>
                </label>
              </div>

              <button onClick={flashESP32} disabled={flashing}>
                {flashing ? "Flashing... ⏳" : "Start flash"}
              </button>

              <div ref={terminalRef} className={styles.terminal} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EspFlasher;
