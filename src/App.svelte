<script>
  import shortid from "shortid";
  import * as Tone from "tone";
  import Box from "./Box.svelte";
  import Output from "./nodes/Output.svelte";
  import Source from "./nodes/Source.svelte";
  import Meter from "./nodes/Meter.svelte";
  import FFT from "./nodes/FFT.svelte";
  import Player from "./nodes/Player.svelte";
  import Wire from "./Wire.svelte";
  import Distortion from "./nodes/Distortion.svelte";
  import Switch from "./nodes/Switch.svelte";
    import Delay from "./nodes/Delay.svelte";

  const nodeTypes = [
    { component: Source, name: "Source" },
    { component: Meter, name: "Meter" },
    { component: FFT, name: "FFT" },
    { component: Output, name: "Output" },
    { component: Player, name: "Player" },
    { component: Distortion, name: "Distortion" },
    { component: Switch, name: "Switch" },
    { component: Delay, name: "Delay" }
  ];
  let nodes = [];
  let wires = [];
  let draggedNode = null;
  let draggedWire = null;
  let started = false;

  async function startContext() {
    if (!Tone.started) {
      await Tone.start();
      started = true;
    }
  }

  function createNode(e, nodeType) {
    e.preventDefault();
    const bb = e.target.getBoundingClientRect();
    const offX = e.clientX - bb.left;
    const offY = e.clientY - bb.top;
    draggedNode = {
      id: shortid(),
      offX,
      offY,
      x: e.clientX - offX,
      y: e.clientY - offY,
      component: nodeType,
      isGhost: true,
    };

    nodes.push(draggedNode);
  }

  function moveNode({ detail: e }, node) {
    e.preventDefault();

    const bb = e.target.getBoundingClientRect();
    const offX = e.clientX - bb.left;
    const offY = e.clientY - bb.top;

    draggedNode = node;
    node.offX = offX;
    node.offY = offY;
  }

  function startWire(event, node) {
    const { e, port } = event.detail;
    e.preventDefault();
    draggedWire = {
      fromNode: node.id,
      from: port,
      to: {
        x: e.clientX,
        y: e.clientY,
      },
    };
  }

  function pointerUp() {
    if (draggedNode) {
      draggedNode.isGhost = false;
      draggedNode = null;
      nodes = nodes;
    } else if (draggedWire) {
      if (draggedWire.to.el) {
        wires.push(draggedWire);
        wires = wires;
        const input =
          draggedWire.to.dir === "input" ? draggedWire.to : draggedWire.from;
        const output =
          draggedWire.to.dir === "output" ? draggedWire.to : draggedWire.from;
        output.source.connect(input.sink);
      }
      draggedWire = null;
    }
  }

  function pointerMove(e) {
    if (draggedNode) {
      draggedNode.x = e.clientX - draggedNode.offX;
      draggedNode.y = e.clientY - draggedNode.offY;
      nodes = nodes;

      for (const wire of wires) {
        if (wire.fromNode === draggedNode.id && wire.from.el) {
          const bb = wire.from.el.getBoundingClientRect();
          wire.from.y = bb.top + bb.height / 2;
          wire.from.x = bb.right;
        } else if (wire.toNode === draggedNode.id && wire.to.el) {
          const bb = wire.to.el.getBoundingClientRect();
          wire.to.y = bb.top + bb.height / 2;
          wire.to.x = bb.left;
        }
      }

      wires = wires;
    } else if (draggedWire) {
      draggedWire.to = {
        x: e.clientX,
        y: e.clientY,
      };
      draggedWire.toNode = null;
      draggedWire = draggedWire;
    }
  }

  function pointerOverPort(event, node) {
    const { e, port } = event.detail;
    if (draggedWire && draggedWire.from.dir !== port.dir) {
      e.stopPropagation();
      draggedWire.to = port;
      draggedWire.toNode = node.id;
      draggedWire = draggedWire;
    }
  }
</script>

<div class="layout">
  <div
    class={`overlay${started ? " overlay-hidden" : ""}`}
    on:click={startContext}
    on:keydown={startContext}
  >
    <i class={`fa fa-${started ? "unlock" : "lock"}`} />
  </div>
  <div class="node-types-outer">
    <div class="node-types">
      {#each nodeTypes as nodeType}
        <div class="node-type" on:pointerdown={(e) => createNode(e, nodeType.component)}>
          {nodeType.name}
        </div>
      {/each}
    </div>
  </div>
  <svg on:pointerup={pointerUp} on:pointermove={pointerMove}>
    {#if draggedWire}
      <Wire from={draggedWire.from} to={draggedWire.to} />
    {/if}
    {#each wires as wire}
      <Wire from={wire.from} to={wire.to} />
    {/each}
    {#each nodes as node}
      <Box
        x={node.x}
        y={node.y}
        component={node.component}
        on:dragstart={(e) => moveNode(e, node)}
        on:startwire={(e) => startWire(e, node)}
        on:pointeroverport={(e) => pointerOverPort(e, node)}
        isGhost={node.isGhost}
      />
    {/each}
  </svg>
</div>

<style lang="scss">
  .layout {
    height: 100%;
    display: flex;
    flex-direction: column;
    font-family: sans-serif;
    position: relative;
    background: url(https://www.toptal.com/designers/subtlepatterns/uploads/denim.png);
    touch-action: none;
  }
  .overlay {
    position: absolute;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.25);
    opacity: 1;
    transition: opacity 0.25s;
    text-align: center;
    line-height: 100vh;
    font-size: 100px;
    color: rgba(255, 255, 255, 0.25);
    &-hidden {
      opacity: 0;
      pointer-events: none;
    }
  }
  .node-types {
    min-height: 40px;
    display: flex;
    flex-direction: row;
    position: absolute;
    border-bottom: 3px solid #606dbc;
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.25);
    top: 0;
    left: 0;
    right: 0;
    background: repeating-linear-gradient(
      -45deg,
      #606dbc,
      #606dbc 10px,
      #465298 10px,
      #465298 20px
    );
  }
  .node-type {
    padding: 10px 20px;
    cursor: pointer;
    text-transform: uppercase;
    font-size: 14px;
    font-weight: bold;
    line-height: 20px;
    color: #fff;
    text-shadow: 0 1px 1px #000;
  }
  svg {
    flex-grow: 1;
  }
</style>
