//Imports
import React, { use, useContext, useEffect, useRef , useState } from 'react';
import { StyleSheet, Text, Animated , View, Pressable , Image , TextInput , TouchableOpacity} from 'react-native';
import { GlobalContext } from '../GlobalContext';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_IP } from '@env';

//Components
import ClosePopUp from '../components/SvgComponents/Profile/ClosePopUp'
import Edit from '../components/SvgComponents/Profile/Edit'
import { FlatList } from 'react-native-gesture-handler';


export default function GroupProfile() {
    //Para controlar las animaciones
    const { OpengroupProfilePopUp, setOpengroupProfilePopUp } = useContext(GlobalContext);
    const horizontalAnim = useRef(new Animated.Value(0)).current;
    const buttonAnim = useRef(new Animated.Value(0)).current;
    const exitAnim = useRef(new Animated.Value(1)).current;

    const { CurrentGroup } = useContext(GlobalContext);
    const [groupInfo, setGroupInfo] = useState(null);
    const [usersInfo, setUsersInfo] = useState([]);
    const [invitedUser, setInvitedUser] = useState('');
    //Para cerrar la sesión (Provisional)
    const { LoggedIn , setLoggedIn } = useContext(GlobalContext);


    //Use Effect para animar el popUp cuando se detecta que se abre o cierra
    useEffect(() => {
        Animated.timing(horizontalAnim, {
            toValue: OpengroupProfilePopUp ? 0 : -450, // Cambia la altura a 300 si OpenAddPopUp es true, de lo contrario a 0
            duration: 300,
            useNativeDriver: false,
        }).start();

        Animated.timing(buttonAnim, {
            toValue: OpengroupProfilePopUp ? 1 : 0,
            duration: OpengroupProfilePopUp ? 600 : 200,
            useNativeDriver: false,
        }).start();
    }, [OpengroupProfilePopUp]);

    const handlePressIn = (anim) => {
        Animated.spring(anim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = (anim) => {
        Animated.spring(anim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    // Obtener la información del grupo
    const getGroupInfo = async () => {
        try {
            const response = await axios.get(`${BACKEND_IP}/api/group/${CurrentGroup}`);
            console.log('Group Info:', response.data);
            setGroupInfo(response.data);
        } catch (error) {
            console.error('Error fetching the group info:', error);
        }
    };

    // Funcion para obtener un uuario a partir de su id

    const getUser = async (id) => {
        try {
            const response = await axios.get(`${BACKEND_IP}/api/user/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching the user:', error);
        }
    }

    // Funcion que a partir del vector de id de usuarios de un grupo, devuelve un vector con los usuarios
    const getUsers = async (users) => {
        let usersInfo = [];
        for (let i = 0; i < users.length; i++) {
            const user = await getUser(users[i]._id);
            usersInfo.push(user);
        }
        return usersInfo;
    }

    useEffect(() => {
        if (CurrentGroup) {
            console.log('CurrentGroup:', CurrentGroup);
            getGroupInfo();
        }
    }   , [CurrentGroup]);

    useEffect(() => {
        if (groupInfo) {
            getUsers(groupInfo.id_usuarios).then((users) => {
                console.log('Users:', users);
                setUsersInfo(users);
            });
        }
    }
    , [groupInfo]);

    // Funcion para invitar a un usuario a un grupo
    const inviteUser = async (Username) => {
        try {
            const userInfo = await AsyncStorage.getItem('userInfo');
            const userID = JSON.parse(userInfo)._id;
            const response = await axios.put(`${BACKEND_IP}/api/group/invite/${Username}`, {
                id_admin: userID,
                id_group: CurrentGroup,
            });
            console.log('User invited:', response.data);
        } catch (error) {
            console.error('Error inviting user:', error);
        }
    };

    return (
        <Animated.View style={[styles.container, { left: horizontalAnim }]}>
            {groupInfo ? <Text style={styles.header}>{groupInfo.nombre}</Text> : <Text style={styles.text}>Group...</Text>}
            {groupInfo ? <Text style={styles.description}>{groupInfo.descripcion}</Text> : <Text style={styles.text}>Description...</Text>}
            <View style={styles.userList}>
                <FlatList
                    data={usersInfo ? usersInfo : []}
                    renderItem={({ item }) => (
                        <View>
                            <Text>{item.nombre_usuario}</Text>
                        </View>
                    )}
                />
            </View>
            <TextInput
                placeholder="Username"
                style={styles.input}
                value={invitedUser}
                onChangeText={setInvitedUser}
            />
            <TouchableOpacity style={styles.logoutButton} onPress={inviteUser}>
                <Text style={styles.buttonText}>Invite user</Text>
            </TouchableOpacity>
            <Animated.View style={[styles.exitContainer, { opacity: buttonAnim }]}>
                <Pressable
                    style={styles.exitButton}
                    onPress={() => setOpengroupProfilePopUp(!OpengroupProfilePopUp)}
                    onPressIn={() => handlePressIn(exitAnim)}
                    onPressOut={() => handlePressOut(exitAnim)}
                >
                    <Animated.View style={{ transform: [{ scale: exitAnim }] }}>
                        <ClosePopUp />
                    </Animated.View>
                </Pressable>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#B5C18E',
        alignItems: 'center',
        justifyContent: 'start',
        paddingTop: 40,
        zIndex: 4,
    },
    input: {
        width: '80%',
        height: 40,
        margin: 12,
        borderBottomWidth: 2,
        borderColor: '#B5C18E',
        fontSize: 17,
    },
    userList: {
        width: '80%',
        height: 100,
    },
    exitContainer: {
        position: 'absolute',
        top: 60,
        right: 20,
        transform: [{ translateY: -30 }],
        width: '15%',
    },
    exitButton: {
        backgroundColor: '#B4A593',
        padding: 10,
        borderRadius: 10,
        margin: 5,
        height: 50,
        justifyContent: 'center',
    },
    editButton: {
        height: 30,
        transform: [{ translateX: 75 }, { translateY: -25 }],
        justifyContent: 'center',
    },
    logoutButton: {
        backgroundColor: '#B4A593',
        padding: 10,
        borderRadius: 10,
        justifyContent: 'center',
    },
    header: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 30,
        textAlign: 'center',
    },
    description: {
        color: '#FFFFFF',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#FFFFFF',
        marginTop: 20,
    },
});


