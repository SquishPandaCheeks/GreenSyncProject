import { View, Text, ScrollView, Image, TouchableOpacity, ImageSourcePropType, Alert, TextInput, Switch } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import icons from '@/constants/icons';
import images from '@/constants/images';
import { settings } from '@/constants/data';
import { useGlobalContext } from '@/lib/global-provider';
import { logout, assignUserToHousehold, database, config, account, fetchHouseholdContent } from '@/lib/appwrite';
import { Account, Query } from 'react-native-appwrite';
import { useAppwrite } from '@/lib/useAppwrite';

interface SettingItemsProps{
  icon: ImageSourcePropType;
  title: string;
  onPress?: () => void;
  textStyle?: string;
  showArrow?: boolean;
}

const SettingItems = ({icon, title, onPress, textStyle, showArrow = true}: SettingItemsProps) => (
    <TouchableOpacity onPress={onPress} className='flex flex-row justify-between items-center py-4 border-b border-gray-100'>
      <View className='flex flex-row items-center py-4'>
          <Image source={icon} className='size-6'/>
          <Text className={`text-lg font-rubik-medium text-black-300 ml-3 ${textStyle}`}>{title}</Text>
      </View>
      {showArrow && <Image source={icons.rightArrow} className='size-5'/>}
    </TouchableOpacity>
  )

const profile = () => {
  const {user, refetch} = useGlobalContext();
  const [userPrefs, setUserPrefs] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [householdNamePref, setHouseholdNamePref] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isGuard, setIsGuard] = useState(false);

  // fetches user
  useEffect(() => {
    const fetchUserPrefs = async () => {
      try {
        const prefs = await account.getPrefs();
        
        if (prefs.HouseholdNamePref) {
          setUserPrefs(prefs.HouseholdNamePref);
        }

        if (prefs.isGuard) {
          setIsGuard(prefs.isGuard === "yes");
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      }
    };

    fetchUserPrefs();
  }, [householdNamePref]);

  // logout
  const handleLogout = async () => {
    const result = await logout();

    if(result) {
      Alert.alert('Success', 'Logout successful', );
      refetch();
    } else {
      Alert.alert('Error', 'Logout failed');
    };
  };

  // updateHousehold button
  const updateHouseholdNamePref = async () => {
    try {
      const currentPrefs = await account.getPrefs();
      await account.updatePrefs({ ...currentPrefs, HouseholdNamePref: inputValue });
      setHouseholdNamePref(inputValue);
      setInputValue('');
      Alert.alert('Success', 'Household name preference updated successfully.');
    } catch (error) {
      console.error('Error updating user preferences:', error);
      Alert.alert('Error', 'Failed to update household name preference.');
    }
  };

  const updateUserRole = async (value: boolean) => {
    try {
      const currentPrefs = await account.getPrefs();
      const newRole = value ? "yes" : "no";
      await account.updatePrefs({ ...currentPrefs, isGuard: newRole });
      setIsGuard(value);
      if (value) {
        Alert.alert('Role Update', 'You are now a guard.');
      } else {
        Alert.alert('Role Update', 'You are no longer a guard.');
      }

    } catch (error) {
      console.error('Error updating user preferences:', error);
      Alert.alert('Error', 'Failed to update user role.');
    }
  };

  return (
    <SafeAreaView className='h-full bg-white'>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName='pb-32 px-7'
      >

        <View className='flex flex-row items-center justify-between mt-5'>
          <Text className='text-3xl text-black-300 mt-10'>Profile</Text>  
          <Image source={icons.bell} className='size-5'/>      
        </View>

        {/* Profile Picture */}
        <View className='flex flex-row justify-center  mt-5'>
          <View className='flex flex-col relative items-center mt-5'>
            <Image source={ {uri: user?.avatar}} className='size-44 relative rounded-full'/>
              <TouchableOpacity className='absolute bottom-11 right-2'>
                <Image source={icons.edit} tintColor={"#09CF47"} className='size-9'/>
              </TouchableOpacity>

              <Text className='text-2xl fonr-rubik-bold mt-2'>{user?.name}</Text>
          </View>
        </View>

        {/* Setting Lists */}
        <View className='flex flex-col mt-10'>
          <SettingItems icon={icons.calendar} title='Visits Calendar'/>
          <SettingItems icon={icons.wallet} title='Wallet'/>
        </View>

        <View className='flex flex-col mt-5 border-t pt-5 border-primary-100'>
          {settings.slice(2).map((item, index) => (
            <SettingItems key={index} {... item}/>
          ))}
        </View>

        <View className='flex flex-col mt-5 border-t pt-5 border-primary-200'>
          <SettingItems icon={icons.logout} title='Logout' onPress={handleLogout} showArrow={false}/>
        </View>

        {/* Assign Household */}
        <View className='flex flex-col mt-10'>
          <View>
            <View className='border border-gray-300 p-2 rounded mb-5'>
              <TextInput
                placeholder="Enter new household name"
                value={inputValue}
                onChangeText={setInputValue}
                className=''
              />
            </View>
            <TouchableOpacity onPress={updateHouseholdNamePref}>
              <View className='flex flex-row justify-center items-center py-4 border border-gray-100'>
                <View className='flex flex-row items-center'>
                  <Text className='text-2xl font-rubik'>Update Household Name</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>            
            
          <Text className='mt-4'>Current User Household Data: {userPrefs}</Text>
        </View>

        {/* User Role Switch */}
        <View className='flex flex-col mt-10 items-center justify-between'>
          <Text className='text-lg font-rubik-medium text-black-300 mb-2'>Guard Role</Text>
          <Switch
            className=''
            value={isGuard}
            onValueChange={(value) => updateUserRole(value)}
          />
          <Text className='mt-4'>Current Role: {isGuard ? "Guard" : "User"}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default profile;




