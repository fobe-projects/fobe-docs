import React, { useEffect, useState } from "react";
import { FaExternalLinkAlt,FaGithub } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import styles from "./styles.module.css";

const boards = [
  {
    id: "fobe-sample-board-1",
    name: "FoBE Sample board 1",
    manufacturer: "FoBE",
  },
  {
    id: "fobe-sample-board-2",
    name: "FoBE Sample board 2",
    manufacturer: "FoBE",
  },
  {
    id: "fobe-sample-board-3",
    name: "FoBE Sample board 3",
    manufacturer: "FoBE",
  },
  {
    id: "fobe-sample-board-4",
    name: "FoBE Sample board 4",
    manufacturer: "FoBE",
  },
  {
    id: "fobe-sample-board-5",
    name: "FoBE Sample board 5",
    manufacturer: "FoBE",
  },
  {
    id: "fobe-sample-board-6",
    name: "FoBE Sample board 6",
    manufacturer: "FoBE",
  },
  {
    id: "fobe-sample-board-7",
    name: "FoBE Sample board 7",
    manufacturer: "FoBE",
  },
  {
    id: "fobe-sample-board-8",
    name: "FoBE Sample board 8",
    manufacturer: "FoBE",
  },
  {
    id: "fobe-sample-board-9",
    name: "FoBE Sample board 9",
    manufacturer: "FoBE",
  },
];

