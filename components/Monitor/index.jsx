import "xterm/css/xterm.css";

import React, { useEffect, useRef, useState } from "react";

import styles from "./styles.module.css";

const Monitor = () => {
  const terminalRef = useRef(null);
  const termRef = useRef(null);
  const portRef = useRef(null);
  const readerRef = useRef(null);
  const writerRef = useRef(null);
  const readingRef = useRef(false);

  const [connected, setConnected] = useState(false);
  const [baudRate, setBaudRate] = useState(115200);
  const [showModal, setShowModal] = useState(false);
  const [TerminalClass, setTerminalClass] = useState(null);

  useEffect(() => {
    import("xterm").then((mod) => {
      setTerminalClass(() => mod.Terminal);
    });
  }, []);

  useEffect(() => {
    if (showModal && TerminalClass && terminalRef.current && !termRef.current) {
      const term = new TerminalClass({ convertEol: true });
      term.open(terminalRef.current);
      term.onData(async (data) => {
        if (portRef.current && portRef.current.writable) {
          if (!writerRef.current) {
            writerRef.current = portRef.current.writable.getWriter();
          }
          await writerRef.current.write(new TextEncoder().encode(data));
        }
      });
      termRef.current = term;
    }

    return () => {
      if (termRef.current) {
        termRef.current.dispose();
        termRef.current = null;
      }
    };
  }, [showModal, TerminalClass]);

  const readFromPort = async () => {
    if (!portRef.current || !portRef.current.readable) return;

    readingRef.current = true;
    const reader = portRef.current.readable.getReader();
    readerRef.current = reader;

    try {
      while (readingRef.current) {
        const { value, done } = await reader.read();
        if (done || !termRef.current) break;
        termRef.current.write(value);
      }
    } catch (err) {
      console.error(err);
    } finally {
      reader.releaseLock();
      readerRef.current = null;
    }
  };

  const connectSerialPort = async () => {
    if (portRef.current) {
      termRef.current.writeln("--- Already connected. Disconnect first. ---");
      return;
    }
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate });
      portRef.current = port;

      termRef.current.writeln(
        `--- Serial port connected at ${baudRate} baud ---`,
      );
      setConnected(true);
      readFromPort();
    } catch (err) {
      termRef.current.writeln(`--- Error: ${err.message} ---`);
      portRef.current = null;
      setConnected(false);
    }
  };

  const disconnectSerialPort = async () => {
    readingRef.current = true;

    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch {
        /* empty */
      }
      readerRef.current = null;
    }
    if (writerRef.current) {
      try {
        await writerRef.current.close();
      } catch {
        /* empty */
      }
      writerRef.current = null;
    }
    if (portRef.current) {
      try {
        await portRef.current.close();
      } catch {
        /* empty */
      }
      portRef.current = null;
    }

    if (termRef.current) {
      termRef.current.writeln("\r\n--- Serial port disconnected ---");
    }
    setConnected(false);
  };

  const openModal = () => {
    setShowModal(true);
    if (termRef.current) {
      termRef.current.clear();
    }
  };

  const closeModal = () => {
    disconnectSerialPort();
    setShowModal(false);
  };

  return (
    <>
      <div className={styles.modalTrigger}>
        <button onClick={openModal}>Serial Monitor</button>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Serial Monitor</h3>
              <div>
                <label>
                  BaudRate:
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

                <button
                  onClick={connectSerialPort}
                  style={{ display: connected ? "none" : "inline-block" }}
                >
                  Connect
                </button>
                <button
                  onClick={disconnectSerialPort}
                  style={{ display: connected ? "inline-block" : "none" }}
                >
                  Disconnect
                </button>
                <span className={styles.closeButton} onClick={closeModal}>
                  &times;
                </span>
              </div>
            </div>
            <div ref={terminalRef} id="monitor-terminal" />
          </div>
        </div>
      )}
    </>
  );
};

export default Monitor;
