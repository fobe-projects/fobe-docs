---
description: Getting Started with FoBE Mesh Solar Power.
sidebar_label: Getting Started with FoBE Mesh Solar Power
image: /img/products/f2102-r1lg.main.png
slug: /mesh_solar_power_getting_started
toc_max_heading_level: 4
sidebar_position: 1
keywords:
  - FoBE
  - Extended
  - Mesh
  - LoRa
tags:
  - FoBE
  - Extended
  - Mesh
  - LoRa
last_update:
  date: 10/30/2025
  author: Fernando
---

# Getting Started with FoBE Mesh Solar Power

<div style={{ textAlign: 'center' }}>
  <img src="/img/products/f2101-r1a.main.png" style={{ width: '80%', height: 'auto' }} />
</div>
<div className="theme-button-buy" style={{ textAlign: 'center' }}>
  <a href="https://store.fobestudio.com/products/f2101" target="_blank" rel="noopener noreferrer">
          <button>Get One 🛍️</button>
  </a>
</div>

## Introduction

FoBE Mesh Solar Power is a versatile solar expansion board designed to enhance the capabilities of QUILL series devices. It offers a convenient and efficient solution for solar power integration, battery management, and an adjustable low-power DC-DC boost converter.

This expansion board features dual 18650 battery holders, a solar charging interface, an adjustable voltage boost output, and an IIC interface, making it ideal for a wide range of applications, including portable devices, remote sensors, and off-grid power systems.

## Key Features

- Power Management
  - Dual 18650 battery holders for extended battery life
  - Solar charging interface (2pin PH2.0) for sustainable power
  - Adjustable voltage boost output interface (2pin PH2.0) for flexible power supply
  - Battery protection chip for safe operation

- Expansion and Connectivity
  - Two rows of double 14-pin female sockets not only meet the operational requirements of the QUILL series, but also have additional free pins.
  - 4pin SH1.0 IIC interface for easy integration with sensors and peripherals

## Hardware diagram

The following figure illustrates the FoBE Mesh Solar Power hardware diagram.

<br/>
<div style={{ textAlign: 'center' }}>
  <img src="/img/products/f2101-r1a.digram.png" alt="FoBE Mesh Solar Power Hardware Diagram" style={{ width: '80%', height: 'auto' }} />
</div>
<br/>

## Mechanical dimensions

FoBE Mesh Solar Power is a PCB with dimensions of 100mm \* 42.8mm, designed to be compatible with QUILL series devices, featuring two rows of double 14-pin female headers.

<br/>
<div style={{ textAlign: 'center' }}>
  <img src="/img/products/f2101-r1a.dimensions.png" alt="FoBE Mesh Solar Power Mechanical Dimensions" style={{ width: '80%', height: 'auto' }} />
</div>
<br/>

## Power Output Configuration

The boost voltage output can be manually set using the 2-bit switch on the board. The S1/S2 switch configurations correspond to the following output voltages:

| S1  | S2  | Output Voltage |
| --- | --- | -------------- |
| 0   | 0   | 5V             |
| 1   | 0   | 9V             |
| 1   | 1   | 12V            |

## Status Indicators

The board has three indicator LEDs:

- Solar Panel Input Voltage Indicator
- Solar Charging Indicator
- Battery Full Indicator

## Peripheral Power

The external IIC power is provided by PERI-3V3, which is controlled by the Quill device via the D13 pin.

## Onboard NTC

In addition to the battery protection chip, there is an onboard NTC measurement circuit(3380K, composed of PERI-3V3 and a 10k resistor) connected to pin A5. This NTC can be measured and monitored by the Quill device using the corresponding pin.

## BOOST MODE Jumper

The board also has a reserved solder jumper: BOOST MODE. If soldered resistor, the boost converter operates in PWM mode; otherwise, it operates in PFM mode.

> In moderate to heavy load condition, the device works in pulse width modulation (PWM) mode. In light load condition, the device has two operation modes selected by the MODE pin. One is the pulse frequency modulation (PFM) mode to improve the efficiency and another one is forced PWM mode to avoid application problems caused by low switching frequency. The switching frequency in PWM mode is adjustable, ranging from 200 kHz to 2.2 MHz by an external resistor.

## Resources

**[PDF]** [FoBE Mesh Solar Power Datasheet](/assets/files/f2101/f2101.prj.datasheet.r1a.pdf)

**[PDF]** [FoBE Mesh Solar Power Schematic](/assets/files/f2101/f2101.prj.sch.r1a.pdf)

**[PDF]** [FoBE Mesh Solar Power Dimension](/assets/files/f2101/f2101.prj.dim.r1a.pdf)

**[OBJ]** [FoBE Mesh Solar Power 3D Model](/assets/files/f2101/f2101.prj.model.r1a.obj)
