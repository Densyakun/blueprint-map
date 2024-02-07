import { Html } from '@react-three/drei';
import { scale } from '@/lib/planet';

export function CityNameTest({ position }: { position: [number, number] }) {
  const [lon, lat] = position;

  return (
    <Html
      center
      position={[
        Math.cos(lon * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * scale,
        Math.sin(lat * Math.PI / 180) * scale,
        -Math.sin(lon * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * scale
      ]}
    >
      日本橋
    </Html>
  );
}