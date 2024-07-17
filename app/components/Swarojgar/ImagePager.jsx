// ImagePager.js
import React, { useState } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import PagerView from 'react-native-pager-view';

const { width,height } = Dimensions.get('window');

const ImagePager = ({ shopImages }) => {
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <View style={styles.container}>
      <PagerView
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {shopImages.map((uri, index) => (
          <View key={index} style={styles.page}>
            <Image source={{ uri }} style={styles.image} />
          </View>
        ))}
      </PagerView>
      <View style={styles.dotContainer}>
        {shopImages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentPage === index ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: height/3,
    // backgroundColor: "red",
  },
  pagerView: {
    flex: 1,
  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: "100%",
    height: '100%',
    resizeMode: 'cover',
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'blue',
  },
  inactiveDot: {
    backgroundColor: 'gray',
  },
});

export default ImagePager;
