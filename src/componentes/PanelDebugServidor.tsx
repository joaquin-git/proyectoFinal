import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { serverConfig, SERVER_CONFIGS } from '../config/serverConfig';

export function PanelDebugServidor() {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    loadCurrentUrl();
  }, []);

  const loadCurrentUrl = async () => {
    const url = await serverConfig.getBaseUrl();
    setCurrentUrl(url);
  };

  const handleSelectConfig = async (configKey: string) => {
    const config = SERVER_CONFIGS[configKey as keyof typeof SERVER_CONFIGS];
    if (configKey === 'development_network') {
      Alert.alert(
        'Editar URL de Red Local',
        'Reemplaza 192.168.1.X con tu IP de red local',
        [
          {
            text: 'Cancelar',
            onPress: () => {},
            style: 'cancel'
          },
          {
            text: 'OK',
            onPress: async () => {
              if (customUrl.trim()) {
                await serverConfig.setBaseUrl(customUrl);
                setCurrentUrl(customUrl);
              }
            }
          }
        ]
      );
      setCustomUrl(config.url);
    } else {
      await serverConfig.setBaseUrl(config.url);
      setCurrentUrl(config.url);
      setTestResult('✅ URL actualizada');
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const isConnected = await serverConfig.testConnection(currentUrl);
      setTestResult(
        isConnected 
          ? '✅ Servidor accesible' 
          : '❌ Servidor no responde'
      );
    } catch (error) {
      setTestResult('❌ Error de conexión');
    } finally {
      setTesting(false);
    }
  };

  const handleResetDefault = async () => {
    await serverConfig.resetToDefault();
    const url = await serverConfig.getBaseUrl();
    setCurrentUrl(url);
    setTestResult('🔄 Reseteado a configuración default');
  };

  return (
    <ScrollView style={{ flex: 1, padding: 15, backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' }}>
        🔧 Panel de Debug - Configuración del Servidor
      </Text>

      <View style={{ backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15 }}>
        <Text style={{ fontSize: 12, color: '#999', marginBottom: 5 }}>URL Actual:</Text>
        <Text style={{ fontSize: 13, color: '#333', fontFamily: 'monospace', marginBottom: 10 }}>
          {currentUrl}
        </Text>
        
        {testResult && (
          <Text style={{ fontSize: 12, color: testResult.includes('✅') ? '#4CAF50' : '#f44336', marginBottom: 10 }}>
            {testResult}
          </Text>
        )}

        <TouchableOpacity
          onPress={handleTestConnection}
          disabled={testing}
          style={{
            backgroundColor: testing ? '#ccc' : '#2196F3',
            padding: 10,
            borderRadius: 5,
            alignItems: 'center',
            marginBottom: 10
          }}
        >
          {testing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>📡 Probar Conexión</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10, color: '#333' }}>
        Configuraciones Predefinidas:
      </Text>

      {Object.entries(SERVER_CONFIGS).map(([key, config]) => (
        <TouchableOpacity
          key={key}
          onPress={() => handleSelectConfig(key)}
          style={{
            backgroundColor: currentUrl === config.url ? '#E3F2FD' : '#fff',
            padding: 12,
            borderRadius: 8,
            marginBottom: 10,
            borderLeftWidth: 4,
            borderLeftColor: currentUrl === config.url ? '#2196F3' : '#ddd'
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#333', marginBottom: 3 }}>
            {config.name}
          </Text>
          <Text style={{ fontSize: 11, color: '#666', marginBottom: 5 }}>
            {config.url}
          </Text>
          <Text style={{ fontSize: 10, color: '#999' }}>
            {config.description}
          </Text>
        </TouchableOpacity>
      ))}

      <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10, marginTop: 15, color: '#333' }}>
        URL Personalizada:
      </Text>

      <View style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 15 }}>
        <TextInput
          placeholder="http://192.168.1.X:3000/api"
          value={customUrl}
          onChangeText={setCustomUrl}
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            padding: 10,
            borderRadius: 5,
            marginBottom: 10,
            fontFamily: 'monospace',
            fontSize: 11
          }}
        />
        <TouchableOpacity
          onPress={async () => {
            if (customUrl.trim()) {
              await serverConfig.setBaseUrl(customUrl);
              setCurrentUrl(customUrl);
              setTestResult('✅ URL personalizada guardada');
            } else {
              Alert.alert('Error', 'Ingresa una URL válida');
            }
          }}
          style={{
            backgroundColor: '#4CAF50',
            padding: 10,
            borderRadius: 5,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>💾 Guardar URL</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleResetDefault}
        style={{
          backgroundColor: '#ff9800',
          padding: 12,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 20
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>🔄 Reset a Default</Text>
      </TouchableOpacity>

      <View style={{ backgroundColor: '#FFF3CD', padding: 12, borderRadius: 8, marginBottom: 20 }}>
        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#856404', marginBottom: 8 }}>
          💡 Cómo encontrar tu IP local:
        </Text>
        <Text style={{ fontSize: 11, color: '#856404', lineHeight: 18 }}>
          1. En Windows: Abre CMD y ejecuta: ipconfig{"\n"}
          2. Busca "IPv4 Address" en tu red wifi{"\n"}
          3. Reemplaza 192.168.1.X con tu IP{"\n"}
          4. Asegúrate que el servidor backend está corriendo{"\n"}
          5. Prueba la conexión aquí arriba
        </Text>
      </View>
    </ScrollView>
  );
}
