import "xterm/css/xterm.css";

import { ESPLoader,Transport } from "esptool-js";
import React, { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";

import styles from "./styles.module.css";

const EspFlasher = () => {
  const terminalRef = useRef(null);
  const termRef = useRef(null);
  const transportRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [baudRate, setBaudRate] = useState(115200);
  const [erase, setErase] = useState(false);
  const [firmwareContent, setFirmwareContent] = useState(null);
  const [flashing, setFlashing] = useState(false);

  // 初始化 xterm 终端
  useEffect(() => {
    if (showModal && terminalRef.current && !termRef.current) {
      const term = new Terminal({ convertEol: true, cols: 100, rows: 30 });
      term.open(terminalRef.current);
      termRef.current = term;
    }
  }, [showModal]);

  // 打开模态框
  const openModal = () => {
    setShowModal(true);
    if (termRef.current) {
      termRef.current.clear();
    }
  };

  // 关闭模态框
  const closeModal = () => {
    setShowModal(false);
    setFirmwareContent(null);
    if (transportRef.current) {
      transportRef.current.disconnect().catch(() => {});
      transportRef.current = null;
    }
  };

  // 读取本地文件固件
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    setFirmwareContent(binary);

    if (termRef.current) {
      termRef.current.writeln(
        `Loaded firmware: ${file.name} (${bytes.length} bytes)`,
      );
    }
  };

  // ESP32 烧录函数
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
      <button onClick={openModal}>ESP32 Flash</button>

      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>ESP32 Flash Firmware</h3>
              <span className={styles.closeButton} onClick={closeModal}>
                &times;
              </span>
            </div>

            <div className={styles.modalBody}>
              <label>
                Select Firmware File:
                <input type="file" onChange={handleFileChange} />
              </label>
              <br />

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

              <br />
              <button
                onClick={flashESP32}
                disabled={flashing || !firmwareContent}
              >
                {flashing ? "Flashing... ⏳" : "Flash ESP32"}
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
