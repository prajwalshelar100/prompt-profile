import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, useColorScheme } from 'react-native';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/themeStore';
import { Colors } from '../theme';
import { generateChatResponse } from '../services/aiService';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { Send } from 'lucide-react-native';

type Message = { id: string, role: 'system' | 'user' | 'assistant', content: string };

export default function AIChatScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'AIChat'>>();
  const { initialSystemPrompt, projectId } = route.params;

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'system', content: initialSystemPrompt || 'Context loaded.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<FlatList>(null);

  const themeMode = useThemeStore(state => state.theme);

  const systemColorScheme = useColorScheme();
  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;


  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    // Add user message to UI immediately
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: inputText.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);

    try {
      const responseText = await generateChatResponse(
        newMessages.map(m => ({ role: m.role, content: m.content }))
      );

      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: responseText };
      setMessages((prev: Message[]) => [...prev, assistantMsg]);
    } catch (e: any) {
      alert(e.message || 'Failed to communicate with AI');
    } finally {
      setIsTyping(false);
    }
  };

  const renderBubble = ({ item }: { item: Message }) => {
    if (item.role === 'system') {
      return (
        <View style={[styles.systemBubble, { backgroundColor: colors.overlay }]}>
          <Text style={[styles.systemBubbleText, { color: colors.subtext }]}>System Context Loaded.</Text>
        </View>
      );
    }

    const isUser = item.role === 'user';
    return (
      <View style={[styles.bubbleWrap, isUser ? styles.bubbleWrapUser : styles.bubbleWrapAI]}>
        <View style={[styles.bubble, isUser ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 } : { backgroundColor: colors.overlay, borderBottomLeftRadius: 4 }]}>
          <Text style={[styles.bubbleText, { color: isUser ? '#fff' : colors.text }]}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderBubble}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />
      
      {isTyping && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color={colors.subtext} />
          <Text style={[styles.typingText, { color: colors.subtext }]}>AI is typing...</Text>
        </View>
      )}

      <View style={[styles.inputArea, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TextInput
          style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
          placeholder="Ask something about your profile..."
          placeholderTextColor={colors.subtext}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity style={[styles.sendBtn, { backgroundColor: colors.primary }]} onPress={sendMessage} disabled={isTyping || !inputText.trim()}>
          <Send color="#fff" size={20} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  chatList: { padding: 16, paddingBottom: 30 },
  systemBubble: { alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 16 },
  systemBubbleText: { fontSize: 12, fontWeight: '600' },
  bubbleWrap: { marginVertical: 6, flexDirection: 'row' },
  bubbleWrapUser: { justifyContent: 'flex-end' },
  bubbleWrapAI: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '85%', padding: 14, borderRadius: 16 },
  userBubble: { borderBottomRightRadius: 4 },
  aiBubble: { borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  userBubbleText: { color: '#fff' },
  inputArea: { flexDirection: 'row', padding: 16, borderTopWidth: 1, alignItems: 'flex-end' },
  textInput: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontSize: 15, maxHeight: 120, minHeight: 44 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', padding: 10, paddingLeft: 20 },
  typingText: { fontSize: 13, marginLeft: 8 }
});
