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
  Text
} from 'react-native';
import { Camera, Permissions } from 'expo';
import Forms from '../constants/Forms';

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Datacerta'
  };

  constructor(props) {
    super(props);
    this.state = { 
      nota: '',
      userId: '',
      status: '',
      statusLista: [],
      baixaLista:[],
      gravar: false
    };
  }

  componentWillMount(){
    if(this.props.navigation.getParam('nota', '') != ''){
      let nota = {nota: this.props.navigation.getParam('nota', '')};
      this.setState(nota);
    }

    this.getStatus();
    this.getUserId();
    this.getBaixa();
    
  }

  getUserId = async () => {
    let userId = '';
    try {
      userId = await AsyncStorage.getItem('id') || 'none';
      console.log(userId);
    } catch (error) {
      // Error retrieving data
      console.log(error.message);
    }
    this.setState({userId:userId});
  }

  getStatus() {
    axios.get('http://34.200.50.59/mobidataapi/status.php')
    .then(response => this.setState({statusLista:response.data}))
    .catch(function (error) {
      // handle error
      console.log(error);
    })
  }

  getBaixa() {
    axios.get('http://34.200.50.59/mobidataapi/baixa.php', {
      params: {
        id: 784
      }
    })
    .then(response => console.log(response.data))
    .catch(function (error) {
      // handle error
      console.log(error);
    })
  }

  gravarEncomenda(){
    if(this.state.nota == ''){
      Alert.alert('Preencha o número da nota');
      return;
    }
    if(this.state.status == '0'){
      Alert.alert('Selecione um status');
      return;
    }

    this.setState({gravar:true});
  }

  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
  }

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  snap = async () => {
    console.log('camera');
    if (this.camera) {
      options = { quality: 0.1 };
      let photo = await this.camera.takePictureAsync(options);

      formData = new FormData();
      formData.append('nota', this.state.nota);
      formData.append('status', this.state.status);
      formData.append('foto', {
        uri: photo.uri,
        name: `photo.${photo.uri.split('.').pop()}`,
        type: `image/${photo.uri.split('.').pop()}`
      });

      axios({
        method: 'POST',
        url: 'http://34.200.50.59/mobidataapi/baixa.php',
        data: formData,
        config: { headers: {'Content-Type': 'multipart/form-data' }}
      })
      .then(response => console.log(response.data))
      .catch(function (error) {
        // handle error
        console.log(error);
      })
    }
  }

  render() {

    const { hasCameraPermission } = this.state;

    if(this.state.gravar){
      if (hasCameraPermission === null) {
        return <View />;
      } else if (hasCameraPermission === false) {
        return <Text>No access to camera</Text>;
      } else {
        return (
          <View style={{ flex: 1 }}>
            <Camera ref={ (ref) => {this.camera = ref} } style={{ flex: 1 }} type={this.state.type}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  flexDirection: 'row',
                }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    alignSelf: 'flex-end',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    this.setState({
                      type: this.state.type === Camera.Constants.Type.back
                        ? Camera.Constants.Type.front
                        : Camera.Constants.Type.back,
                    });
                  }}>
                  <Text
                    style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                    {' '}Flip{' '}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 2,
                    alignSelf: 'flex-end',
                    alignItems: 'center',
                  }}
                  onPress={this.snap}
                >
                  <Text
                    style={{ fontSize: 18, marginBottom: 10, color: "white" }}
                  >
                    Capture
                  </Text>
                </TouchableOpacity>
              </View>
            </Camera>
          </View>
        );
      }
    }else{
      return (
        <View style={styles.container}  contentContainerStyle={styles.contentContainer}>
          <TextInput
            style={Forms.inputBase}
            onChangeText={(nota) => this.setState({nota})}
            value={this.state.nota}
            placeholder="Número da Nota"
            keyboardType="numeric"
          />
          <Button
            onPress={() => this.props.navigation.navigate('Scanner')}
            title="Câmera"
            color="#841584"
          />
          <Picker
            style={Forms.inputBase}
            selectedValue={this.state.status}
            onValueChange={(itemValue, itemIndex) =>
              this.setState({status: itemValue})
            }>
            <Picker.Item label="Selecione" value="0" />
            {this.state.statusLista.map((i, index) => (
              <Picker.Item key={index} label={i['nome']} value={i['id']} />
            ))}
          </Picker>
          <Button
            onPress={() => this.gravarEncomenda()}
            title="Gravar"
            color="#000"
          />
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingTop: 30,
    paddingLeft:10,
    paddingRight:10
  }
});
