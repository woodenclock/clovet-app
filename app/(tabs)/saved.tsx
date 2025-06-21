import { Ionicons, Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  View, FlatList, Image, Dimensions,
  ActivityIndicator, Pressable, Modal, Button, StyleSheet
} from 'react-native';

type Pin = { id: number; img: string; text: string; savedAt: number };

const GAP      = 10;
const NUM_COLS = 10;
const W        = Dimensions.get('window').width;
const TILE_W   = (W - GAP * (NUM_COLS + 1)) / NUM_COLS;

export default function SavedScreen() {
  const [pins, setPins]         = useState<Pin[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<Pin | null>(null);

  // --------─ fetch once ─--------
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch('http://localhost:3001/api/pins');
        const data = (await res.json()) as Pin[];
        setPins(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // --------─ delete helper ─--------
  const handleDelete = async (pin: Pin) => {
    await fetch(`http://localhost:3001/api/pins/${pin.id}`, { method: 'DELETE' });
    setPins((prev) => prev.filter((p) => p.id !== pin.id));
    setSelected(null);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={{ flex: 1, padding: GAP }}>
      {/* ----- grid ----- */}
      <FlatList
        data={pins}
        keyExtractor={(item) => item.id.toString()}
        numColumns={NUM_COLS}
        columnWrapperStyle={{ gap: GAP }}
        ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelected(item)}
            style={{ cursor: 'pointer' }}       // <- pointer on web
          >
            <Image
              source={{ uri: item.img }}
              style={styles.tile}
              resizeMode="cover"
            />
          </Pressable>
        )}
      />

      {/* ----- modal ----- */}
      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.backdrop}>
          {selected && (
            <View style={styles.modalContent}>
              <Image
                source={{ uri: selected.img }}
                style={styles.popupImg}
                resizeMode="contain"
              />
              <View style={styles.btnRow}>
                <Button title="Delete" color="#d33" onPress={() => handleDelete(selected)} />
                <Button title="Close"  onPress={() => setSelected(null)} />
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  tile: {
    width:  TILE_W,
    height: TILE_W * 1.5,      // taller rectangular tile
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    minWidth: '50%',
    padding: 15,
  },
  closeIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
  },
  popupImg: {
    width: '100%',
    aspectRatio: 1,            // show true aspect; RN keeps ratio if height undefined
    marginBottom: 12,
    marginLeft: 12,
  },
  delButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#d33',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginVertical: 12,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
