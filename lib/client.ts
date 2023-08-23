import YjsClient from "./yjsClient";

export let yjsClient: YjsClient;

function setup() {
  if (typeof window === "undefined") {
    return;
  }

  yjsClient = new YjsClient();
}

setup();