import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { account, config, database } from '@/lib/appwrite';
import {ID} from "react-native-appwrite";

export async function createVisitorActivity(activity: string, householdName: string){

  try {
    const result = await database.createDocument(
      config.databaseId!,
      config.visitId!,
      ID.unique(),
      {
        PurposeOfVisit: activity,
        // HouseholdName: householdName,
        isResolved: false,
        ActionGranted: "Pending",
      }
    );

    const visitorCard = {
      $id: result.$id,
      $createdAt: result.$createdAt
    }

    return visitorCard;
  } catch(error){
    console.log(error);
  }
}

const AddVisitors = () => {
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [addActivity, setAddActivity] = useState('');
  const [householdName, setHouseholdName] = useState('');

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const prefs = await account.getPrefs();
        
        if (prefs.isGuard === 'yes') {
          setCurrentUserRole('Guard');
        } else {
          setCurrentUserRole('User');
        }
        
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      }
    };

    fetchUserRole();
  }, [account.getPrefs]);

  useEffect(() => {},[addActivity]);

  const handleAddActivity = async () => {
    const visitorCard = await createVisitorActivity(addActivity, householdName);
  }

  if (currentUserRole !== 'Guard') {
    return null;
  }

  return (
    <View className='flex flex-row items-center justify-between w-full px-4 rounded-lg bg-accent-100 border border-primary-100 mt-5 py-2'>
        <View className='flex-1 flex flex-row items-center justify-start z-50'>
          <TextInput
          className='flex-1 bg-white p-2 rounded-lg'
          placeholder='Enter activity'
          value={addActivity}
          onChangeText={setAddActivity}
          />
        </View>
        {/* <View className='flex-1 flex flex-row items-center justify-start z-50'>
          <TextInput
          className='flex-1 bg-white p-2 rounded-lg'
          placeholder='Enter Household Name'
          value={householdName}
          onChangeText={setHouseholdName}
          />
        </View> */}
        <TouchableOpacity onPress={handleAddActivity}>
          <Text>Add Activity</Text>
        </TouchableOpacity>
        <View>
          {/* create here */}
        </View>
    </View>
  
  )
}

export default AddVisitors