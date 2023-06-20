<script lang="typescript">
  import { SvelteComponent, afterUpdate, createEventDispatcher } from "svelte";
  import { TYPE_COLOURS } from "./constants";

  export let x;
  export let y;
  export let component;
  export let isGhost = false;

  const dispatch = createEventDispatcher();

  let parent;
  let width = 200;
  let height = 10;
  let ports;
  let container;
  let observer: ResizeObserver;
  let renaming = false;
  let name = component.name;
  let title;

  $: rootClass = isGhost ? 'is-ghost' : "";

  function onDragStart(e) {
    dispatch('dragstart', e);
  }

  function onStartWire(e, port) {
    dispatch('startwire', { e, port });
  }

  function onPointerOverPort(e, port) {
    dispatch('pointeroverport', { e, port });
  }

  function startRename() {
    renaming = true;
    title.focus();
  }

  function stopRename() {
    renaming = false;
  }

  $: {
    if(x && y && ports) {
      for(const port of ports) {
        if(port.el) {
          const bb = port.el.getBoundingClientRect();
          port.y = bb.top + bb.height / 2;
          port.x = port.dir === 'input' ? bb.left : bb.right;
        }
      }
      ports = ports;
    }
  }

  afterUpdate(() => {
    if (parent && container) {
      setTimeout(() => {
        const bb = parent.getBoundingClientRect();
        width = bb.width;
        container.setAttribute("width", bb.width + 20);
        height = bb.height;
        container.setAttribute("height", bb.height + 20);
      });
    }
  });

  $: {
    if(parent && !observer) {
      observer = new ResizeObserver(() => {
        const bb = parent.getBoundingClientRect();
        width = bb.width;
        container.setAttribute("width", bb.width + 20);
        height = bb.height;
        container.setAttribute("height", bb.height + 20);
      });

      observer.observe(parent);
    }
  }
</script>

<foreignObject
  bind:this={container}
  class={rootClass}
  x={x - 10}
  y={y - 10}
  width={width + 20}
  height={height + 20}
>
  <div class="container" bind:this={parent}>
    <div class="title" data-value={name} on:pointerdown={onDragStart} on:dblclick={startRename}>
      <input
        type="text"
        class={`title-inner${renaming ? '' : ' readonly'}`}
        size={1}
        bind:value={name}
        bind:this={title}
        readonly={!renaming}
        on:blur={stopRename}
      />
    </div>
    <div class="body">
      <div class="ports">
        {#if ports?.length}
          {#each ports as port}
            <div
              class={`port port-${port.dir}`}
              style={`--type-color: ${TYPE_COLOURS[port.type]}`}
              bind:this={port.el}
              on:pointerdown={(e) => onStartWire(e, port)}
              on:pointermove={(e) => onPointerOverPort(e, port)}
            >
              <div class="port-type">{port.type}</div>
              <div class="port-name">{port.name}</div>
            </div>
          {/each}
        {/if}
      </div>
      <div class="contents">
        <svelte:component this={component} bind:ports={ports} />
      </div>
    </div>
  </div>
</foreignObject>

<style lang="scss">
.is-ghost {
  pointer-events: none;
  opacity: 0.5;
}
.container {
  margin: 10px;
  font-size: 14px;
}
.title {
  display: inline-grid;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.25);
  &-inner {
    position: relative;
    z-index: 2;
    background: #fff;
    padding: 5px 10px;
    border: none;
    &.readonly {
      cursor: move;
    }
  }
  
  &::after {
    content: attr(data-value) ' ';
    visibility: hidden;
    white-space: pre-wrap;
  }
  &::after,&-inner {
    width: auto;
    min-width: 1em;
    grid-area: 1 / 2;
    font: inherit;
    padding: 5px 10px;
    margin: 0;
    resize: none;
    appearance: none;
    border: none;
  }
}
.body {
  background: white;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.25);
  position: relative;
  z-index: 1;
}
.port {
  position: relative;
  padding: 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  cursor: pointer;

  &-type {
    color: #999;
  }

  &:after {
    content: "";
    position: absolute;
    background: var(--type-color);
    border: 1px solid #999;
    z-index: 1;
    width: 10px;
    height: 10px;
    border-radius: 100%;
    top: 50%;
    margin-top: -5px;
  }

  &-input:after {
    left: -5px;
  }

  &-output {
    flex-direction: row-reverse;
    &:after {
      right: -5px;
    }
  }
}
.contents {
  padding: 10px;
  background: repeating-linear-gradient(
  -45deg,
  #606dbc,
  #606dbc 10px,
  #465298 10px,
  #465298 20px
);
}
</style>
