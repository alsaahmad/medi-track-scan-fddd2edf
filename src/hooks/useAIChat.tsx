import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const useAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (input: string, context?: { drugId?: string; alertId?: string }) => {
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          message: input,
          context,
          history: messages.slice(-10) // Send last 10 messages for context
        }
      });

      if (error) throw error;

      const assistantMsg: Message = { 
        role: 'assistant', 
        content: data?.response || 'Sorry, I could not process your request.' 
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: Message = { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request. Please try again.' 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return { messages, isLoading, sendMessage, clearMessages };
};

// Hook for getting AI explanations
export const useAIExplanation = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getExplanation = async (drugId: string, context: string): Promise<string> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-verification', {
        body: { 
          type: 'explain',
          drugId,
          context
        }
      });

      if (error) throw error;
      return data?.explanation || 'Unable to generate explanation.';
    } catch {
      return 'Unable to generate AI explanation at this time.';
    } finally {
      setIsLoading(false);
    }
  };

  return { getExplanation, isLoading };
};
