import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Mock the useFocusEffect hook
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useFocusEffect: jest.fn(),
}));

// Create a mock stack navigator
const Stack = createNativeStackNavigator();

export function MockNavigationContainer({ children }) {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="name">
          {()=>children}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}