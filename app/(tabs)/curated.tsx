import { Ionicons, Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  View, FlatList, Image, Dimensions,
  ActivityIndicator, Pressable, Modal, StyleSheet, Text
} from 'react-native';

type Pin = { id: number; img: string; text: string; savedAt: number };
type CuratedItem = { id: number; img: string; text: string; reason: string };

const GAP = 10;
const NUM_COLS = 5; // Fewer columns for larger images
const W = Dimensions.get('window').width;
const TILE_W = (W - GAP * (NUM_COLS + 1)) / NUM_COLS;
const API_URL = 'http://localhost:3001/api/pins';

export default function CuratedScreen() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [curatedItems, setCuratedItems] = useState<CuratedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CuratedItem | null>(null);
  const [statusMessage, setStatusMessage] = useState<{text: string, isError: boolean} | null>(null);

  // Load all pins first
  useEffect(() => {
    loadPins();
  }, []);

  // When pins change, generate curated items
  useEffect(() => {
    if (pins.length > 0) {
      generateCuratedItems();
    }
  }, [pins]);

  const loadPins = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = (await res.json()) as Pin[];
      setPins(data);
    } catch (error) {
      console.error('Error loading pins:', error);
      setStatusMessage({ text: 'Failed to load saved items. Please check your connection.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const generateCuratedItems = async () => {
    try {
      setLoading(true);
      
      // Prepare data for the AI API
      const pinData = pins.map(pin => ({
        id: pin.id,
        img: pin.img,
        text: pin.text
      }));

      try {
        // Call your backend endpoint that will use ChatGPT API
        const response = await fetch('http://localhost:3001/api/curate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ pins: pinData })
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const curatedData = await response.json();
        setCuratedItems(curatedData);
      } catch (apiError) {
        console.error('API error:', apiError);
        
        // Local fallback: Select random items if API fails
        const fallbackItems = createLocalCuration(pins);
        setCuratedItems(fallbackItems);
        
        setStatusMessage({ 
          text: 'Using local curation (API unavailable)', 
          isError: true 
        });
        
        // Auto-hide the message after 3 seconds
        setTimeout(() => {
          setStatusMessage(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error generating curated items:', error);
      setStatusMessage({ 
        text: 'Failed to generate curated collection. Please try again.', 
        isError: true 
      });
    } finally {
      setLoading(false);
    }
  };

  // Local fallback function to create curated items without API
  const createLocalCuration = (items: Pin[]): CuratedItem[] => {
    // If we have 3 or fewer items, just use all of them
    if (items.length <= 3) {
      return items.map(item => ({
        ...item,
        reason: "Selected because you have a small collection."
      }));
    }
    
    // Otherwise, select 3 random items
    return [...items]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(item => ({
        ...item,
        reason: "Selected randomly based on your collection."
      }));
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>Curated Collection</Text>
        <Pressable 
          style={({ pressed }) => [
            styles.refreshBtn,
            pressed && { opacity: 0.7 }
          ]}
          onPress={generateCuratedItems}
        >
          <Ionicons name="refresh" size={18} color="white" />
          <Text style={styles.refreshBtnText}>Refresh</Text>
        </Pressable>
      </View>

      {/* Status Message */}
      {statusMessage && (
        <View style={[
          styles.statusMessage, 
          statusMessage.isError ? styles.errorMessage : styles.successMessage
        ]}>
          <Text style={styles.statusText}>{statusMessage.text}</Text>
        </View>
      )}

      {/* Main Content */}
      <View style={{ flex: 1, padding: GAP }}>
        {curatedItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="shirt-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>
              No curated items yet. Add more clothing to your saved items.
            </Text>
          </View>
        ) : (
          <FlatList
            data={curatedItems}
            keyExtractor={(item) => item.id.toString()}
            numColumns={NUM_COLS}
            columnWrapperStyle={{ gap: GAP }}
            ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setSelected(item)}
                style={styles.itemContainer}
              >
                <Image
                  source={{ uri: item.img }}
                  style={styles.tile}
                  resizeMode="cover"
                />
                <View style={styles.itemOverlay}>
                  <Text style={styles.itemText} numberOfLines={2}>
                    {item.text}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        )}

        {/* Detail Modal */}
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
                <Text style={styles.itemTitle}>{selected.text}</Text>
                <View style={styles.reasonContainer}>
                  <Text style={styles.reasonTitle}>Why this was selected:</Text>
                  <Text style={styles.reasonText}>{selected.reason}</Text>
                </View>
              </Pressable>
            )}
          </Pressable>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: TILE_W,
    height: TILE_W * 1.5,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  itemContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  itemOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
  },
  itemText: {
    color: 'white',
    fontSize: 12,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  reasonContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  reasonTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reasonText: {
    lineHeight: 20,
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
    padding: 20,
  },
  popupImg: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: 12,
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
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    minWidth: 100,
    justifyContent: 'center',
    elevation: 2,
  },
  refreshBtnText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 14,
  },
  statusMessage: {
    position: 'absolute',
    top: 70,
    left: '50%',
    transform: [{ translateX: -150 }],
    width: 300,
    padding: 12,
    borderRadius: 5,
    zIndex: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorMessage: {
    backgroundColor: '#d33',
  },
  successMessage: {
    backgroundColor: '#4CAF50',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
}); 