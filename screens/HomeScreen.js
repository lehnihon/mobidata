import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Picker,
  TextInput,
  Button,
  View,
  AsyncStorage
} from 'react-native';
import Forms from '../constants/Forms';

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Datacerta',
  };

  constructor(props) {
    super(props);
    this.state = { 
      nota: '',
      id: '',
      status: ''
    };
  }

  componentWillMount(){
    if(this.props.navigation.getParam('nota', '') != ''){
      let nota = {nota: this.props.navigation.getParam('nota', '')};
      this.setState(nota);
    }
    this._getUserId();
  }

  _getUserId = async () => {
    let userId = '';
    try {
      userId = await AsyncStorage.getItem('id') || 'none';
    } catch (error) {
      // Error retrieving data
      console.log(error.message);
    }
    this.setState({id:userId});
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <TextInput
            style={Forms.inputBase}
            onChangeText={(nota) => this.setState({nota})}
            value={this.state.nota}
            placeholder="Número da Nota"
            keyboardType="numeric"
          />
          <Button
            onPress={() => this.props.navigation.navigate('Camera')}
            title="Câmera"
            color="#841584"
          />
          <Picker
            style={Forms.inputBase}
            selectedValue={this.state.status}
            onValueChange={(itemValue, itemIndex) =>
              this.setState({status: itemValue})
            }>
            <Picker.Item label="Java" value="java" />
            <Picker.Item label="JavaScript" value="js" />
          </Picker>
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
