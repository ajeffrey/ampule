<script>
  export let x;
  export let y;
  export let component;
  export let onDrag;

  let parent;
  let width = 100;
  let height = 100;

  $: {
    if(parent) {
      const bb = parent.getBoundingClientRect();
      width = bb.width;
      height = bb.height;
    }
  }
</script>
<foreignObject x={x} y={y} width={width} height={height}>
  <div class="container" bind:this={parent}>
    <div class="title" on:pointerdown={onDrag}>{component.name}</div>
    <div class="contents"><slot></slot></div>
  </div>
</foreignObject>

<style>
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