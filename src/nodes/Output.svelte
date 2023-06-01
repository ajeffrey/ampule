<script>
  import { getDestination } from 'tone';
  
  export const ports = [
    { dir: 'input', name: 'output', type: 'audio', sink: getDestination() }
  ];

</script>
<div>output</div>