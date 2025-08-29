import "xterm/css/xterm.css";

import { ESPLoader, Transport } from "esptool-js";
import React, { useEffect, useRef, useState } from "react";

import styles from "./styles.module.css";

const EspFlasher = ({ isShow, onClose, packageInfo }) => {
  const terminalRef = useRef(null);
  const termRef = useRef(null);
  const transportRef = useRef(null);

  const [TerminalClass, setTerminalClass] = useState(null);

  const [baudRate, setBaudRate] = useState(115200);
  const [erase, setErase] = useState(false);
  const [firmwareContent, setFirmwareContent] = useState(null);
  const [flashing, setFlashing] = useState(false);

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
    return () => {
      if (!isShow) {
        if (transportRef.current) {
          transportRef.current.disconnect().catch(() => {});
          transportRef.current = null;
        }
        termRef.current = null;
        setFirmwareContent(null);
      }
    };
  }, [isShow, TerminalClass]);

  useEffect(() => {
    console.log(packageInfo);
    fetchBinaryContent(packageInfo.url);
  }, [packageInfo]);

  const closeModal = () => {
    setFirmwareContent(null);
    if (transportRef.current) {
      transportRef.current.disconnect().catch(() => {});
      transportRef.current = null;
    }
    if (onClose) onClose();
  };

  const fetchBinaryContent = async (firmwareUrl) => {
    try {
      const response = await fetch(firmwareUrl);
      if (!response.ok) {
        throw new Error(`Failed to load file: ${firmwareUrl}`);
      }
      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();

      // Efficiently convert ArrayBuffer to a binary string
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      setFirmwareContent(binary);
      return binary;
    } catch (error) {
      throw new Error(`Error loading binary content: ${error.message}`);
    }
  };

  const flashESP32 = async () => {
    if (!firmwareContent) {
      termRef.current.writeln("ERROR: No firmware selected.");
      return;
    }

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

      term.writeln("Starting flash...");

      await loader.main();

      await loader.writeFlash({
        fileArray: [
          {
            data: firmwareContent,
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
      await transport.setRTS(true);
      await new Promise((resolve) => setTimeout(resolve, 100));
      await transport.setRTS(false);
      await transport.disconnect();
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
              <h3>{packageInfo.title}</h3>
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

              <button
                onClick={flashESP32}
                disabled={flashing || !firmwareContent}
              >
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
