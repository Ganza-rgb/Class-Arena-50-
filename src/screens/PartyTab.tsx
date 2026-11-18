import { View } from 'react-native';
import { ModuleGrid } from '../components/ModuleCard';
import { MODULES } from '../modules/registry';
import { SectionHead, TabTitle } from './common';

export function PartyTab({ width }: { width: number }) {
  const party = MODULES.filter((m) => m.cat === 'party');
  const duo = MODULES.filter((m) => m.cat === 'arcade' && m.tag === '2-PLAYER');
  const vibes = MODULES.filter((m) => m.cat === 'vibes');
  const quick = MODULES.filter((m) => ['rps', 'dice'].includes(m.id));
  return (
    <View style={{ gap: 16 }}>
      <TabTitle title="Class Night" sub="Pass the phone. Roast kindly. Crown a champion." art="party" />
      <SectionHead title="Pass-the-phone" art="confetti" count={party.length} />
      <ModuleGrid modules={party} width={width} />
      <SectionHead title="Same-screen 2-player" art="joystick" count={duo.length} />
      <ModuleGrid modules={duo} width={width} />
      <SectionHead title="Set the vibe" art="notes" count={vibes.length} />
      <ModuleGrid modules={vibes} width={width} />
      <SectionHead title="Settle it fast" art="dice" count={quick.length} />
      <ModuleGrid modules={quick} width={width} />
    </View>
  );
}
