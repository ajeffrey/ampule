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
    const offX = e.clientX - bb.left;
    const offY = e.clientY - bb.top;
    state = {
      type: 'dragging',
      offX,
      offY,
      x: e.clientX - offX,
      y: e.clientY - offY,
      component: nodeType,
    }
  }

  export function updatePosition(e) {
    state.x = e.clientX - state.offX;
    state.y = e.clientY - state.offY;
  }

  export function insertNode() {
    nodes = [...nodes, {
      x: state.x,
      y: state.y,
      component: state.component,
    }];

    state = null;
  }

  export function moveNode(e, node) {
    e.preventDefault();
    nodes.splice(nodes.indexOf(node), 1);
    nodes = nodes;
    
    const bb = e.target.getBoundingClientRect();
    const offX = e.clientX - bb.left;
    const offY = e.clientY - bb.top;
    console.log('movenode')

    state = {
      type: 'dragging',
      offX,
      offY,
      x: e.clientX - offX,
      y: e.clientY - offY,
      component: node.component,
    }
  }

  let draggedNode = null;
  let svgEvents = {};

  $: {
    switch(state?.type) {
      case 'dragging': {
        draggedNode = state;
        svgEvents = {
          'pointermove': updatePosition,
          'pointerup': insertNode
        };
        console.log('dragging')
        break;
      }
      default: {
        draggedNode = null;
        svgEvents = {};
        break;
      }
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
      <svg on:pointerup={svgEvents.pointerup} on:pointermove={svgEvents.pointermove}>
        {#if draggedNode}
          <Box x={draggedNode.x} y={draggedNode.y} component={draggedNode.component} isGhost={true}>
            <svelte:component this={draggedNode.component} context={context} />
          </Box>
        {/if}
        {#each nodes as node}
        <Box x={node.x} y={node.y} component={node.component} onDrag={e => moveNode(e, node)}>
          <svelte:component this={node.component} context={context} />
        </Box>
        {/each}
      </svg>
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
    touch-action: none;
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