const BoardGrid = () => {
  const handleBoardClick = (board) => {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("id", board.id);
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.pushState(null, "", newUrl);
    window.dispatchEvent(new Event("urlchange"));
  };

  return (
    <section className={styles.boardGrid}>
      <div className={styles.container}>
        {boards.map((board, index) => (
          <article key={index}>
            <div
              className={styles.boardGridItem}
              onClick={() => handleBoardClick(board)}
              style={{ cursor: "pointer" }}
            >
              <a>
                <div className={styles.boardGridImage}>
                  <img
                    src="https://circuitpython.org/assets/images/boards/large/raspberry_pi_pico.jpg"
                    alt="Image of Board"
                    loading="lazy"
                  />
                </div>
                <strong title={board.name}>{board.name}</strong>
                <span>By {board.manufacturer}</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const Board = ({ id }) => {
  const markdown = `
This is the Adafruit Feather RP2040 RFM9x. We call these RadioFruits, our take on a microcontroller with packet radio transceiver with built-in USB and battery charging. It's an Adafruit Feather RP2040 with a radio module cooked in! Great for making wireless networks that are more flexible than Bluetooth LE and without the high power requirements of WiFi.

Feather is the development board specification from Adafruit, and like its namesake, it is thin, light, and lets you fly! We designed Feather to be a new standard for portable microcontroller cores. We have other boards in the Feather family, check'em out here.

It's kinda like we took our RP2040 Feather and an RFM9x breakout board and glued them together. You get all the pins for use on the Feather, the LiPoly battery support, USB C power / data, onboard NeoPixel, 8MB of FLASH for storing code and files, and then with the 8 unused pins, we wired up all the DIO pins on the RFM module. There's even room left over for a STEMMA QT connector and a uFL connector for connecting larger antennas.

At the Feather's heart is an RP2040 chip, clocked at 133 MHz and at 3.3V logic, the same one used in the Raspberry Pi Pico. This chip has a whopping 8MB of onboard QSPI FLASH and 264K of RAM! This makes it great for making wireless sensor nodes that can send to each other without a lot of software configuration.

To make it easy to use for portable projects, we added a connector for any of our 3.7V Lithium polymer batteries and built-in battery charging. You don't need a battery, it will run just fine straight from the USB Type C connector. But, if you do have a battery, you can take it on the go, then plug in the USB to recharge. The Feather will automatically switch over to USB power when it's available.

## Technical Details

* Measures approximately 2.0" x 0.9" x 0.28" (50.8mm x 22.8mm x 7mm) without headers soldered in
* Light as a (large?) feather - approximately 6 grams
* RP2040 32-bit Cortex M0+ dual core running at ~133 MHz @ 3.3V logic and power
* 264 KB RAM
* 8 MB SPI FLASH chip for storing files and CircuitPython/MicroPython code storage. No EEPROM
* Tons of GPIO! 21 x GPIO pins with following capabilities:
* Four 12-bit ADCs (one more than Pico)
* Two I2C, Two SPI, and two UART peripherals, we label one for the 'main' interface in standard Feather locations
* 16 x PWM outputs - for servos, LEDs, etc
* Built-in 200mA+ lipoly charger with charging status indicator LED
* Pin #13 red LED for general purpose blinking
* RGB NeoPixel for full-color indication.
* On-board STEMMA QT connector that lets you quickly connect any Qwiic, STEMMA QT or Grove I2C devices with no soldering!
* Both Reset button and Bootloader select button for quick restarts (no unplugging-replugging to relaunch code)
* USB Type C connector lets you access built-in ROM USB bootloader and serial port debugging
* 3.3V Power/enable pin
* 4 mounting holes
* 12 MHz crystal for perfect timing.
* 3.3V regulator with 500mA peak current output
* SX127x LoRa® based module with SPI interface
* Packet radio with ready-to-go Arduino libraries
* Uses the license-free ISM bands (ITU "Europe" @ 433MHz and ITU "Americas" @ 900MHz)
* +5 to +20 dBm up to 100 mW Power Output Capability (power output selectable in software)
* ~300uA during full sleep, ~120mA peak during +20dBm transmit, ~40mA during active radio listening.
* Simple wire antenna can be soldered into a solder pad, there's also a uFL connector that can be used with uFL-to-SMA adapters for attaching bigger antennas.

## Tutorials

* Guide is coming soon!

## Purchase

* [Adafruit](https://www.adafruit.com/product/5714)
`;

  const board = boards.find((b) => b.id === id);
  if (!board) {
    return <p>Board not found.</p>;
  }

  return (
    <div className={styles.board}>
      <div className={styles.boardDescription}>
        <div className={styles.boardDescriptionImage}>
          <img
            src="https://circuitpython.org/assets/images/boards/large/raspberry_pi_pico.jpg"
            alt="Image of Board"
            loading="lazy"
          />
          <h1>{board.name}</h1>
        </div>
        <div className={styles.boardDescriptionContent}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
      </div>
      <div className={styles.boardFirmware}>
        <div className={styles.boardFirmwareContent}>
          <div className={styles.boardFirmwareTitle}>
            <h2>CircuitPython</h2>
            <div>
              <a>
                {" "}
                <FaGithub size={20} />
              </a>
              <a>
                {" "}
                <FaExternalLinkAlt size={20} />
              </a>
            </div>
          </div>

          <p>
            CircuitPython is a programming language designed to simplify
            experimenting and learning to code on low-cost microcontroller
            boards, This is the firmware of CircuitPython that will work with
            the <b>{board.name}</b> Board.
          </p>
          <p>
            <small>Last Update: 2025-01-01</small>
          </p>

          <div className={styles.boardFirmwareNote}>
            <a>Release Notes for 9.2.8</a>
            <div>
              <a>[.bin]</a>
              <a>[.uf2]</a>
            </div>
          </div>
          <div className={styles.boardFirmwareSelect}>
            <select>
              <option value="v1.0.0">ENGLISH</option>
              <option value="v2.0.0">CHINESE (PINYIN)</option>
            </select>
            <select>
              <option value="v1.0.0">v1.0.0</option>
              <option value="v1.1.0">v1.1.0</option>
              <option value="v2.0.0">v2.0.0</option>
            </select>
            <button>Flash</button>
          </div>
        </div>
        <div className={styles.boardFirmwareContent}>
          <div className={styles.boardFirmwareTitle}>
            <h2>CircuitPython</h2>
            <div>
              <a>
                {" "}
                <FaGithub size={20} />
              </a>
              <a>
                {" "}
                <FaExternalLinkAlt size={20} />
              </a>
            </div>
          </div>

          <p>
            CircuitPython is a programming language designed to simplify
            experimenting and learning to code on low-cost microcontroller
            boards, This is the firmware of CircuitPython that will work with
            the <b>{board.name}</b> Board.
          </p>
          <p>
            <small>Last Update: 2025-01-01</small>
          </p>

          <div className={styles.boardFirmwareNote}>
            <a>Release Notes for 9.2.8</a>
            <div>
              <span>9.2.8 </span>
              <a>[.bin]</a>
              <a>[.uf2]</a>
            </div>
          </div>
          <div className={styles.boardFirmwareSelect}>
            <select>
              <option value="v1.0.0">ENGLISH</option>
              <option value="v2.0.0">CHINESE (PINYIN)</option>
            </select>
            <select>
              <option value="v1.0.0">v1.0.0</option>
              <option value="v1.1.0">v1.1.0</option>
              <option value="v2.0.0">v2.0.0</option>
            </select>
            <button>Flash</button>
          </div>
        </div>
        <div className={styles.boardFirmwareContent}>
          <div className={styles.boardFirmwareTitle}>
            <h2>CircuitPython</h2>
            <div>
              <a>
                {" "}
                <FaGithub size={20} />
              </a>
              <a>
                {" "}
                <FaExternalLinkAlt size={20} />
              </a>
            </div>
          </div>

          <p>
            CircuitPython is a programming language designed to simplify
            experimenting and learning to code on low-cost microcontroller
            boards, This is the firmware of CircuitPython that will work with
            the <b>{board.name}</b> Board.
          </p>
          <p>
            <small>Last Update: 2025-01-01</small>
          </p>

          <div className={styles.boardFirmwareNote}>
            <a>Release Notes for 9.2.8</a>
            <div>
              <a>[.bin]</a>
              <a>[.uf2]</a>
            </div>
          </div>
          <div className={styles.boardFirmwareSelect}>
            <select>
              <option value="v1.0.0">ENGLISH</option>
              <option value="v2.0.0">CHINESE (PINYIN)</option>
            </select>
            <select>
              <option value="v1.0.0">v1.0.0</option>
              <option value="v1.1.0">v1.1.0</option>
              <option value="v2.0.0">v2.0.0</option>
            </select>
            <button>Flash</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Flasher = () => {
  const [id, setId] = useState(null);

  useEffect(() => {
    const handleUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get("id");
      setId(id);
    };

    const wrapHistoryMethod = (type) => {
      const orig = window.history[type];
      window.history[type] = function (...args) {
        const rv = orig.apply(this, args);
        window.dispatchEvent(new Event("urlchange"));
        return rv;
      };
    };
    wrapHistoryMethod("pushState");
    wrapHistoryMethod("replaceState");

    window.addEventListener("urlchange", handleUrlChange);
    window.addEventListener("popstate", handleUrlChange);

    handleUrlChange();

    return () => {
      window.removeEventListener("urlchange", handleUrlChange);
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, []);

  return id == null ? <BoardGrid /> : <Board id={id} />;
};

export default Flasher;
