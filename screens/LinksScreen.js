import React from 'react';
import axios from 'axios';
import {
  StyleSheet,
  View,
  AsyncStorage,
  SectionList,
  Text
} from 'react-native';

export default class LinksScreen extends React.Component {
  static navigationOptions = {
    title: 'Histórico',
  };

  constructor(props) {
    super(props);
    this.state = { 
      userId: '',
      baixaLista:[]
    };
  }

  componentWillMount(){
    this.getUserId();
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
  }

  getBaixa() {
    axios.get('http://34.200.50.59/mobidataapi/baixa.php', {
      params: {
        id: this.state.userId
      }
    })
    .then(response => this.setState({baixaLista:response.data}))
    .catch(function (error) {
      // handle error
      console.log(error);
    })
  }

  render() {
    sections = []

    if(this.state.userId != '' && this.state.baixaLista.length == 0){
      this.getBaixa();
    }

    this.state.baixaLista.map((i, index) => {
      sections.push({title:i['nota'],data:[i['nomeentrega'],i['enderecoentrega'],i['motivo'],i['databaixa']]})
    })


    return (
      <View style={styles.container}>
      <SectionList
       sections={sections}
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
    backgroundColor : '#64B5F6',
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
