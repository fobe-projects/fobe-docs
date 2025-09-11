import "xterm/css/xterm.css";

import React, { useCallback, useEffect, useRef, useState } from "react";

import styles from "./monitor.styles.module.css";

// Constants
const BAUD_RATES = [115200, 230400, 460800, 921600];
const DEFAULT_BAUD_RATE = 115200;

const Monitor = () => {
  // DOM References
  const terminalRef = useRef(null);
  const termRef = useRef(null);

  // Serial Port References
  const portRef = useRef(null);
  const readerRef = useRef(null);
  const writerRef = useRef(null);
  const readingRef = useRef(false);

  // Component State
  const [connected, setConnected] = useState(false);
  const [baudRate, setBaudRate] = useState(DEFAULT_BAUD_RATE);
  const [showModal, setShowModal] = useState(false);
  const [TerminalClass, setTerminalClass] = useState(null);

  // Initialize xterm library
  useEffect(() => {
    import("xterm").then((mod) => {
      setTerminalClass(() => mod.Terminal);
    });
  }, []);

  // Handle terminal data input
  const handleTerminalData = useCallback(async (data) => {
    if (portRef.current?.writable) {
      if (!writerRef.current) {
        writerRef.current = portRef.current.writable.getWriter();
      }
      try {
        await writerRef.current.write(new TextEncoder().encode(data));
      } catch (error) {
        console.error("Error writing to serial port:", error);
      }
    }
  }, []);

  // Initialize terminal when modal opens
  useEffect(() => {
    if (showModal && TerminalClass && terminalRef.current && !termRef.current) {
      const term = new TerminalClass({ convertEol: true });
      term.open(terminalRef.current);
      term.onData(handleTerminalData);
      termRef.current = term;
    }

    return () => {
      if (termRef.current) {
        termRef.current.dispose();
        termRef.current = null;
      }
    };
  }, [showModal, TerminalClass, handleTerminalData]);

  // Serial Port Operations
  const readFromPort = useCallback(async () => {
    if (!portRef.current?.readable) return;

    readingRef.current = true;
    const reader = portRef.current.readable.getReader();
    readerRef.current = reader;

    try {
      while (readingRef.current) {
        const { value, done } = await reader.read();
        if (done || !termRef.current) break;
        termRef.current.write(value);
      }
    } catch (error) {
      console.error("Error reading from serial port:", error);
      if (termRef.current) {
        termRef.current.writeln(`\r\n--- Read error: ${error.message} ---`);
      }
    } finally {
      reader.releaseLock();
      readerRef.current = null;
    }
  }, []);

  const connectSerialPort = useCallback(async () => {
    if (portRef.current) {
      termRef.current?.writeln("--- Already connected. Disconnect first. ---");
      return;
    }

    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate });
      portRef.current = port;

      termRef.current?.writeln(
        `--- Serial port connected at ${baudRate} baud ---`,
      );
      setConnected(true);
      readFromPort();
    } catch (error) {
      console.error("Connection error:", error);
      termRef.current?.writeln(`--- Connection error: ${error.message} ---`);
      portRef.current = null;
      setConnected(false);
    }
  }, [baudRate, readFromPort]);

  const disconnectSerialPort = useCallback(async () => {
    readingRef.current = false;

    // Clean up reader
    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch (error) {
        console.warn("Error canceling reader:", error);
      }
      readerRef.current = null;
    }

    // Clean up writer
    if (writerRef.current) {
      try {
        await writerRef.current.close();
      } catch (error) {
        console.warn("Error closing writer:", error);
      }
      writerRef.current = null;
    }

    // Close port
    if (portRef.current) {
      try {
        await portRef.current.close();
      } catch (error) {
        console.warn("Error closing port:", error);
      }
      portRef.current = null;
    }

    termRef.current?.writeln("\r\n--- Serial port disconnected ---");
    setConnected(false);
  }, []);

  // Modal Operations
  const openModal = useCallback(() => {
    setShowModal(true);
    termRef.current?.clear();
  }, []);

  const closeModal = useCallback(() => {
    disconnectSerialPort();
    setShowModal(false);
  }, [disconnectSerialPort]);

  // Event Handlers
  const handleBaudRateChange = useCallback((event) => {
    setBaudRate(Number(event.target.value));
  }, []);

  return (
    <>
      {/* Modal Trigger */}
      <div className={styles.modalTrigger}>
        <button onClick={openModal}>Serial Monitor</button>
      </div>

      {/* Modal Content */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <h3>Serial Monitor</h3>
              <div>
                {/* Baud Rate Selector */}
                <label>
                  Baud Rate
                  <select value={baudRate} onChange={handleBaudRateChange}>
                    {BAUD_RATES.map((rate) => (
                      <option key={rate} value={rate}>
                        {rate}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Connection Controls */}
                {!connected ? (
                  <button onClick={connectSerialPort}>Connect</button>
                ) : (
                  <button onClick={disconnectSerialPort}>Disconnect</button>
                )}
                {/* Close Button */}
                <button
                  className={styles.closeButton}
                  onClick={closeModal}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && closeModal()}
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Terminal Console */}
            <div
              className={styles.modalConsole}
              ref={terminalRef}
              id="monitor-terminal"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Monitor;
