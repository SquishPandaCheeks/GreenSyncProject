import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { Link, router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";
import icons from "@/constants/icons";
import Search from "@/components/Search";
import {Card} from "@/components/Cards";
import { useGlobalContext } from "@/lib/global-provider";
import { useAppwrite } from "@/lib/useAppwrite";
import { account, getVisitors, getVisitorsControl } from "@/lib/appwrite";
import { useCallback, useEffect, useState } from "react";
import AddVisitors from "@/components/AddVisitors";
import { useIsFocused } from "@react-navigation/native";

export default function Index() {
  const {user} = useGlobalContext();
  const params = useLocalSearchParams<{query?: string; filter?: string;}>();
  const [verifyUserRole, setVerifyUserRole] = useState('');
  const [userhouseholdName, setUserHouseholdName] = useState('');

useEffect(() => {
    const fetchUserPrefs = async () => {
      try {
        const prefs = await account.getPrefs();
        
        if (prefs.HouseholdNamePref) {
          setUserHouseholdName(prefs.HouseholdNamePref);
        }

      } catch (error) {
        console.error('Error fetching user preferences:', error);
      }
    };

    fetchUserPrefs();
  }, [userhouseholdName]);


  const {data: latestVisitors, loading: latestVisitorsLoading} = useAppwrite({
    fn: getVisitorsControl
  });

  const {data: visitors, loading: visitorsLoading, refetch} = useAppwrite({
    fn: getVisitors,
    params: {
      filter: params?.filter!,
      query: params?.query!,
      limit: 10,
    },
    skip:true
  });

  const handleCardPress = (id: string) => router.push(`/properties/${id}`);

  // useEffect(() => {
  //   refetch({
  //     filter: params.filter!,
  //     query: params.query!,
  //     limit: 10,
  //   })
  // }, [params.filter, params.query]);
  useFocusEffect(
    useCallback(() => {
      // Trigger your state update or data refetch here.
      refetch({
        filter: params.filter!,
        query: params.query!,
        limit: 10,
      });
      
      // Optionally return a cleanup function if needed.
      return () => {};
    }, [params.filter, params.query])
  );
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      refetch({
        filter: params.filter!,
        query: params.query!,
        limit: 10,
      });
    }
  }, [isFocused, params.filter, params.query]);  




  return (
    <SafeAreaView className="bg-white h-full">

      <FlatList 
        data={visitors}
        renderItem={({item}) => <Card item={item} onPress={() => handleCardPress(item.$id)}/>}
        keyExtractor={(item) => item.$id} // Use the unique $id property
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="px-5">
          <View className="flex flex-row items-center justify-between mt-5">
          
            <View className="flex flex-row items-center">
              <Image source={{uri: user?.avatar}} className="size-12 rounded-full"/>
              <View className="flex flex-col ml-3 justify-center">
                <Text className="text-xs font-rubik text-black-10">Good Day {user?.name}</Text>

                {userhouseholdName ? (
                  <Text className="text-base font-rubik-medium text-black-300">
                    Current Household: {userhouseholdName}
                  </Text>
                ) : (
                  <Text className="text-base font-rubik-medium text-black-300">
                    You have not selected a household
                  </Text>
                )}
              </View>
            </View>
            <Image source={icons.bell} className="size-6"/>
          </View>
          <View className="flex flex-col justify-between items-center">
          </View>
          <Search/>
          <View className="my-5">
            <View className="flex flex-row items-center justify-between px-2">
              <Text className="text-xl font-rubik-bold text-black-300">Guests and Visitors Activity</Text>
              <TouchableOpacity>
                <Text>
                  See all
                </Text>
              </TouchableOpacity>
            </View>
            <View>
              <AddVisitors/>
            </View>


          </View>    
        </View>
        }
      />



    </SafeAreaView>
  );
}
