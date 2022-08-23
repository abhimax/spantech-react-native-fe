
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { 
  NavigationContainer, 
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  Provider as PaperProvider, 
  DefaultTheme as PaperDefaultTheme,
  DarkTheme as PaperDarkTheme 
} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


import { AuthContext } from './components/context';

import RootStackScreen from './screens/RootStackScreen';

import HomeScreen from './screens/HomeScreen';
import NewJobScreen from './screens/NewJobScreen';

import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

const App = () => {
  
  const [isDarkTheme, setIsDarkTheme] = React.useState(false);

  const initialLoginState = {
    isLoading: true,
    userName: null,
    userToken: null,
    userTeam: null,
  };

  const CustomDefaultTheme = {
    ...NavigationDefaultTheme,
    ...PaperDefaultTheme,
    colors: {
      ...NavigationDefaultTheme.colors,
      ...PaperDefaultTheme.colors,
      background: '#ffffff',
      text: '#333333'
    }
  }
  
  const CustomDarkTheme = {
    ...NavigationDarkTheme,
    ...PaperDarkTheme,
    colors: {
      ...NavigationDarkTheme.colors,
      ...PaperDarkTheme.colors,
      background: '#333333',
      text: '#ffffff'
    }
  }

  const theme = isDarkTheme ? CustomDarkTheme : CustomDefaultTheme;

  const loginReducer = (prevState, action) => {
    switch( action.type ) {
      case 'RETRIEVE_TOKEN': 
        return {
          ...prevState,
          userToken: action.token,
          userTeam:action.userTeam,
          user:action.user,
          isLoading: false,
        };
      case 'LOGIN': 
        return {
          ...prevState,
          userName: action.id,
          userToken: action.token,
          userTeam:action.userTeam,
          user:action.user,
          isLoading: false,
        };
      case 'LOGOUT': 
        return {
          ...prevState,
          userName: null,
          userToken: null,
          userTeam:null,
          isLoading: false,
          user:null,
        };
    }
  };

  const [loginState, dispatch] = React.useReducer(loginReducer, initialLoginState);

  const authContext = React.useMemo(() => ({
    signIn: async(foundUser) => {
      
      const userToken = String(foundUser[0].userToken);
      const userName = foundUser[0].username;
      const userTeam = foundUser[0].userTeam;

      try {
        await AsyncStorage.setItem('userToken', userToken);
        await AsyncStorage.setItem('userTeam', userTeam);
        await AsyncStorage.setItem('user', foundUser[0]);
      } catch(e) {
        console.log(e);
      }
      // console.log('user token: ', userToken);
      dispatch({ type: 'LOGIN', id: userName, token: userToken, userTeam:userTeam , user:foundUser[0]});
    },
    signOut: async() => {
      // setUserToken(null);
      // setIsLoading(false);
      try {
        await AsyncStorage.removeItem('userToken');
      } catch(e) {
        console.log(e);
      }
      dispatch({ type: 'LOGOUT' });
    },
    toggleTheme: () => {
      setIsDarkTheme( isDarkTheme => !isDarkTheme );
    }
  }), []);

  useEffect(() => {
    setTimeout(async() => {
      // setIsLoading(false);
      let userToken;
      userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
      } catch(e) {
        console.log(e);
      }

      let userTeam;
      userTeam = null;
      try {
        userTeam = await AsyncStorage.getItem('userTeam');
      } catch(e) {
        console.log(e);
      }

      let user;
      user = null;
      try {
        user = await AsyncStorage.getItem('user');
      } catch(e) {
        console.log(e);
      }
      // console.log('user token: ', userToken);
      dispatch({ type: 'RETRIEVE_TOKEN', token: userToken, userTeam:userTeam, user:user });
    }, 1000);
  }, []);

  if( loginState.isLoading ) {
    return(
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <ActivityIndicator size="large"/>
      </View>
    );
  }
  return (
    <PaperProvider theme={theme}>
    <AuthContext.Provider value={authContext}>
    <NavigationContainer theme={theme}>
    { loginState.userToken !== null ? (
        <Stack.Navigator initialRouteName="Home" >
          <Stack.Screen 
           options={{
            headerStyle:{
              backgroundColor: '#009387'
            },
            headerTintColor: '#fff', 
            headerTitleStyle: {
              fontWeight: 'bold', 
            },
            headerRight: () => (
              <TouchableOpacity onPress={() => {authContext.signOut()}}>
                  <MaterialIcons  style={styles.signout}
                          name="logout"
                          color="#fff"
                          size={25}
                  />
              </TouchableOpacity>
            )
          }} 

            name="Home" component={HomeScreen}  initialParams={{ user: loginState.user }}/>
          <Stack.Screen 
           options={{
            headerStyle:{
              backgroundColor: '#009387'
            },
            headerTintColor: '#fff', 
            headerTitleStyle: {
              fontWeight: 'bold', 
            },
            headerRight: () => (
              <TouchableOpacity onPress={() => {authContext.signOut()}}>
                  <MaterialIcons  style={styles.signout}
                          name="logout"
                          color="#fff"
                          size={25}
                  />
              </TouchableOpacity>
            )
          }} 

            name="NewJob" component={NewJobScreen} />
        </Stack.Navigator>
      )
    :
      <RootStackScreen/>
    }
       
    </NavigationContainer>
    </AuthContext.Provider>
    </PaperProvider>
  );
}

export default App;

const styles = StyleSheet.create({
 
  signout: { marginTop: 10, 
    alignSelf: "flex-end",
    paddingBottom: 5
  }
});