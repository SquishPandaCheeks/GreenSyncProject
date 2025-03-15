import { Account, Avatars, Client, Databases, Models, OAuthProvider, Query } from 'react-native-appwrite';
import * as Linking from 'expo-linking';
import { openAuthSessionAsync } from 'expo-web-browser'; 
import { Platform } from 'react-native';


export const config = {
    platform: 'com.jsm.greensync',
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    visitorsInContactId: process.env.EXPO_PUBLIC_APPWRITE_VISITORSINCONTACT_ID,
    visitId: process.env.EXPO_PUBLIC_APPWRITE_VISIT_ID,
    partyCardId: process.env.EXPO_PUBLIC_APPWRITE_PARTYCARD_ID,
    partyGuestId: process.env.EXPO_PUBLIC_APPWRITE_PARTYGUEST_ID,
    householdCollectionId: process.env.EXPO_PUBLIC_APPWRITE_HOUSEHOLD_ID,
}


export const client = new Client()
    .setEndpoint(config.endpoint!)
    .setProject(config.projectId!);


switch (Platform.OS) {
    case 'ios':
        client.setPlatform("com.jsm.greensync");
        break;
}


export const avatar = new Avatars(client);
export const account = new Account(client);
export const database = new Databases(client);

export async function login(){
    try {
        const redirectUri = Linking.createURL('/');

        const response = await account.createOAuth2Token(
            OAuthProvider.Google, redirectUri
        );

        if(!response) throw new Error('Failed to login');

        const browserResult = await openAuthSessionAsync(
            response.toString(),
            redirectUri
        )

        if(browserResult.type != 'success' ) throw new Error('Failed to login2');

        const url = new URL(browserResult.url);

        const secret= url.searchParams.get('secret')?.toString();
        const userId = url.searchParams.get('userId')?.toString();

        if(!secret || !userId) throw new Error('Failed to login3');

        const session = await account.createSession(userId, secret);

        if(!session) throw new Error('Failed to create session');
        
        return true;

    } catch (error) {
        console.error(error);
        return false;
    }   
}


// Define interfaces for your document types
interface HouseholdDocument extends Models.Document {
    HouseholdName: string;
    // Add other properties from your Household collection here
  }
  
  interface VisitorGuestsCardDocument extends Models.Document {
    household: string; // This holds the Household document ID
    visitorName?: string; // Optional property for visitor name
    // Add other properties from your VisitorGuestsCard collection here
  }
  
  // Interface for the combined visitor card with household name
  interface VisitorCardWithHousehold extends VisitorGuestsCardDocument {
    householdName: string;
  }
  


export async function logout() {
    try {
        await account.deleteSession('current');
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function getCurrentUser() {
    try {
        const response = await account.get();
        if(response.$id) {
            const userAvatar = avatar.getInitials(response.name);

            return {
                ...response,
                avatar: userAvatar.toString(),
            }
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}



export async function fetchHouseholdContent(){
    try {
      const householdResponse = await database.listDocuments(
        config.databaseId!, 
        config.householdCollectionId!,
    );
    console.log("Household response:", householdResponse);
    return householdResponse.documents;
      // Handle the response containing household-specific content
    } catch (error) {
        console.error("Error fetching household content:", error);
        console.error(error);
        return [];
    }
  };

export async function getVisitors() {
    try {
        const result = await database.listDocuments(
            config.databaseId!, 
            config.visitId!,
            [Query.orderDesc('$createdAt'), Query.limit(5)]
        );
        return result.documents;
    } catch (error) {
        console.error(error);
        return [];
    }
}




export async function getVisitorsControl({filter, query, limit}: {
    filter: string;
    query: string;
    limit: number;
}) {
    try {
        const buildQuery = [Query.orderDesc('$createdAt')];
        
        if(filter && filter !== 'All') {
            buildQuery.push(
                Query.equal('ActionGranted', filter),
            );
        }

        if(query) {
            buildQuery.push(
              Query.search('PurposeOfVisit', query),
            )
        }

        if(limit) {
            buildQuery.push(Query.limit(limit));
        }


        const result = await database.listDocuments(
            config.databaseId!, 
            config.visitId!,
            buildQuery
        );
        return result.documents;
        
    }
    catch (error) {
        console.error(error);
        return [];
    }

}

export async function assignUserToHousehold(userId: string, householdId: string) {
    try {
        const response = await account.updatePrefs({
            householdId: householdId
        });
        return response;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function fetchVisitorsGuestCards() {
    try {
      const response = await database.listDocuments(
        config.databaseId!, 
        config.visitId!,
      );
      return response.documents;
    } catch (error) {
      console.error('Error fetching VisitorsGuestCard documents:', error);
      return [];
    }
  };

export async function fetchHouseholdById(householdId: string){
    try {
      const response = await database.listDocuments(
        config.databaseId!, 
        config.householdCollectionId!, 
        );
      return response;
    } catch (error) {
      console.error(`Error fetching household document with ID`, error);
      return null;
    }
  };

  
  // Function to fetch all visitor cards with their household names
export async function fetchAllVisitorCardsWithHouseholdNames() {
    try {
      // Get all visitor cards
      const visitorCards = await database.listDocuments(
        config.databaseId!,
        config.visitId!
      ) as Models.DocumentList<VisitorGuestsCardDocument>;
      ;
      
      // Get all households
      const households = await database.listDocuments(
        config.databaseId!,
        config.householdCollectionId!
      ) as Models.DocumentList<HouseholdDocument>;
      ;
      
      // Create a map of household IDs to household names for quick lookup
      const householdMap: Record<string, string> = {};
      households.documents.forEach(household => {
        householdMap[household.$id] = household.HouseholdName;
      });
      
      // Combine the data
      const visitorCardsWithHouseholds = visitorCards.documents.map(card => {
        return {
          ...card,
          HouseholdName: householdMap[card.household] || 'Unknown Household'
        };
      });
      
      return visitorCardsWithHouseholds;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

export async function updateDocument(databaseId: string, collectionId: string, documentId: string, data: object) {
  try {
    const response = await database.updateDocument(databaseId, collectionId, documentId, data);
    return response;
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}

export async function createVisitorActivity(activity: string, householdName: string){
  try {
    const result = await database.createDocument(
      config.databaseId!,
      config.visitId!,
      config.householdCollectionId!,
      {
        PurposeOfVisit: activity,
        isResolved: false,
        ActionGranted: "Pending",
        HouseholdName: householdName,
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
