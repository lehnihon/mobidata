import { createStackNavigator } from 'react-navigation'; // Version can be specified in package.json
import CameraScreen from '../screens/CameraScreen';

export default createStackNavigator(
    {
        Camera: CameraScreen
    }
);