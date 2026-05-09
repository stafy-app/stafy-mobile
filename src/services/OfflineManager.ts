// src/services/OfflineManager.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import checkNetwork from "@/src/utils/networkHelper";
import {api} from "@/src/services/api";

const GLOBAL_QUEUE_KEY = '@global_offline_queue';


export const OfflineManager = {

    async apiGet(endpoint: string) {
        const cacheKey = `@cache_${endpoint}`;
        const isOnline = await checkNetwork();

        if (isOnline) {
            try {
                // If there is an internet conn, fetch from the API
                const response = await api.get(endpoint);

                // Extract the data from the response
                const data = response.data;

                // Transform the data in text
                const textData = JSON.stringify(data);

                // Save the data to AsyncStorage
                await AsyncStorage.setItem(cacheKey, textData);

                // Return the data to the caller screen
                return data;
            } catch (error) {
                console.error(`Error fetching data from API ${endpoint} :`, error);
            }
        }

        // Offline mode, fetch from AsyncStorage
        const textData = await AsyncStorage.getItem(cacheKey);

        if (textData !== null) {
            console.log(`Data fetched from AsyncStorage for ${endpoint}`);
            // Return the data to the caller screen
            return JSON.parse(textData);
        } else {
            // If there is no data in AsyncStorage, return null
            return null;
        }
    },

    async apiPost(endpoint: string, data: any) {
        const isOnline = await checkNetwork();

        if (isOnline) {
            try {
                // If there is an internet conn, send the data to the API
                const response = await api.post(endpoint, data);

                // Return the response
                return {
                    success: true,
                    status: "online",
                    data: response.data
                };
            }catch (error) {
                console.error(`Error posting data to API ${endpoint} :`, error);
                throw error;
            }
        }

        // Offline mode, save the data to AsyncStorage
        const textQueue = await AsyncStorage.getItem(GLOBAL_QUEUE_KEY);

        // If there is no queue, create a new list
        let queueList = []
        if (textQueue !== null) {
            // If there is a queue, parse it
            queueList = JSON.parse(textQueue);
        }

        // Create the new item to be added to the queue
        const newItem = {
            endpoint: endpoint,
            method: "POST",
            data: data,
            saveHour: new Date()
        };

        // Add the new item to the queue list
        queueList.push(newItem);

        // Save the updated queue list to AsyncStorage
        const TextQueueList = JSON.stringify(queueList);
        await AsyncStorage.setItem(GLOBAL_QUEUE_KEY, TextQueueList);

        // Return the response
        return {
            success: true,
            status: "offline",
            data: null
        }
    },

    // TODO: Implement the delete method, next update

    async apiSync() {

        const TextQueueList = await AsyncStorage.getItem(GLOBAL_QUEUE_KEY);

        // If there is no queue, return
        if (TextQueueList === null) {
            return;
        }

        // Parse the queue list
        const queueList = JSON.parse(TextQueueList);

        // If there are no items in the queue, return
        if (queueList.length === 0) {
            return;
        }

        // Check if there is an internet connection
        const isOnline = await checkNetwork();
        if (!isOnline) {
            return
        }

        console.log(`Found ${queueList.length} items in the queue`);

        // Loop through the queue list
        let remainingItems = [...queueList];

        for (let i = 0; i < queueList.length; i++){
            const item = queueList[i];

            try{
                // Send the data to the API
                const response = await api.post(item.endpoint, item.data);

                // Remove the item from the remaining items list
                remainingItems.shift();
                console.log(`Item sync to ${item.endpoint} successfully`)

            } catch (error){
                console.error(`Error sync item to ${item.endpoint} :`, error);

                // If there is an error, the rest of the items remain in the queue (on the phone)
                const TextRemainingItems = JSON.stringify(remainingItems);
                await AsyncStorage.setItem(GLOBAL_QUEUE_KEY, TextRemainingItems);
                return;
            }
        }

        // If there are no more items in the queue, remove the queue from AsyncStorage
        await AsyncStorage.removeItem(GLOBAL_QUEUE_KEY);
        console.log("Queue removed successfully! All data synced!");

    }
};