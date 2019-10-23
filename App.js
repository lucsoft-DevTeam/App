import React from 'react'
import { Header } from 'react-native-elements'
import { Text, View, Button } from 'react-native'

export default function App () {
  return (
    <View>
      <Header
        centerComponent={{
          text: 'HomeSYS',
          style: { color: '#fff', fontWeight: 'bold', fontSize: 20 }
        }}
        leftComponent={<Button title='Menu'/>}
      />
      <Text>Lololo</Text>
    </View>
  )
}
