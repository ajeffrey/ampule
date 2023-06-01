<script>
  import { afterUpdate, createEventDispatcher } from "svelte";
  import { TYPE_COLOURS } from "./constants";

  export let x;
  export let y;
  export let component;
  export let isGhost = false;

  const dispatch = createEventDispatcher();

  let parent;
  let width = 200;
  let height = 10;
  let instance;
  let container;
  let dimensionsFixed = false;

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

  $: {
    if(x && y && instance) {
      for(const port of instance.ports) {
        if(port.el) {
          console.log('el');
          const bb = port.el.getBoundingClientRect();
          port.y = bb.top + bb.height / 2;
          port.x = port.dir === 'input' ? bb.left : bb.right;
        } else {
          console.log('no el?');
        }
      }
      instance = instance;
    }
  }

  afterUpdate(() => {
    if (parent && container && !dimensionsFixed) {
      setTimeout(() => {
        const bb = parent.getBoundingClientRect();
        dimensionsFixed = true;
        width = bb.width;
        container.setAttribute("width", bb.width + 20);
        height = bb.height;
        container.setAttribute("height", bb.height + 20);
      });
    }
  });
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
    <div class="title" on:pointerdown={onDragStart}>
      <div class="title-inner">{component.name}</div>
    </div>
    <div class="body">
      <div class="ports">
        {#if instance}
          {#each instance.ports || [] as port}
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
        <svelte:component this={component} bind:this={instance} />
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
  cursor: move;
  display: inline-block;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.25);
  &-inner {
    position: relative;
    z-index: 2;
    background: #fff;
    padding: 5px 10px;
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
