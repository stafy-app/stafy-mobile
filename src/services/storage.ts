// src/services/storage.ts

import {Platform} from 'react-native';
import * as SecureStore from 'expo-secure-store';


// Save data to storage
export async function saveItem(key: string, value:string){

    console.log("Saving to storage");
    if(Platform.OS === 'web'){
        localStorage.setItem(key, value);
    }else{
        await SecureStore.setItemAsync(key, value);
    }
}


// Get data from storage
export async function getItem(key: string){

    if(Platform.OS === 'web'){
        return localStorage.getItem(key);
    }else{
        return await SecureStore.getItemAsync(key);
    }
}

// Delete data from storage
export async function deleteItem(key: string){

    if(Platform.OS === 'web'){
        localStorage.removeItem(key);
    }else{
        await SecureStore.deleteItemAsync(key);
    }
}