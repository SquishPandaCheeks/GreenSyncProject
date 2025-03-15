import { View, Text, Image } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'

import icons from '@/constants/icons'

const TabIcon = ({focused, icon, title}: 
    {focused: boolean; icon: any; title: string}) => (
        <View className='flex-1 mt-3 flex-col items-center'>
            <Image source={icon} tintColor={focused ? "#09CF47" : "#09CF47"} resizeMode='contain' className='size-6'/>
            <Text className={`text-xs ${focused ? 'text-green-500' : 'text-gray-500'}`}>{title}</Text>
        </View>
    )

const LayoutTabs = () => {
  return (
    <Tabs
        screenOptions={{
            tabBarShowLabel: false,
            tabBarStyle: {
                backgroundColor: 'white',
                position: 'absolute',
                borderTopColor: 'black',
                borderTopWidth: 1,
                minHeight: 60,
            },
        }
        }
    >
      <Tabs.Screen
        name='index'
        options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({focused}) => (
                <TabIcon icon={icons.home} 
                focused={focused} title="Home" />
            )
        }}
      />

    <Tabs.Screen
        name='explore'
        options={{
            title: 'Explore',
            headerShown: false,
            tabBarIcon: ({focused}) => (
                <TabIcon icon={icons.search} 
                focused={focused} title="Explore" />
            )
        }}
      />


    <Tabs.Screen
        name='profile'
        options={{
            title: 'Profile',
            headerShown: false,
            tabBarIcon: ({focused}) => ( 
                <TabIcon icon={icons.person} 
                focused={focused} title="Profile" />
            )
        }}
      />

    </Tabs>
  )
}

export default LayoutTabs