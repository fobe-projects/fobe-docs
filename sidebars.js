const { title, ref } = require("./sidebars/utils");
const { productQuill } = require("./sidebars/product-quill");

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
      items: [
        "product/quill",
        "product/quill",
        "product/quill",
      ],
      customProps: {
        icon: "play",
      },
    },


    title("Development Boards"),
    ref("product/quill", "Quill Series", "feather"),
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
      id: "product/quill",
      customProps: {
        icon: "info",
      },
    },
    {
      type: "doc",
      id: "product/quill",
      customProps: {
        icon: "checklist",
      },
    },
    {
      type: "link",
      label: "Store",
      href: "https://saleor.io/discord",
      customProps: {
        icon: "shop",
      },
    },
    {
      type: "link",
      label: "Report an Issue",
      href: "https://github.com/saleor/saleor-docs/issues/new",
      customProps: {
        icon: "feedback",
      },
    },
    {
      type: "link",
      label: "Join Discord",
      href: "https://saleor.io/discord",
      customProps: {
        icon: "discord",
      },
    },
  ],
  productQuill: [backToHome, ...productQuill],
};
