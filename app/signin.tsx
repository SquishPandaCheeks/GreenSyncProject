import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert} from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import images from '@/constants/images'
import icons from '@/constants/icons'
import { login } from '@/lib/appwrite'
import { useGlobalContext } from '@/lib/global-provider'
import { Redirect } from 'expo-router'

const SignIn = () => {
  const {refetch, loading, isLoggedIn} = useGlobalContext();

  // Always redirects users to homepage whenever user access signin if already signed in
  if(!loading && isLoggedIn) {
    return <Redirect href="/" />
  }


  const handleSignIn = async () => {
    

    const result = await login();

    if(result) {
      refetch();
      
    } else {
      Alert.alert('Error', 'Sign in failed')   
    }
  }

  return (
    <SafeAreaView className='bg-white h-full'>
      <ScrollView>
        <Image source={images.onboarding} className='w-full h-72' resizeMode='contain'/>
          <View className='px-10'>
          <Text className='text-base text-center uppercase text-black-200'>Welcome to GreenSync</Text>
          <Text className='text-3xl text-center text-black-300 mt-2'>Manage Guests {"\n"}</Text>
          <Text className='text-3xl text-center text-green-600'>Remotely and Easily</Text>
          
          <Text className='text-lg text-black-200 text-center mt-12'>Continue using Greensync with Google</Text>
          
          <TouchableOpacity onPress={handleSignIn} className='bg-white shadow-md shadow-zinc-500 rounded-full w-full py-4 mt-5'>
            <View className='flex flex-row items-center justify-center'>
              <Image 
                source={icons.google} 
                className='w-5 h-5' 
                resizeMode='contain'
              />
              <Text className='text-base text-black-300 ml-2'>Sign in with Google</Text>
            </View>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default SignIn