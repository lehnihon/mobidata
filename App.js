import React from 'react';
import axios from 'axios';
import { Platform, StatusBar, StyleSheet, View, ToastAndroid, NetInfo, AsyncStorage } from 'react-native';
import { AppLoading, Asset, Font, Icon } from 'expo';
import AppNavigator from './navigation/AppNavigator';

export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
    isConnected: true
  };

  handleConnectivityChange = isConnected => {
    this.setState({ isConnected });
  }

  async componentDidMount() {
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
  }

  componentWillMount(){
    this.interval = setInterval(() => {
      this.enviarEncomenda();
    }, 10000);
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
    clearInterval(this.interval);
  }

  enviarEncomenda = async() => {
    try {
      userId = await AsyncStorage.getItem('id') || 'none';
      encomendasStorage = JSON.parse(await AsyncStorage.getItem('encomendas'));
    } catch (error) {
      ToastAndroid.show('Erro ao consultar encomenda do banco!', ToastAndroid.SHORT);
    }

    if(encomendasStorage != null){
      if(this.state.isConnected && encomendasStorage.length != 0){
        encomendas = [...encomendasStorage];
        promises = [];

        for(i in encomendas){
          formData = new FormData();

          formData.append('userid', userId);
          formData.append('nota', encomendas[i].nota);
          formData.append('data', encomendas[i].data);
          formData.append('hora', encomendas[i].hora);
          formData.append('status', encomendas[i].status.id);
          formData.append('latitude', encomendas[i].latitude);
          formData.append('longitude', encomendas[i].longitude);
          if(encomendas[i].foto.uri != ''){
            formData.append('foto', {
              uri: encomendas[i].foto.uri,
              name: encomendas[i].foto.name,
              type: encomendas[i].foto.type
            });
          }

          promises.push(
            axios({
              method: 'POST',
              url: 'http://34.200.50.59/mobidataapi/baixa.php',
              data: formData,
              config: { headers: {'Content-Type': 'multipart/form-data' }}
            })
          )
        }
        axios.all(promises).then(function(results) {
          results.forEach(function(response) {
            encomendas.map((val,index) => {
              (val.nota == response.data) ? encomendas.splice(index, 1) : ''
            });
          })
        }).then(()=>{

          AsyncStorage.setItem('encomendas', JSON.stringify(encomendas));
          ToastAndroid.show((encomendasStorage.length)+' Notas enviadas ', ToastAndroid.SHORT);
        }
        ).catch(function (error) {
          ToastAndroid.show('Erro ao enviar!', ToastAndroid.SHORT);
        });    
      }
    }
  }

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (
        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          <AppNavigator />
        </View>
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/robot-dev.png'),
        require('./assets/images/robot-prod.png'),
      ]),
      Font.loadAsync({
        // This is the font that we are using for our tab bar
        ...Icon.Ionicons.font,
        // We include SpaceMono because we use it in HomeScreen.js. Feel free
        // to remove this if you are not using it in your app
        'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
      }),
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
