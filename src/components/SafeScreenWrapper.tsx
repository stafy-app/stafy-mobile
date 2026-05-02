// src/components/SafeScreenWrapper.tsx

import React from 'react'
import {View, ViewProps} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

interface SafeScreenWrapperProps extends ViewProps {
    children: React.ReactNode;
}

export default function SafeScreenWrapper({children, className = "", ...props}: SafeScreenWrapperProps) {

    const insets = useSafeAreaInsets();

    return (
        <View className={`flex-1 ${className}`}
              style={
                  {
                      paddingTop: insets.top,
                      //paddingBottom: insets.bottom
                  }
              } {...props} >

            {children}

        </View>
    )

}