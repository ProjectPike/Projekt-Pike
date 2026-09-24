const STYLE_READY_EVENTS = ["load", "styledata", "data", "idle"];

export function runWhenMapStyleReady(map, initialize) {
  let active = true;
  let running = false;

  const stop = () => {
    if (!active) {
      return;
    }

    active = false;
    for (const eventName of STYLE_READY_EVENTS) {
      map.off(eventName, attempt);
    }
  };

  const attempt = () => {
    if (!active || running || !map.isStyleLoaded()) {
      return false;
    }

    running = true;
    const initialized = initialize();
    running = false;

    if (initialized === false) {
      return false;
    }

    stop();
    return true;
  };

  for (const eventName of STYLE_READY_EVENTS) {
    map.on(eventName, attempt);
  }
  attempt();

  return stop;
}
