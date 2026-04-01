import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc,
  getDocs,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../components/AuthContext';
import { Message, UserProfile, ChatRoom } from '../types';
import { Send, ArrowLeft, Loader2, User, Phone, MessageSquare } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function Chat() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatRooms, setChatRooms] = useState<(ChatRoom & { otherUser?: UserProfile })[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<UserProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    // Fetch chat rooms
    const q = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageTimestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatRoom));
      
      const roomsWithUsers = await Promise.all(rooms.map(async (room) => {
        const otherUserId = room.participants.find(id => id !== user.uid);
        if (otherUserId) {
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          return { ...room, otherUser: { id: userDoc.id, ...userDoc.data() } as UserProfile };
        }
        return room;
      }));

      setChatRooms(roomsWithUsers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!roomId || !user) return;

    const q = query(
      collection(db, 'chatRooms', roomId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    });

    // Fetch active chat user info
    const fetchActiveUser = async () => {
      const roomDoc = await getDoc(doc(db, 'chatRooms', roomId));
      if (roomDoc.exists()) {
        const roomData = roomDoc.data() as ChatRoom;
        const otherUserId = roomData.participants.find(id => id !== user.uid);
        if (otherUserId) {
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          setActiveChat({ id: userDoc.id, ...userDoc.data() } as UserProfile);
        }
      }
    };
    fetchActiveUser();

    return () => unsubscribe();
  }, [roomId, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId || !user) return;

    try {
      const messageData = {
        senderId: user.uid,
        message: newMessage,
        timestamp: new Date().toISOString(),
      };

      await addDoc(collection(db, 'chatRooms', roomId, 'messages'), messageData);
      
      // Update chat room last message
      await addDoc(collection(db, 'chatRooms', roomId), {
        lastMessage: newMessage,
        lastMessageTimestamp: new Date().toISOString()
      });

      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Sidebar */}
      <div className={cn(
        "w-full md:w-80 border-r border-gray-50 dark:border-gray-800 flex flex-col",
        roomId ? "hidden md:flex" : "flex"
      )}>
        <div className="p-6 border-b border-gray-50 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
        </div>
        <div className="flex-grow overflow-y-auto">
          {chatRooms.length > 0 ? chatRooms.map((room) => (
            <button
              key={room.id}
              onClick={() => navigate(`/chat/${room.id}`)}
              className={cn(
                "w-full p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800 text-left",
                roomId === room.id && "bg-blue-50 dark:bg-blue-900/20"
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${room.otherUser?.name}`} 
                  alt={room.otherUser?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">{room.otherUser?.name}</h3>
                  {room.lastMessageTimestamp && (
                    <span className="text-[10px] text-gray-400">{format(new Date(room.lastMessageTimestamp), 'HH:mm')}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">{room.lastMessage || "No messages yet"}</p>
              </div>
            </button>
          )) : (
            <div className="p-10 text-center text-gray-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-4 opacity-20" />
              <p className="text-sm">No conversations yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={cn(
        "flex-grow flex flex-col",
        !roomId ? "hidden md:flex items-center justify-center text-gray-400" : "flex"
      )}>
        {roomId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => navigate('/chat')} className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChat?.name}`} 
                    alt={activeChat?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{activeChat?.name}</h3>
                  <span className="text-xs text-green-500 font-medium">Online</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="p-2 rounded-full">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 rounded-full">
                  <User className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    msg.senderId === user?.uid ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-2xl text-sm",
                    msg.senderId === user?.uid 
                      ? "bg-blue-600 text-white rounded-tr-none" 
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none"
                  )}>
                    {msg.message}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1">
                    {format(new Date(msg.timestamp), 'HH:mm')}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-50 dark:border-gray-800 flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-grow h-12 rounded-xl"
              />
              <Button type="submit" className="h-12 w-12 rounded-xl p-0 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
              <MessageSquare className="w-10 h-10 opacity-20" />
            </div>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
