<script>
  export let x;
  export let y;
  export let component;
  export let onDrag;
  export let isGhost = false;

  let parent;
  let width = 100;
  let height = 100;

  let rootClass = '';
  if(isGhost) {
    rootClass = 'is-ghost';
  }

  $: {
    if(parent) {
      const bb = parent.getBoundingClientRect();
      width = bb.width;
      height = bb.height;
    }
  }
</script>
<foreignObject class={rootClass} x={x} y={y} width={width} height={height}>
  <div class="container" bind:this={parent}>
    <div class="title" on:pointerdown={onDrag}>{component.name}</div>
    <div class="contents"><slot></slot></div>
  </div>
</foreignObject>

<style>
.is-ghost {
  pointer-events: none;
  opacity: 0.5;
}
.container {
  border: 1px solid #666;
}
.title {
  background: #fff;
  padding: 5px;
  font-size: 16px;
  cursor: move;
}
.contents {
  padding: 5px;
}
</style>
