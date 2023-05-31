<script>
  import Box from "./Box.svelte";
import Output from "./Output.svelte";
  import Source from "./Source.svelte";

  let state = null;

  const nodeTypes = [Source, Output];
  let nodes = [];

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let context;
  export function startContext() {
    context = new AudioContext();
  }

  export function createNode(e, nodeType) {
    e.preventDefault();
    const bb = e.target.getBoundingClientRect();
    state = {
      type: 'dragging',
      offX: e.clientX - bb.left,
      offY: e.clientY - bb.top,
      x: e.clientX,
      y: e.clientY,
      component: nodeType,
    }
  }

  export function updatePosition(e) {
    state.x = e.clientX;
    state.y = e.clientY;
  }

  export function insertNode() {
    nodes = [...nodes, {
      x: state.x - state.offX,
      y: state.y - state.offY,
      component: state.component,
    }];

    state = null;
  }

  export function moveNode(e, node) {
    e.preventDefault();
    nodes.splice(nodes.indexOf(node), 1);
    nodes = nodes;
    
    const bb = e.target.getBoundingClientRect();
    state = {
      type: 'dragging',
      offX: e.clientX - bb.left,
      offY: e.clientY - bb.top,
      x: e.clientX,
      y: e.clientY,
      component: node.component,
    }
  }


  
</script>
{#if context}
  <div class="layout">
    <div class="node-types">
      {#each nodeTypes as nodeType}
        <div class="node-type" on:pointerdown={e => createNode(e, nodeType)}>{nodeType.name}</div>
      {/each}
    </div>
      {#if !state}
      <svg>
        {#each nodes as node}
        <Box x={node.x} y={node.y} component={node.component} onDrag={e => moveNode(e, node)}>
          <svelte:component this={node.component} context={context} />
        </Box>
        {/each}
      </svg>
      {:else if state?.type === 'dragging'}
      <svg on:pointermove={updatePosition} on:pointerup={insertNode}>
        <Box x={state.x - state.offX} y={state.y - state.offY} component={state.component}>
          <svelte:component this={state.component} context={context} />
        </Box>
        {#each nodes as node}
        <Box x={node.x} y={node.y} component={node.component}>
          <svelte:component this={node.component} context={context} />
        </Box>
        {/each}
      </svg>
      {/if}
  </div>
{:else}
  <button on:click={startContext}>go</button>
{/if}
<style>
  .layout {
    height: 100%;
    display: flex;
    flex-direction: column;
    font-family: sans-serif;
    position: relative;
    background: #eee;
  }
  .node-types {
    min-height: 40px;
    display: flex;
    flex-direction: row;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }
  .node-type {
    padding: 10px;
    cursor: pointer;
  }
  svg {
    flex-grow: 1;
  }
</style>