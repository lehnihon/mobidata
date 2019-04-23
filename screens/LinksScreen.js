import React from 'react';
import axios from 'axios';
import {
  StyleSheet,
  View,
  AsyncStorage,
  SectionList,
  Text,
  ToastAndroid
} from 'react-native';

export default class LinksScreen extends React.Component {
  static navigationOptions = ({ navigation }) => { 
    return {
      headerTitle: 'Histórico'
  }}

  constructor(props) {
    super(props);
    this.state = { 
      userId: '',
      baixaLista:[],
      sections:[]
    };
  }

  componentWillMount(){
    this.getEncomendas();
  }

  getEncomendas = async() =>{
    await this.getUserId();

    if(this.state.userId != 'none'){
      ToastAndroid.show('Carregando histórico!', ToastAndroid.SHORT);
      axios.get('http://34.200.50.59/mobidataapi/baixa.php', {
        params: {
          id: this.state.userId
        }
      })
      .then(response => {
        ToastAndroid.show('Histórico carregado!', ToastAndroid.SHORT);
        this.setState({baixaLista:response.data})
        sections = [...this.state.sections];
        this.state.baixaLista.map((i, index) => {
          sections.push({title:i['nota'],data:[i['nomeentrega'],i['enderecoentrega'],i['motivo'],i['databaixa']]})
        })
        this.setState({sections:sections})
      })
      .catch(function (error) {
        // handle error
        ToastAndroid.show('Erro ao carregar!', ToastAndroid.SHORT);
      })   
    }
  }

  getUserId = async () => {
    let userId = '';
    try {
      userId = await AsyncStorage.getItem('id') || 'none';
      this.setState({userId:userId});
    } catch (error) {
      // Error retrieving data
      console.log(error.message);
    }
    return Promise.resolve(1);
  }

  getBaixa =  async() => {
    
  }

  render() {

    return (
      <View style={styles.container}>
      <SectionList
       sections={this.state.sections}
       renderSectionHeader={ ({section}) => <Text style={styles.SectionHeader}> { section.title } </Text> }
       renderItem={ ({item}) => <Text style={styles.SectionListItemS} > { item } </Text> }
       keyExtractor={ (item, index) => index }
     />
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
  },
  SectionHeader:{
    backgroundColor : '#000',
    fontSize : 20,
    padding: 5,
    color: '#fff',
    fontWeight: 'bold'
 },
  SectionListItemS:{
    fontSize : 16,
    padding: 6,
    color: '#000',
    backgroundColor : '#F5F5F5'
  }
});
