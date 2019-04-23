import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Button,
  View,
  AsyncStorage
} from 'react-native';
import Forms from '../constants/Forms';

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: 'Configurações',
  };

  constructor(props) {
    super(props);
    this.state = { 
      id: ''
    };
  }

  componentWillMount(){
    
    this._retrieveData();
  }

  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('id');
      if (value !== null) {
        this.setState({id:value});
      }
    } catch (error) {
      // Error retrieving data
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <TextInput
            style={Forms.inputBase}
            onChangeText={(id) => this.setState({id:id})}
            value={this.state.id}
            placeholder="DIGITE SEU ID"
          />
          <Button
            onPress={() => {
              try {
                AsyncStorage.setItem('id', this.state.id);
                alert('Salvo com sucesso!');
              } catch (error) {
                // Error saving data
              }
            }}
            title="Salvar ID"
            color="#000"
          />
          <View
          style={{
            marginTop:10
          }}></View>
          <Button
            style={{
              marginTop:10
            }}
            onPress={() => {
              try {
                AsyncStorage.setItem('encomendas', '');
                alert('Banco de dados limpo');
              } catch (error) {
                // Error saving data
              }
            }}
            title="LIMPAR BANCO DE DADOS"
            color="#000"
          />
        </ScrollView>
      </View>
    );
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
