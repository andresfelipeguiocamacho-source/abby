import { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, type MapStyleElement } from 'react-native-maps';

import { BOGOTA_REGION, stationKindColor } from '@/data/stations';
import { colors } from '@/lib/theme';
import type { StationMapHandle, StationMapProps } from './StationMap.types';

/** Estilo oscuro para Google Maps (Android). En iOS se usa Apple Maps en modo oscuro. */
const darkStyle: MapStyleElement[] = [
  { elementType: 'geometry', stylers: [{ color: '#0b1220' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b7a90' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#05070d' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2335' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#243049' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d2a3a' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#0d1626' }] },
];

export const StationMap = forwardRef<StationMapHandle, StationMapProps>(function StationMap(
  { stations, selectedId, onSelect, userLocation, height },
  ref,
) {
  const map = useRef<MapView>(null);

  useImperativeHandle(ref, () => ({
    focus: (p, zoom = 'near') =>
      map.current?.animateToRegion(
        zoom === 'city' ? BOGOTA_REGION : { latitude: p.latitude, longitude: p.longitude, latitudeDelta: 0.06, longitudeDelta: 0.05 },
        650,
      ),
  }));

  return (
    <View style={[styles.wrap, { height }]}>
      <MapView
        ref={map}
        style={StyleSheet.absoluteFill}
        initialRegion={BOGOTA_REGION}
        customMapStyle={darkStyle}
        userInterfaceStyle="dark"
        showsUserLocation={!!userLocation}
        showsPointsOfInterests={false}
        toolbarEnabled={false}
        showsCompass={false}
      >
        {stations.map((s) => {
          const c = stationKindColor[s.kind];
          const on = s.id === selectedId;
          return (
            <Marker
              key={`${s.id}-${on ? 1 : 0}`}
              coordinate={{ latitude: s.latitude, longitude: s.longitude }}
              onPress={() => onSelect(s.id)}
              tracksViewChanges={false}
              title={s.name}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={[styles.ring, s.free && styles.free, on && { width: 40, height: 40, borderRadius: 20 }]}>
                <View style={[styles.dot, { backgroundColor: c }, on && { width: 24, height: 24, borderRadius: 12 }]} />
              </View>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: '#0b1220' },
  ring: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5,7,13,0.6)',
  },
  free: { borderWidth: 3, borderColor: colors.pink },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.bg },
});
