import React, { useState, useContext, useEffect } from 'react';
import {
    Text,
    TouchableOpacity,
    View,
    SafeAreaView,
    StyleSheet,
    TextInput,
    Image,
    ScrollView,
    Alert,
    FlatList,
    Dimensions,
} from "react-native";
import { COLOURS, SIZES } from "../../styles/index";
import { styles } from '../../styles/index';
import * as ImagePicker from 'expo-image-picker';
import AppContext from '../../../AppContext';
import { FIRESTORE_DB } from "../../../FirebaseConfig";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { collection, onSnapshot, query, where, doc, getDoc, setDoc, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import PagerView from 'react-native-pager-view';
//import { ImageSlider } from 'react-native-image-slider-box';
import { useNavigation } from '@react-navigation/native';

import ImagePager from './ImagePager';

const { width, height } = Dimensions.get('window');

const ProductPage = ({ route }) => {
    const { product } = route.params;

    if (!product) {
        return (
            <View style={localStyles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={localStyles.container}>
          {/* Product Name */}
          <Text style={localStyles.productName}>{product.name}</Text>
          
          {/* Product Image */}
          <Image source={{ uri: product.imageUri }} style={localStyles.productImage} />
          
          {/* Product Details in a "tabular" format */}
          <View style={localStyles.detailsContainer}>
            <View style={localStyles.detailRow}>
              <Text style={localStyles.detailTitle}>Description:</Text>
              <Text style={[localStyles.detailDescription,{marginLeft:"5%"}]}>{product.description}</Text>
            </View>
            <View style={localStyles.detailRow}>
              <Text style={localStyles.detailTitle}>Price:</Text>
              <Text style={localStyles.detailValue}>Rs {product.price}/-</Text>
            </View>
            <View style={localStyles.detailRow}>
              <Text style={localStyles.detailTitle}>In Stock:</Text>
              <Text style={localStyles.detailValue}>{product.inStock ? "Yes" : "No"}</Text>
            </View>
          </View>
        </ScrollView>
      );
}
const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
      },
      productName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
      },
      productImage: {
        width: '100%',
        height: 200,
        resizeMode: 'contain',
        marginBottom: 20,
      },
      detailsContainer: {
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        marginBottom:"10%"

      },
      detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
      },
      detailTitle: {
        fontWeight: 'bold',
      },
      detailValue: {
        color: '#666',
      },
      detailDescription: {
        flex: 1,
        flexWrap: 'wrap',
      },

});
export default ProductPage
