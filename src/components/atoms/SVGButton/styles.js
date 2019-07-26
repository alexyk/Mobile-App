import { StyleSheet } from 'react-native';
import {commonComponents} from "../../../common.styles"

const styles = StyleSheet.create({
    container: {
        ...commonComponents.backButton
    },
    image: {
        height: 30,
        width: 30,
    }
});

export default styles;
