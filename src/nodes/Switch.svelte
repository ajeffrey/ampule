<svelte:options accessors />

<script>
  import { Channel } from "tone";

  let prevOutputCount = 0;
  let outputCount = "2";
  const distributor = new Channel();

  export let ports = [
    { dir: "input", name: "input", type: "audio", sink: distributor },
  ];

  function updateOutputCount() {
    if (
      typeof outputCount === "number" ||
      (typeof outputCount === "string" && outputCount.match(/^0|([1-9]\d*)$/))
    ) {
      const nextOutputCount =
        typeof outputCount === "number"
          ? outputCount
          : parseInt(outputCount, 10);
      const change = nextOutputCount - prevOutputCount;
      if (change > 0) {
        for (let i = 0; i < change; i++) {
          const output = new Channel();
          distributor.connect(output);
          ports.push({
            dir: "output",
            name: "output",
            type: "audio",
            source: output,
          });
        }
        ports = ports;
      } else if (change < 0) {
        for (let i = 0; i < Math.abs(change); i++) {
          const output = ports.pop();
          distributor.disconnect(output.source);
          output.source.dispose();
        }
        ports = ports;
      }

      prevOutputCount = nextOutputCount;
    }
  }

  updateOutputCount();
</script>

<div class="options">
  <input
    type="number"
    class="output-count"
    inputmode="numeric"
    pattern="^0|([1-9][0-9]*)$"
    bind:value={outputCount}
    on:input={updateOutputCount}
  />
</div>

<style lang="scss">
  .options {
    display: flex;
    flex-direction: row;
  }
  .output-count {
    border: none;
    border-radius: 0;
    border-right: none;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
    height: 26px;
    line-height: 24px;
    flex-grow: 1;
    padding: 0;
    min-width: 0px;
    text-indent: 5px;
  }
</style>
