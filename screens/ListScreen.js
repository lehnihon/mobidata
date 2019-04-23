import React from 'react';
import axios from 'axios';
import {
    StyleSheet,
    TextInput,
    Button,
    View,
    Platform,
    ToastAndroid,
    Text,
    FlatList,
    AsyncStorage,
    TouchableOpacity,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Forms from '../constants/Forms';

export default class ListScreen extends React.Component {
    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: 'Lista',
            headerRight: (
                <Ionicons onPress={() => navigation.navigate('Home')} style={{ marginRight: 10 }} name={Platform.OS === 'ios' ? 'ios-arrow-back' : 'md-arrow-back'} size={32} />
            )
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            lista: '',
            listaEncomendas: [],
            encomendas: [],
            latitude: '',
            longitude: '',
            error: ''
        };
    }

    componentWillMount() {
        this.getGeo()
    }

    getStorage = async() => {
        encomendas = JSON.parse(await AsyncStorage.getItem('encomendas'));
        this.setState({ encomendas: encomendas })
        return Promise.resolve(1);
    }
    getGeo() {
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

    getEncomendas() {
        if(this.state.lista != ''){
        ToastAndroid.show('Carregando lista', ToastAndroid.SHORT);
        axios.get('http://34.200.50.59/mobidataapi/lista.php', {
            params: {
                lista: this.state.lista
            }
        })
        .then(response => {
            this.setState({ listaEncomendas: response.data })
            ToastAndroid.show('Lista carregada!', ToastAndroid.SHORT);
        })
        .catch(function (error) {
            ToastAndroid.show('Erro ao carregar!', ToastAndroid.SHORT);
        })
        }else{
            Alert.alert("Digite um número de lista!");
        }
    }

    gravarEntrega = async (nota) => {
        await this.getStorage()
        data = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();
        hora = new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds();
        encomendas = (this.state.encomendas == null) ? [] : [...this.state.encomendas];
        
        encomendas.unshift({
            nota: nota,
            data: data,
            hora: hora,
            status: {id:'9'},
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            foto: {
                uri: '',
                name: '',
                type: ''
            }
        });
        AsyncStorage.setItem('encomendas', JSON.stringify(encomendas));
   
        ToastAndroid.show('Nota '+nota+' Entregue', ToastAndroid.SHORT);
    }

    mostrarEncomendas() {
        return <View style={styles.container}>
            <FlatList
                data={this.state.listaEncomendas}
                renderItem={({ item }) =>
                    <View>
                        <View style={{ flexDirection: 'row', paddingLeft: 10 }}>
                            <View style={{ flex: 3, paddingTop: 10, paddingBottom: 10 }}>
                                <Text>{item.idexterno}</Text>
                            </View>
                            <TouchableOpacity style={{ flex: 1, alignItems: 'flex-end', paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 10 }} onPress={() => this.gravarEntrega(item.idexterno)}>
                                <Ionicons name={Platform.OS === 'ios' ? 'ios-cloud-download' : 'md-cloud-download'} size={22} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: 'row', paddingBottom: 10, paddingLeft: 10, paddingRight: 10 }}>
                            <View style={{ flex: 4 }}>
                                <Text>{item.nomeentrega}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', paddingBottom: 10, paddingLeft: 10, paddingRight: 10 }}>
                            <View style={{ flex: 4 }}>
                                <Text>{item.enderecoentrega}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', paddingBottom: 10, paddingLeft: 10, paddingRight: 10, borderBottomWidth: 1, borderBottomColor: '#000' }}>
                            <View style={{ flex: 4 }}>
                                <Text>{(item.movimento === null)?'Sem movimentação':item.movimento}</Text>
                            </View>
                        </View>
                    </View>}
                keyExtractor={(item, index) => index.toString()}
            />
        </View>
    }

    render() {
        return (
            <View contentContainerStyle={styles.contentContainer}>
                <View style={{ flexDirection: 'row', paddingTop: 10, paddingBottom: 5 }}>
                    <View style={{ flex: 1 }}>
                        <TextInput
                            style={Forms.inputBase}
                            onChangeText={(lista) => this.setState({ lista })}
                            placeholder="Lista"
                            keyboardType="numeric"
                        />
                    </View>
                </View>
                <View style={{ flexDirection: 'row', paddingTop: 5, paddingBottom: 10 }}>

                    <View style={{ flex: 1 }}>
                        <Button
                            onPress={() => this.getEncomendas()}
                            title="BUSCAR ENCOMENDAS"
                            color="#000"
                        />
                    </View>
                </View>
                {this.mostrarEncomendas()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
    },
    item: {
        padding: 10,
        fontSize: 18,
        height: 44,
    },
    contentContainer: {
        paddingTop: 30,
        paddingLeft: 10,
        paddingRight: 10
    },
    viewStyle: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        alignContent: 'center'
    }
});
