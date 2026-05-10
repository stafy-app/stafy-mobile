// src/utils/networkHelper.ts

import NetInfo from "@react-native-community/netinfo";


export default async function checkNetwork(): Promise<boolean> {

    try{
        const networkState = await NetInfo.fetch();

        // Check if the network state is connected and internet is reachable
        // Return true if both conditions are met, otherwise return false
        return Boolean(networkState.isConnected && networkState.isInternetReachable);
    }catch(error){
        console.error("Error checking network status:", error);
        return false; // If there's an error, assume no internet connection
    }

}