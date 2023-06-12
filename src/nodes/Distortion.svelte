<script>
  import { Distortion } from 'tone';

  const effect = new Distortion(0.8);
  
  export const ports = [
    { dir: 'input', name: 'input', type: 'audio', sink: effect },
    { dir: 'output', name: 'output', type: 'audio', source: effect },
  ];

</script>