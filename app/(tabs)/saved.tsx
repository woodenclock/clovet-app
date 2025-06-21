import { Ionicons, Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  View, FlatList, Image, Dimensions,
  ActivityIndicator, Pressable, Modal, Button, StyleSheet, Text, Alert
} from 'react-native';

type Pin = { id: number; img: string; text: string; savedAt: number };

const GAP      = 10;
const NUM_COLS = 10;
const W        = Dimensions.get('window').width;
const TILE_W   = (W - GAP * (NUM_COLS + 1)) / NUM_COLS;
const API_URL  = 'http://localhost:3001/api/pins';

export default function SavedScreen() {
  const [pins, setPins]         = useState<Pin[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<Pin | null>(null);

  // --------─ fetch once ─--------
  useEffect(() => {
    console.log('Loading pins...');
    loadPins();
  }, []);
  
  const loadPins = async () => {
    try {
      setLoading(true);
      console.log('Fetching pins from API...');
      const res  = await fetch(API_URL);
      console.log('API response status:', res.status);
      const data = (await res.json()) as Pin[];
      console.log('Pins loaded:', data.length);
      setPins(data);
    } catch (error) {
      console.error('Error loading pins:', error);
      Alert.alert('Error', 'Failed to load saved items. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // --------─ delete helper ─--------
  const handleDelete = async (pin: Pin) => {
    await fetch(`${API_URL}/${pin.id}`, { method: 'DELETE' });
    setPins((prev) => prev.filter((p) => p.id !== pin.id));
    setSelected(null);
  };
  
  // --------─ delete all helper ─--------
  const handleDeleteAll = () => {
    console.log('Delete All button pressed');
    fetch(API_URL, { method: 'DELETE' })
      .then(res => {
        console.log('Delete response:', res.status);
        if (res.ok) setPins([]);
      })
      .catch(err => console.error('Delete failed:', err));
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={{ flex: 1 }}>
      {/* Header Toolbar */}
      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>Saved Items ({pins.length})</Text>
        {pins.length > 0 && (
          <Pressable 
            style={({ pressed }) => [
              styles.deleteAllBtn,
              pressed && { opacity: 0.7 }
            ]}
            onPress={handleDeleteAll}
          >
            <Text style={styles.deleteAllText}>Delete All</Text>
          </Pressable>
        )}
      </View>
    
      {/* Main Content */}
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
              pointerEvents="auto"
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
          <Pressable 
            style={styles.backdrop} 
            onPress={() => setSelected(null)}
          >
            {selected && (
              <Pressable 
                style={styles.modalContent}
                onPress={(e) => e.stopPropagation()}
              >
                <Pressable 
                  style={{ 
                    position: 'absolute', 
                    top: 10, 
                    right: 10, 
                    zIndex: 1,
                    padding: 5 
                  }}
                  onPress={() => setSelected(null)}
                >
                  <Feather name="x" size={24} color="#333" />
                </Pressable>
                <Image
                  source={{ uri: selected.img }}
                  style={styles.popupImg}
                  resizeMode="contain"
                />
                <View style={styles.btnRow}>
                  <Pressable 
                    style={{ 
                      backgroundColor: '#d33',
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 5
                    }}
                    onPress={() => handleDelete(selected)}
                  >
                    <Ionicons name="trash-outline" size={24} color="white" />
                    <View style={{ width: 5 }} />
                    <Text style={{ color: 'white', fontWeight: '500' }}>Delete</Text>
                  </Pressable>
                </View>
              </Pressable>
            )}
          </Pressable>
        </Modal>
      </View>
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
    width: '35%',
    padding: 10,
  },
  popupImg: {
    width: '100%',
    aspectRatio: 1,            // show true aspect; RN keeps ratio if height undefined
    marginBottom: 12,
    marginLeft: 12,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'space-between',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    zIndex: 10,
  },
  toolbarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d33',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    minWidth: 100,
    justifyContent: 'center',
    elevation: 2,
  },
  deleteAllText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 14,
  },
});
