import { Gamepad2, Plus, RotateCcw, Trash } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SEED_ROSTER } from '../data/seed';
import { useRoster } from '../engines/hooks';
import { uid } from '../lib/utils';
import { C, PALETTE, R } from '../theme';
import { Btn, Card, Col, Field, IconBtn, Row, Section, Sheet, Stat, Tag, Txt } from '../ui';

export function RosterScreen() {
  const [roster, setRoster] = useRoster();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [nick, setNick] = useState('');
  const [club, setClub] = useState('');
  const [ef, setEf] = useState(true);
  const efCount = roster.filter((c) => c.efootball).length;

  const add = () => {
    if (!name.trim()) return;
    setRoster((r) => [...r, { id: uid(), name: name.trim(), nick: nick.trim(), club: club.trim() || 'No club', efootball: ef }]);
    setName('');
    setNick('');
    setClub('');
    setOpen(false);
  };

  return (
    <Col>
      <Txt v="display">Classmate Roster</Txt>
      <Txt v="small" color={C.muted}>
        Every wheel, vote and hot seat in the arena pulls names from here.
      </Txt>
      <Row>
        <Stat label="Classmates" value={roster.length} />
        <Stat label="eFootballers" value={efCount} color={C.cobalt} />
      </Row>
      <Row>
        <Btn flex title="Add classmate" icon={Plus} color={C.primary} onPress={() => setOpen(true)} />
        <IconBtn icon={RotateCcw} onPress={() => setRoster(SEED_ROSTER)} label="Restore sample class" size={46} />
      </Row>
      <Section title="Tap the controller to toggle eFootball player">
        {roster.map((c, i) => (
          <Card key={c.id} pad={12}>
            <Row gap={12}>
              <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: PALETTE[i % 5], alignItems: 'center', justifyContent: 'center' }}>
                <Txt v="h3">{c.name.charAt(0).toUpperCase()}</Txt>
              </View>
              <Col gap={2} style={{ flex: 1 }}>
                <Txt v="h3" numberOfLines={1}>
                  {c.name}
                </Txt>
                <Txt v="small" color={C.muted} numberOfLines={1}>
                  {c.nick ? `“${c.nick}” · ` : ''}
                  {c.club}
                </Txt>
              </Col>
              <Pressable
                onPress={() => setRoster((r) => r.map((x) => (x.id === c.id ? { ...x, efootball: !x.efootball } : x)))}
                hitSlop={6}
                style={{ padding: 8, borderRadius: R.pill, backgroundColor: c.efootball ? C.cobalt : C.card2 }}
                accessibilityLabel="Toggle eFootball player"
              >
                <Gamepad2 size={16} color={c.efootball ? C.text : C.muted} />
              </Pressable>
              <IconBtn icon={Trash} size={34} color={C.muted} onPress={() => setRoster((r) => r.filter((x) => x.id !== c.id))} label={`Remove ${c.name}`} />
            </Row>
          </Card>
        ))}
      </Section>
      <Sheet visible={open} onClose={() => setOpen(false)} title="New classmate">
        <Field label="Full name" value={name} onChangeText={setName} placeholder="e.g. Aline Uwase" maxLength={40} />
        <Field label="Nickname" value={nick} onChangeText={setNick} placeholder="e.g. The Notetaker" maxLength={30} />
        <Field label="Favourite club" value={club} onChangeText={setClub} placeholder="e.g. Arsenal" maxLength={24} />
        <Pressable onPress={() => setEf((v) => !v)}>
          <Row>
            <Tag label={ef ? '✓ PLAYS eFOOTBALL' : 'DOES NOT PLAY eFOOTBALL'} color={ef ? C.cobalt : C.card2} />
          </Row>
        </Pressable>
        <Btn title="Add to roster" color={C.primary} onPress={add} disabled={!name.trim()} />
      </Sheet>
    </Col>
  );
}
