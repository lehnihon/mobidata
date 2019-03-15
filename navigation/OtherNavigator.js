import { createStackNavigator } from 'react-navigation'; // Version can be specified in package.json
import CameraScreen from '../screens/CameraScreen';
import ScannerScreen from '../screens/ScannerScreen';

export default createStackNavigator(
    {
        Camera: CameraScreen,
        Scanner: ScannerScreen
    }
);