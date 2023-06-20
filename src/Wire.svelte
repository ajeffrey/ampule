<script>
  import { TYPE_COLOURS } from './constants';
  
  export let from;
  export let to;

</script>
<path d={`M${from.x} ${from.y} L ${to.x} ${to.y}`} fill="transparent" stroke={TYPE_COLOURS[from.type]} stroke-width="2" />