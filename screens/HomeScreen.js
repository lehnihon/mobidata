import React from 'react';
import axios from 'axios';
import {
  StyleSheet,
  Picker,
  TextInput,
  Button,
  View,
  AsyncStorage,
  Alert,
  TouchableOpacity,
  Text,
  FlatList,
  ToastAndroid,
  Platform
} from 'react-native';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Ionicons } from '@expo/vector-icons';
import Forms from '../constants/Forms';

export default class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => { 
  return {
    headerTitle: 'App 1.3',
    headerRight: (
      <Ionicons  onPress={() => navigation.navigate('List')} style={{marginRight:10}} name={Platform.OS === 'ios' ? 'ios-arrow-dropright-circle' : 'md-arrow-dropright-circle'} size={32} />
    )
  }}

  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
  }

  constructor(props) {
    super(props);
    this.state = { 
      nota: '',
      userId: '',
      status: '',
      latitude: '',
      longitude: '',
      error: '',
      statusLista: [],
      baixaLista:[],
      gravar: false,
      encomendas:[],
      scanear: false,
      isConnected: true,
      btnSubmit:false,
      btnCamera:false,
      btnEnviar:false
    };
  }

  async componentWillMount(){
    this.getStatus();
    this.getGeo();
    this.setState({encomendas:JSON.parse(await AsyncStorage.getItem('encomendas'))});
  }

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }
  
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  getGeo(){
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
        });
      },
      (error) => this.setState({ error: error.message }),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );
  }

  handleConnectivityChange = isConnected => {
    this.setState({ isConnected });
  }

  getStatus() {
    axios.get('http://34.200.50.59/mobidataapi/status.php')
    .then(response => {
      try {
        AsyncStorage.setItem('status', this.state.id);
        this.setState({statusLista:response.data})
      } catch (error) {
        ToastAndroid.show('Erro ao baixar status!', ToastAndroid.SHORT);
      }
      this.setState({statusLista:response.data})
    })
    .catch(function (error) {
      // handle error
      getStatusStorage();
    })
  }

  getStatusStorage = async () => {
    try {
      lista = await AsyncStorage.getItem('status') || 'none';
      this.setState({statusLista:lista})
    } catch (error) {
      ToastAndroid.show('Erro ao consultar status do banco!', ToastAndroid.SHORT);
    }
  };

  gravarEncomenda = async() =>{
    if(this.state.nota == ''){
      Alert.alert('Preencha o número da nota');
      return;
    }
    if(this.state.status == '0'){
      Alert.alert('Selecione um status');
      return;
    }
    encomendasStorage = JSON.parse(await AsyncStorage.getItem('encomendas'));
    if(encomendasStorage == null || encomendasStorage == ''){
      encomendasStorage = [];
    }
    this.setState({encomendas:encomendasStorage,btnSubmit:true})
    if(this.state.status.tira_foto == 'N'){
      this.semFoto();
    }else{
      this.setState({gravar:true});
    }
  }

  mostrarEncomendas(){
    if(this.state.encomendas !== "undefined" && this.state.encomendas !== null){
      if(this.state.encomendas.length != 0){
        return <FlatList
        data={this.state.encomendas}
        renderItem={({item}) => <Text style={styles.encomendaStyle}>{item.nota}</Text>}
        keyExtractor={(item, index) => index.toString()}
        />
      }
    }
  }

  async fecharCamera(){
    this.setState({btnSubmit:false,btnCamera:false});
    this.setState({gravar:false,scanear:false})
  }

  semFoto = async () => {
    try {
      data = new Date().getFullYear()+"-"+(new Date().getMonth()+1)+"-"+new Date().getDate(); 
      hora = new Date().getHours()+":"+new Date().getMinutes()+":"+new Date().getSeconds();
      
      encomendas = [...this.state.encomendas];
      encomendas.unshift({
        nota: this.state.nota,
        data: data,
        hora: hora,
        status: this.state.status,
        latitude: this.state.latitude,
        longitude: this.state.longitude,
        foto: {
          uri: '',
          name: '',
          type: ''
        }
      });
      this.setState({encomendas:encomendas,nota:''})
      AsyncStorage.setItem('encomendas', JSON.stringify(encomendas));
      ToastAndroid.show('Salvo com sucesso!', ToastAndroid.SHORT);
      this.setState({btnSubmit:false});
    }catch (error) {
      console.log('caught error' + error);
    }
  }

  comFoto = async () => {
    if (this.camera) {
      try {
        let photo = await this.camera.takePictureAsync({ quality: 0.1 });
        data = new Date().getFullYear()+"-"+(new Date().getMonth()+1)+"-"+new Date().getDate(); 
        hora = new Date().getHours()+":"+new Date().getMinutes()+":"+new Date().getSeconds();
        encomendas = [...this.state.encomendas];
        encomendas.unshift({
          nota: this.state.nota,
          data: data,
          hora: hora,
          status: this.state.status,
          latitude: this.state.latitude,
          longitude: this.state.longitude,
          foto: {
            uri: photo.uri,
            name: `photo.${photo.uri.split('.').pop()}`,
            type: `image/${photo.uri.split('.').pop()}`
          }
        });
        this.setState({encomendas:encomendas,nota:''})
        
        AsyncStorage.setItem('encomendas', JSON.stringify(encomendas));
        ToastAndroid.show('Salvo com sucesso!', ToastAndroid.SHORT);
      } catch (error) {
        // Error saving data
      }
    }else{
      ToastAndroid.show('Câmera sem permissão', ToastAndroid.SHORT);
    }
    this.fecharCamera();
  }

  enviarEncomenda = async() => {
    this.setState({btnEnviar:true})
    try {
      userId = await AsyncStorage.getItem('id') || 'none';
      encomendasStorage = JSON.parse(await AsyncStorage.getItem('encomendas'));
    } catch (error) {
      ToastAndroid.show('Erro ao consultar encomenda do banco!', ToastAndroid.SHORT);
    }
    if(userId == 'none'){
      ToastAndroid.show('Defina um ID em configurações!', ToastAndroid.SHORT);
    }else{
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
          ToastAndroid.show('Enviando notas, aguarde por favor', ToastAndroid.SHORT);
          axios.all(promises).then(function(results) {
          }).then(()=>{
            encomendas = [];
            AsyncStorage.setItem('encomendas', JSON.stringify(encomendas));
            ToastAndroid.show((encomendasStorage.length)+' Notas enviadas ', ToastAndroid.SHORT);
            this.setState({encomendas:encomendas,btnEnviar:false});
          }
          ).catch(function (error) {
            ToastAndroid.show('Erro ao enviar!', ToastAndroid.SHORT);
            this.setState({encomendas:encomendas,btnEnviar:false});
          });    
        }
      }
    }
  }

  handleBarCodeScanned = ({ type, data }) => {
    this.setState({nota:data});
    this.setState({scanear:false});
  }

  render() {

    const { hasCameraPermission } = this.state;

    if(this.state.scanear){
      if (hasCameraPermission === null) {
        return <Text>Permissão para câmera</Text>;
      }
      if (hasCameraPermission === false) {
        return <Text>Sem acesso a câmera</Text>;
      }
      return (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <BarCodeScanner
            onBarCodeScanned={this.handleBarCodeScanned}
            style={StyleSheet.absoluteFill}
          >
            <TouchableOpacity
              style={{
                alignSelf: 'flex-end',
                alignItems: 'center',
                padding:10
              }}
              onPress={() => this.fecharCamera()}
            >
              <Ionicons name={Platform.OS === 'ios' ? 'ios-close-circle-outline' : 'md-close-circle-outline'} style={{color:'#FFF'}} size={32} />
            </TouchableOpacity>
          </BarCodeScanner>
        </View>
      );
    }else if(this.state.gravar){
      if (hasCameraPermission === null) {
        return <View />;
      } else if (hasCameraPermission === false) {
        return <Text>No access to camera</Text>;
      } else {
        return (
          <View style={{ flex: 1, flexDirection: 'row'  }}>
            <Camera ref={ (ref) => {this.camera = ref} } style={{ flex: 1 }} type={this.state.type}>
              <View
                style={styles.viewStyle}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    alignSelf: 'flex-end',
                    alignItems: 'flex-start',
                  }}
                  >
                  
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    alignSelf: 'center',
                    alignItems: 'center',
                    padding:10
                  }}
                  onPress={this.comFoto}
                  disabled={this.state.btnCamera}
                >
                  <Ionicons name="md-camera" size={32} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    alignSelf: 'flex-start',
                    alignItems: 'flex-end',
                    padding:10
                  }}
                  onPress={() => this.fecharCamera()}
                >
                  <Ionicons name={Platform.OS === 'ios' ? 'ios-close-circle-outline' : 'md-close-circle-outline'} style={{color:'#FFF'}} size={32} />
                </TouchableOpacity>
              </View>
            </Camera>
          </View>
        );
      }
    }else{
      return (
        <View contentContainerStyle={styles.contentContainer}>
          <View style={{flexDirection: 'row',paddingTop:10,paddingBottom:10}}>
            <View style={{flex: 3}}>
              <TextInput
                style={Forms.inputBase}
                onChangeText={(nota) => this.setState({nota})}
                value={this.state.nota}
                placeholder="Número da Nota"
                keyboardType="numeric"
              />
            </View>
            <View style={{flex: 1, alignItems: 'flex-end', marginRight:5}}>
              <Ionicons onPress={() => this.setState({scanear:true})} name={Platform.OS === 'ios' ? 'ios-barcode' : 'md-barcode'} size={32} />
            </View>
          </View> 
          <View style={{flexDirection: 'row', paddingBottom:10}}>
            <View style={{flex: 1}}>
              <Picker
                style={Forms.inputBase}
                selectedValue={this.state.status}
                onValueChange={(itemValue, itemIndex) =>
                  this.setState({status: itemValue})
                }>
                <Picker.Item label="Selecione" value="0" />
                {this.state.statusLista.map((i, index) => (
                  <Picker.Item key={index} label={i['nome']} value={i} />
                ))}
              </Picker>
            </View>
          </View>
          <View style={{display: 'flex', flexDirection: 'row'}}>
            <View style={{flex: 1}}></View>
            <View style={{flex: 2}}>
              <Button 
                onPress={() => this.gravarEncomenda()}
                title="GRAVAR ENCOMENDA"
                disabled={this.state.btnSubmit}
                color="#000"
              />
            </View>
            <View style={{flex: 1}}></View>
          </View>
          <View style={{display: 'flex', flexDirection: 'row'}}>
            <View style={{flex: 3}}>
              <Text style={{width:'100%', textAlign:'left', paddingTop: 5, paddingBottom:5, marginTop:10, paddingLeft:10, fontWeight:'bold',borderBottomWidth:1, borderBottomColor:'#000'}}>ENCOMENDAS Á ENVIAR</Text>
            </View>
            <View style={{flex: 1}}>
              <TouchableOpacity
                    style={{
                      flex: 1,
                      alignSelf: 'flex-end',
                      alignItems: 'center',
                      padding:10
                    }}
                    onPress={() => this.enviarEncomenda()}
                    disabled={this.state.btnEnviar}
                  >
                <Ionicons name={Platform.OS === 'ios' ? 'ios-refresh-circle' : 'md-refresh-circle'} size={32} />
              </TouchableOpacity>
            </View>
          </View> 
          <View style={{display: 'flex', flexDirection: 'row'}}>
            {this.mostrarEncomendas()}    
          </View>  
        </View> 
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingTop: 30,
    paddingLeft:10,
    paddingRight:10
  },
  viewStyle:{
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignContent: 'center'
  },
  encomendaStyle:{
    paddingLeft:10,
    paddingTop:5,
    paddingBottom:5, 
    borderBottomWidth:1,
    borderBottomColor:'#000'
  }
});
