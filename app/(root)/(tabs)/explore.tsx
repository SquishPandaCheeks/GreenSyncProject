import { View, Text } from 'react-native'
import React from 'react'
import AddVisitors from '@/components/AddVisitors'
import { SafeAreaView } from 'react-native-safe-area-context'

const explore = () => {
  return (
    <SafeAreaView className='bg-white h-full'>
    <View className='bg-white'>
      <AddVisitors/>
    </View>
    </SafeAreaView>
  )
}

export default explore