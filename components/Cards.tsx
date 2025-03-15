import { View, Text, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Models } from 'react-native-appwrite';
import { account, fetchAllVisitorCardsWithHouseholdNames, fetchHouseholdById, database, config } from '@/lib/appwrite';

// Define the interface for your visitor card with household name
// interface Props {
//   item: Models.Document;
//   onPress?: () => void;
// }

interface CardProps {
  item: Models.Document;
  onPress?: () => void;
}

export const Card = ({ item, onPress }: CardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [householdName, setHouseholdName] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [cardResponse, setCardResponse] = useState('');


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
  }, []);

  const handleResponse = async (response: string) => {
    setCardResponse(response);
    item.ActionGranted = response;

    try {
      const updatedDocument = await database.updateDocument(
        config.databaseId!,
        config.visitId!,
        item.$id,
        { ActionGranted: response, TimeResolved: new Date().toISOString() }
      );
      item.TimeResolved = updatedDocument.$updatedAt;
    } catch (error) {
      console.error('Error updating ActionGranted:', error);
    }
  };

  return (
    <View className='mx-2'>
      <View style={styles.container}>
        <Pressable
          onPress={() => {
            setExpanded(!expanded);
          }}
          style={styles.card}
        >
          <Text style={styles.title}>{item.PurposeOfVisit}</Text>

          {expanded && (
            <View style={styles.details}>
              <Text>Action Granted: {item.ActionGranted} </Text>
              <Text>Arrival Time: {item.$createdAt || 'N/A'}</Text>
              <Text>Time Resolved: {item.TimeResolved || 'Pending'}</Text>
              {/* <Text>Household: {item.household} </Text> */}
              {currentUserRole === 'User' && item.ActionGranted === 'Pending' && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.acceptButton]}
                    onPress={() => handleResponse('Accepted')}
                  >
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.denyButton]}
                    onPress={() => handleResponse('Denied')}
                  >
                    <Text style={styles.buttonText}>Deny</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  purpose: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  card: {
    padding: 12,
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 18,
  },
  details: {
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    padding: 12,
    borderRadius: 25,
    width: '45%',
  },
  acceptButton: {
    backgroundColor: '#90ee90', // light green
  },
  denyButton: {
    backgroundColor: '#ffcccb', // light red
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});