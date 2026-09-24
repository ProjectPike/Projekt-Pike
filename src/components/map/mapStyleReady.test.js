import test from "node:test";
import assert from "node:assert/strict";
import { runWhenMapStyleReady } from "./mapStyleReady.js";

function createMap() {
  const listeners = new Map();

  return {
    styleLoaded: false,
    isStyleLoaded() {
      return this.styleLoaded;
    },
    on(eventName, listener) {
      const eventListeners = listeners.get(eventName) ?? [];
      eventListeners.push(listener);
      listeners.set(eventName, eventListeners);
    },
    off(eventName, listener) {
      listeners.set(
        eventName,
        (listeners.get(eventName) ?? []).filter((candidate) => candidate !== listener),
      );
    },
    fire(eventName) {
      for (const listener of [...(listeners.get(eventName) ?? [])]) {
        listener();
      }
    },
    listenerCount(eventName) {
      return (listeners.get(eventName) ?? []).length;
    },
  };
}

test("initialization runs immediately when the style is already ready", () => {
  const map = createMap();
  map.styleLoaded = true;
  let initializeCount = 0;

  runWhenMapStyleReady(map, () => {
    initializeCount += 1;
  });

  assert.equal(initializeCount, 1);
  assert.equal(map.listenerCount("load"), 0);
  assert.equal(map.listenerCount("data"), 0);
});

test("POI initialization survives a mask source making style unready during load", () => {
  const map = createMap();
  let maskInitialized = false;
  let pointInitialized = false;
  let pointSourceFeatureCount = 0;
  let pointLayerCount = 0;

  runWhenMapStyleReady(map, () => {
    maskInitialized = true;
    // Adding the external mask GeoJSON source starts an asynchronous source load.
    map.styleLoaded = false;
  });
  runWhenMapStyleReady(map, () => {
    pointInitialized = true;
    pointSourceFeatureCount = 10;
    pointLayerCount = 4;
  });

  map.styleLoaded = true;
  map.fire("load");

  assert.equal(maskInitialized, true);
  assert.equal(pointInitialized, false);
  assert.equal(pointSourceFeatureCount, 0);
  assert.equal(pointLayerCount, 0);
  assert.equal(map.listenerCount("idle"), 1);

  map.styleLoaded = true;
  map.fire("data");

  assert.equal(pointInitialized, true);
  assert.equal(pointSourceFeatureCount, 10);
  assert.equal(pointLayerCount, 4);
  assert.equal(map.listenerCount("load"), 0);
  assert.equal(map.listenerCount("idle"), 0);
});

test("failed initialization remains subscribed until a later ready event", () => {
  const map = createMap();
  map.styleLoaded = true;
  let initializeCount = 0;

  runWhenMapStyleReady(map, () => {
    initializeCount += 1;
    return initializeCount === 1 ? false : true;
  });

  assert.equal(initializeCount, 1);
  map.fire("idle");
  assert.equal(initializeCount, 2);
  map.fire("idle");
  assert.equal(initializeCount, 2);
});

test("cleanup prevents initialization after unmount", () => {
  const map = createMap();
  let initializeCount = 0;
  const stop = runWhenMapStyleReady(map, () => {
    initializeCount += 1;
  });

  stop();
  map.styleLoaded = true;
  map.fire("load");

  assert.equal(initializeCount, 0);
});
