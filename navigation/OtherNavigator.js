import { createStackNavigator } from 'react-navigation'; // Version can be specified in package.json
import ListScreen from '../screens/ListScreen';

export default createStackNavigator(
    {
        List: ListScreen
    }
);