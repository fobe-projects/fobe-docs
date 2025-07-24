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

const backToHome = {
  type: "ref",
  id: "index",
  label: "<- Back to home",
  className: "menu__backlink",
  customProps: {
    sidebar_is_backlink: true,
    sidebar_icon: "back-arrow",
  },
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
      type: "category",
      label: "Quickstart",
      items: ["product/quill", "product/quill", "product/quill"],
      customProps: {
        icon: "play",
      },
    },

    title("Development Boards"),
    ref("product/quill", "Quill Series", "feather"),
    ref("product/base", "Base Series", "thermometer"),
    ref("product/breakout", "Breakout Series", "appBoard"),
    // ref("developer/index", "Pico Series", "distribute"),
    // ref("cloud/overview", "Mesh Cube", "appBoard"),

    // title("Modules"),
    // ref("cloud/overview", "F6001", "coreModule"),

    // title("Projects"),
    // ref("developer/app-store/overview", "MeshCube for Meshtastic", "box"),
    // ref("developer/app-store/overview", "Solar Power for Meshtastic", "box"),

    // title("Extensions"),
    // ref("developer/app-store/overview", "Sensors", "thermometer"),
    // ref("developer/app-store/overview", "Batteries", "charge"),

    // title("Platforms"),
    // ref("developer/app-store/overview", "Zephyr RTOS", "platform"),
    // ref("developer/app-store/overview", "Arduino", "platform"),
    // ref("developer/app-store/overview", "MicroPython", "platform"),

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
  productQuill: [
    backToHome,
    chapterTitle("product/quill", "Quill Series", "box"),
    {
      type: "category",
      label: "FoBE Quill nRF52840 Mesh",
      items: [
        "product/f1101/index",
        "product/f1101/quickstart",
        "product/f1101/programming",
        "product/f1101/applications",
        "product/f1101/resources",
      ],
    },
    {
      type: "category",
      label: "FoBE Quill ESP32-S3 Mesh",
      items: [
        "product/f1102/index",
        "product/f1102/quickstart",
        "product/f1102/programming",
        "product/f1102/applications",
        "product/f1102/resources",
      ],
    },
  ],
  productBreakout: [
    backToHome,
    chapterTitle("product/breakout", "Breakout Series", "appBoard"),
    {
      type: "category",
      label: "FoBE Breakout L76K",
      items: [
        "product/f2207/index",
        "product/f2207/quickstart",
        "product/f2207/resources",
      ],
    },
  ],
  productBase: [
    backToHome,
    chapterTitle("product/base", "Base Series", "thermometer"),
    {
      type: "category",
      label: "FoBE Base with Solar Power",
      items: [
        "product/f2101/index",
        "product/f2101/quickstart",
        "product/f2101/resources",
      ],
    },
    {
      type: "category",
      label: "FoBE Base Cube nRF52840",
      items: [
        "product/f2102/index",
        "product/f2102/quickstart",
        "product/f2102/resources",
      ],
    },
  ],
};
