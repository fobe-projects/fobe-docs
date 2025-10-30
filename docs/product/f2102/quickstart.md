---
description: Getting Started with FoBE Mesh Tracker C1.
sidebar_label: Getting Started with FoBE Mesh Tracker C1
image: /img/products/f2102-r1lg.main.png
slug: /mesh_tracker_c1_getting_started
toc_max_heading_level: 4
sidebar_position: 1
keywords:
  - FoBE
  - nRF52840
  - Mesh
  - LoRa
tags:
  - FoBE
  - nRF52840
  - Mesh
  - LoRa
last_update:
  date: 10/30/2025
  author: Fernando
---

# Getting Started with FoBE Mesh Tracker C1

<div style={{ textAlign: 'center' }}>
  <img src="/img/products/f2102-r1lg.main.png" style={{ width: '80%', height: 'auto' }} />
</div>
<div className="theme-button-buy" style={{ textAlign: 'center' }}>
  <a href="https://store.fobestudio.com/products/f2102" target="_blank" rel="noopener noreferrer">
        <button>Get One 🛍️</button>
  </a>
</div>

## Introduction

FoBE Mesh Tracker C1 is a complete application board designed for outdoor LoRa communication. It integrates a nRF52840 MCU, GPS, buzzer, display screen, and LoRa transceiver, providing all the necessary features for an outdoor LoRa communication device.

The board features a rotary encoder, two buttons for easy user interface operation, an onboard BLE antenna for convenient configuration, a 0.96-inch OLED screen, and two indicator LEDs. It also includes a USB-C connector, reserved SWDIO/SWCLK header holes on the side, an 8-pin header for external expansion with 6 GPIO pins, and two IPEX antenna connectors for LoRa and GPS antennas.

## Key Features

- Core Components
  - nRF52840 MCU
  - GPS module with IPEX antenna connector
  - LoRa transceiver with IPEX antenna connector
  - 0.96-inch OLED screen
  - Buzzer for audio feedback

- User Interface
  - Rotary encoder for easy navigation
  - Two user buttons
  - Two indicator LEDs
  - Onboard BLE antenna

- Connectivity and Expansion
  - USB-C connector
  - Reserved SWDIO/SWCLK header holes
  - 8-pin header with 6 GPIO Pins for external expansion
  - 2-Pin MX1.25 battery input interface
  - 6-Pin SH1.0 FPC external module interface x 2

## Hardware diagram

The following figure illustrates the FoBE IDEA Mesh Tracker C1 hardware diagram.

<div style={{ textAlign: 'center' }}>
  <img src="/img/products/f2102-r1lg.digram.png" alt="FoBE IDEA Mesh Tracker C1 Hardware Diagram" style={{ width: '80%', height: 'auto' }} />
</div>

<div style={{ textAlign: 'center' }}>
  <img src="/img/products/f2102-r1lg.digram-1.png" alt="FoBE IDEA Mesh Tracker C1 Hardware Diagram-1" style={{ width: '80%', height: 'auto' }} />
</div>

## Mechanical dimensions

FoBE IDEA Mesh Tracker C1 is a compact PCB with dimensions of 50mm \* 50mm, designed for outdoor LoRa communication.

<div style={{ textAlign: 'center' }}>
  <img src="/img/products/f2102-r1lg.dimensions.png" alt="FoBE IDEA Mesh Tracker C1 Mechanical Dimensions" style={{ width: '80%', height: 'auto' }} />
</div>

## Power Supply

- GPS power (GNSS-3V3) is controlled by MCU P0.26. GPS data backup power is not controlled.
- Screen, buzzer, and external header power (PERI-3V3) are controlled by MCU P0.16.

## Status Indicators

The board has two indicator LEDs:

- Power LED
- Charging Indicator LED

## Buttons

The board has two buttons:

- Reset Button
- User Button (connected to MCU P1.00)

## Shielding Pads

The MCU and LoRa IC have reserved shielding pads, allowing users to add shielding covers for improved signal performance.

## Battery Management

- The battery charging IC directly manages the battery connection.
- The NTC header is directly connected to the charging IC.
- Battery voltage is measured using a voltage divider circuit (1M and 1.5M resistors), and the measurement is read by MCU P0.05.

## Sub-GHz Radio (LoRa)

The FoBE IDEA Mesh Tracker C1 board features an on-board sub-GHz radio module based on the Semtech SX1262. It supports LoRa and (G)FSK modulation and operates in the 433 MHz, 868 MHz, and 915 MHz frequency bands (depending on the model). An integrated 1.8V TCXO ensures excellent stability across temperature variations.

Key specifications include a low active receive current of just 4.2 mA, a maximum transmit power of up to +22 dBm, and high sensitivity down to -148 dBm, providing excellent interference immunity.

The module connects to the nRF52840 SoC via SPI for long-range wireless communication:

| SX1262 Pin | GPIO Pin  |
| ---------- | --------- |
| MISO       | **P0.24** |
| MOSI       | **P0.22** |
| SCK        | **P0.20** |
| NSS        | **P1.08** |
| RST        | **P0.13** |
| BUSY       | **P0.15** |
| DIO1       | **P0.17** |
| RXEN       | **P0.11** |

## GPS

The GPS module has the following pin assignments:

| GPS Pin | GPIO Pin  |
| ------- | --------- |
| RST     | **P0.04** |
| RXD     | **P0.12** |
| TXD     | **P1.09** |
| PPS     | **P0.08** |
| WAKE    | **P0.06** |

## Configuration Jumper

The board features a jumper pads:

| Interface     | Description                                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| CONSTELLATION | Soldering this pad configures the module to use GPS + GLONASS. By default, the pad is not soldered, and the module uses BeiDou + GPS. |

## Resources

**[PDF]** [FoBE Mesh Tracker C1 Datasheet](/assets/files/f2102/f2102.prj.datasheet.r1lg.pdf)

**[PDF]** [FoBE Mesh Tracker C1 Schematic](/assets/files/f2102/f2102.prj.sch.r1lg.pdf)

**[PDF]** [FoBE Mesh Tracker C1 Dimension](/assets/files/f2102/f2102.prj.dim.r1lg.pdf)

**[OBJ]** [FoBE Mesh Tracker C1 3D Model](/assets/files/f2102/f2102.prj.model.r1lg.obj)
