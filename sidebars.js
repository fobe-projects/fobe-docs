export const chapterTitle = (id, label, icon) => ({
  type: "doc",
  id,
  label,
  customProps: {
    icon,
    isTitle: true,
  },
});

export const hr = () => ({
  type: "html",
  value: "<hr/>",
});

export const title = (value) => ({
  type: "html",
  value,
  className: "menu__group-label",
});

export const ref = (id, label, icon) => {
  return {
    type: "ref",
    label,
    id,
    customProps: {
      icon,
    },
  };
};

module.exports = {
  main: [
    {
      type: "doc",
      id: "index",
      label: "Overview",
      customProps: {
        icon: "home",
      },
    },
    {
      type: "doc",
      id: "firmware-hub",
      label: "Firmware Hub",
      customProps: {
        icon: "box",
      },
    },

    title("Development Boards"),
    {
      type: "category",
      label: "Quill Series",
      link: { type: "doc", id: "product/quill" },
      items: [
        {
          type: "category",
          label: "Quill nRF52840 Mesh",
          items: ["product/f1101/quickstart", "product/f1101/programming"],
        },
        {
          type: "category",
          label: "Quill ESP32S3 Mesh",
          items: ["product/f1102/quickstart", "product/f1102/programming"],
        },
      ],
    },
    {
      type: "category",
      label: "IDEA Series",
      link: { type: "doc", id: "product/idea" },
      items: [
        {
          type: "category",
          label: "Mesh Tracker C1",
          items: ["product/f2102/quickstart", "product/f2102/programming"],
        },
        {
          type: "category",
          label: "Mesh Solar Power",
          items: ["product/f2101/quickstart"],
        },
      ],
    },

    title("Modules"),
    {
      type: "category",
      label: "Core Series",
      link: { type: "doc", id: "product/core" },
      items: [
        {
          type: "category",
          label: "FoBE Core nRF52840 Mesh",
          items: ["product/f6001/quickstart"],
        },
      ],
    },

    title("Extensions"),
    {
      type: "category",
      label: "Breakout",
      link: { type: "doc", id: "product/breakout" },
      items: [
        {
          type: "category",
          label: "Breakout LPS22",
          items: ["product/f2201/quickstart"],
        },
        {
          type: "category",
          label: "Breakout SHT40",
          items: ["product/f2202/quickstart"],
        },
        {
          type: "category",
          label: "Breakout OLED 0.42inch",
          items: ["product/f2203/quickstart"],
        },
        {
          type: "category",
          label: "Breakout BM8563",
          items: ["product/f2204/quickstart"],
        },
        {
          type: "category",
          label: "Breakout ENS160",
          items: ["product/f2205/quickstart"],
        },
        {
          type: "category",
          label: "Breakout AS5600",
          items: ["product/f2206/quickstart"],
        },
        {
          type: "category",
          label: "Breakout L76K",
          items: ["product/f2207/quickstart"],
        },
        {
          type: "category",
          label: "Breakout ADS1115",
          items: ["product/f2208/quickstart"],
        },
        {
          type: "category",
          label: "Breakout GP8303",
          items: ["product/f2209/quickstart"],
        },
        {
          type: "category",
          label: "Breakout GP8403",
          items: ["product/f2210/quickstart"],
        },
        {
          type: "category",
          label: "Breakout CMSIS-DAP",
          items: ["product/f2211/quickstart"],
        },
        {
          type: "category",
          label: "Breakout MFP-HUB",
          items: ["product/f2212/quickstart"],
        },
      ],
    },

    title("Platforms"),
    {
      type: "doc",
      id: "platform/arduino",
    },
    {
      type: "doc",
      id: "platform/micropython",
    },
    {
      type: "doc",
      id: "platform/circuitpython",
    },
    {
      type: "doc",
      id: "platform/zephyr",
    },

    // title("Solution"),
    // {
    //   type: "doc",
    //   id: "solution/telemetry",
    // },
    // {
    //   type: "doc",
    //   id: "solution/dpc",
    // },
    // {
    //   type: "doc",
    //   id: "solution/meshtastic",
    // },

    title("Additional Resources"),
    {
      type: "doc",
      id: "about",
      customProps: {
        icon: "info",
      },
    },
    {
      type: "doc",
      id: "disclaimer",
      customProps: {
        icon: "checklist",
      },
    },
    {
      type: "doc",
      id: "privacy",
      customProps: {
        icon: "shield",
      },
    },
    {
      type: "link",
      label: "Store",
      href: "https://store.fobestudio.com",
      customProps: {
        icon: "shop",
      },
    },
    {
      type: "link",
      label: "Report an Issue",
      href: "https://github.com/fobe-projects/fobe-documentation-web/issues/new",
      customProps: {
        icon: "feedback",
      },
    },
    {
      type: "link",
      label: "Join Discord",
      href: "https://discord.gg/XjPDqEWyC7",
      customProps: {
        icon: "discord",
      },
    },
  ],
};
