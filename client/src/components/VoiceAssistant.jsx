import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSpeechRecognition } from 'react-speech-kit';
import axios from 'axios';
import './VoiceAssistant.css';

const SILENCE_MS = 1800;

const VoiceAssistant = ({ availableFields = [], fieldOptions = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [optionButtons, setOptionButtons] = useState(null); // { field, options }
  const [hasIntroduced, setHasIntroduced] = useState(false);
  const [animatingField, setAnimatingField] = useState(null);
  const [speechError, setSpeechError] = useState(null);
  const messagesEndRef = useRef(null);
  const lastTranscriptRef = useRef('');
  const silenceTimerRef = useRef(null);
  const isMountedRef = useRef(true);
  const currentUtteranceRef = useRef(null);

  // Check if speech recognition is supported
  const isSpeechRecognitionSupported = typeof window !== 'undefined' && 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  const onResult = useCallback((result) => {
    try {
      lastTranscriptRef.current = result || '';
      setTranscript(result || '');
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        silenceTimerRef.current = null;
        if (!lastTranscriptRef.current.trim()) return;
        stop();
        setIsListening(false);
        processCommandRef.current(lastTranscriptRef.current.trim());
      }, SILENCE_MS);
    } catch (err) {
      console.error('Speech recognition result error:', err);
      setSpeechError('Speech recognition error occurred');
    }
  }, []);

  const { listen, stop, supported } = useSpeechRecognition({
    onResult,
    onError: (err) => {
      console.error('Speech recognition error:', err);
      setSpeechError(err?.error || 'Speech recognition failed');
      if (err?.error === 'not-allowed') return;
      if (isMountedRef.current) {
        setError('Speech recognition error. Please try again.');
        setIsListening(false);
      }
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [response, optionButtons]);

  // Apply field animation when animatingField changes
  useEffect(() => {
    if (animatingField) {
      const element = document.getElementById(animatingField);
      if (element) {
        element.classList.add('field-animation');
        setTimeout(() => {
          element.classList.remove('field-animation');
        }, 1000);
      }
    }
  }, [animatingField]);

  // Show welcome message when first opened
  useEffect(() => {
    if (isOpen && !hasIntroduced) {
      const welcomeMessage = "Hello! I am AgriAi, your intelligent farming assistant. I can help you fill forms, answer questions, and manage your agricultural data using voice commands. How can I assist you today?";
      setResponse(`🤖 ${welcomeMessage}`);
      speakResponse(welcomeMessage);
      setHasIntroduced(true);
    }
  }, [isOpen, hasIntroduced, speakResponse]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  const updateFormField = useCallback((fieldName, value) => {
    const element = document.getElementById(fieldName);
    if (element) {
      // Add animation class to the field
      setAnimatingField(fieldName);
      setTimeout(() => setAnimatingField(null), 1000);
      
      if (element.type === 'checkbox' || element.type === 'radio') {
        element.checked = value === true || value === 'true';
      } else {
        element.value = value;
      }
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    return false;
  }, []);

  const speakResponse = useCallback((text) => {
    if (typeof text !== 'string' || !text) return;
    if ('speechSynthesis' in window) {
      // Stop any current speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      currentUtteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    }
  }, []);

  const processCommand = useCallback(async (command) => {
    if (!isMountedRef.current) return;
    setIsProcessing(true);
    setError('');
    // Don't clear option buttons when processing - keep them visible

    try {
      // Handle AI personality questions
      const lowerCommand = command.toLowerCase();
      
      if (lowerCommand.includes('hello') || lowerCommand.includes('hi') || lowerCommand.includes('hey')) {
        if (!hasIntroduced) {
          const introMessage = "Hello! I am AgriAi, your intelligent farming assistant. I can help you fill forms, answer questions, and manage your agricultural data using voice commands. How can I assist you today?";
          setResponse(`🤖 ${introMessage}`);
          speakResponse(introMessage);
          setHasIntroduced(true);
          return;
        }
      }
      
      if (lowerCommand.includes('what model') || lowerCommand.includes('which model') || lowerCommand.includes('model are you')) {
        const modelResponse = "I am using the advanced shubhamos:305B model, specifically optimized for agricultural intelligence and voice interactions.";
        setResponse(`🤖 ${modelResponse}`);
        speakResponse(modelResponse);
        return;
      }
      
      if (lowerCommand.includes('who made you') || lowerCommand.includes('who created you') || lowerCommand.includes('your creator')) {
        const creatorResponse = "I was made by Shubham, who designed me to help farmers and agricultural workers with intelligent voice assistance.";
        setResponse(`🤖 ${creatorResponse}`);
        speakResponse(creatorResponse);
        return;
      }
      
      if (lowerCommand.includes('set location') || lowerCommand.includes('farmer location')) {
        const success = updateFormField('location', 'Anand, India');
        if (success) {
          setResponse(`✅ Set farmer location to Anand, India`);
          speakResponse("Set farmer location to Anand, India");
        } else {
          setResponse(`❌ Could not find location field`);
          speakResponse("Could not find location field");
        }
        return;
      }

      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/ai/command',
        {
          message: command,
          availableFields: availableFields,
          fieldOptions: fieldOptions,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!isMountedRef.current) return;
      const aiResponse = res.data;

      if (aiResponse.action === 'update_field' && aiResponse.field && aiResponse.value !== undefined) {
        const success = updateFormField(aiResponse.field, String(aiResponse.value));
        if (success) {
          setResponse(`✅ Set ${aiResponse.field} to ${aiResponse.value}`);
          speakResponse(`Set ${aiResponse.field} to ${aiResponse.value}`);
        } else {
          setResponse(`❌ Could not find field: ${aiResponse.field}`);
          speakResponse(`Could not find field: ${aiResponse.field}`);
        }
      } else if (aiResponse.action === 'list_options' && aiResponse.field && Array.isArray(aiResponse.options)) {
        setResponse(aiResponse.message || `Choose an option for ${aiResponse.field}:`);
        setOptionButtons({ field: aiResponse.field, options: aiResponse.options });
        speakResponse(aiResponse.message || `You can choose from: ${aiResponse.options.join(', ')}. Tap one to select.`);
      } else if (aiResponse.action === 'error') {
        setResponse(`❌ ${aiResponse.message || 'Something went wrong.'}`);
        speakResponse(aiResponse.message || 'Something went wrong.');
      } else if (aiResponse.action === 'response') {
        setResponse(`🤖 ${aiResponse.message || ''}`);
        speakResponse(aiResponse.message || '');
      } else {
        const msg = aiResponse.message || JSON.stringify(aiResponse);
        setResponse(`🤖 ${msg}`);
        speakResponse(msg);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setError('Failed to process. Please try again.');
      setResponse('❌ Sorry, I had trouble with that.');
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
        setTranscript('');
      }
    }
  }, [availableFields, fieldOptions, updateFormField, speakResponse, hasIntroduced]);

  const processCommandRef = useRef(processCommand);
  processCommandRef.current = processCommand;

  const toggleListening = () => {
    try {
      if (isListening) {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        stop();
        setIsListening(false);
        const toProcess = lastTranscriptRef.current?.trim();
        if (toProcess) processCommand(toProcess);
      } else {
        // Stop TTS when starting mic
        if ('speechSynthesis' in window) {
          speechSynthesis.cancel();
        }
        
        setTranscript('');
        setError('');
        // Don't clear option buttons when starting mic
        lastTranscriptRef.current = '';
        listen({ continuous: true, lang: 'en-US', interimResults: true });
        setIsListening(true);
      }
    } catch (err) {
      console.error('Toggle listening error:', err);
      setError('Failed to toggle microphone. Please try again.');
      setSpeechError('Microphone access failed');
    }
  };

  const handleTypedSubmit = (e) => {
    try {
      e?.preventDefault();
      const text = typedInput.trim();
      if (!text || isProcessing) return;
      setTranscript(text);
      setTypedInput('');
      setOptionButtons(null);
      processCommand(text);
    } catch (err) {
      console.error('Typed submit error:', err);
      setError('Failed to process command. Please try again.');
    }
  };

  const handleOptionPick = (field, value) => {
    const success = updateFormField(field, value);
    if (success) {
      setResponse(`✅ Set ${field} to ${value}`);
      speakResponse(`Set ${field} to ${value}.`);
      setOptionButtons(null);
    }
  };

  if (!supported || !isSpeechRecognitionSupported) {
    return (
      <div className="voice-assistant-container">
        <button className="voice-assistant-btn" disabled>
          🎤 Voice Not Supported
        </button>
      </div>
    );
  }

  // If there's a speech error, show a simplified version
  if (speechError) {
    return (
      <div className="voice-assistant-container">
        <button
          className="voice-assistant-btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          🎤
        </button>
        {isOpen && (
          <div className="voice-assistant-panel">
            <div className="voice-assistant-header">
              <h3>🤖 AgriAi Assistant</h3>
              <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
            </div>
            <div className="voice-assistant-content">
              <div className="messages-container">
                <div className="message error">
                  <strong>Error</strong> Voice recognition is not available. You can still type commands below.
                </div>
              </div>
              <form className="voice-type-form" onSubmit={handleTypedSubmit}>
                <input
                  type="text"
                  className="voice-type-input"
                  placeholder="Type your command here..."
                  value={typedInput}
                  onChange={(e) => setTypedInput(e.target.value)}
                  disabled={isProcessing}
                />
                <button type="submit" className="voice-send-btn" disabled={isProcessing || !typedInput.trim()}>
                  Send
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="voice-assistant-container">
      <button
        className={`voice-assistant-btn ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isProcessing}
      >
        {isProcessing ? '⏳' : isListening ? '🔴' : '🎤'}
      </button>

      {isOpen && (
        <div className="voice-assistant-panel">
          <div className="voice-assistant-header">
            <h3>🤖 AgriAi Assistant</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="voice-assistant-content">
            <div className="messages-container">
              {transcript && (
                <div className="message user">
                  <strong>You</strong> {transcript}
                </div>
              )}
              {response && (
                <div className="message ai">
                  <strong>AI</strong> {response}
                </div>
              )}
              {optionButtons && (
                <div className="message options-message">
                  <div className="option-buttons">
                    {optionButtons.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className="option-btn"
                        onClick={() => handleOptionPick(optionButtons.field, opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {error && (
                <div className="message error">
                  <strong>Error</strong> {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="voice-type-form" onSubmit={handleTypedSubmit}>
              <input
                type="text"
                className="voice-type-input"
                placeholder="Ask or type a command (e.g. what options for rice type?)"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                disabled={isProcessing}
              />
              <button type="submit" className="voice-send-btn" disabled={isProcessing || !typedInput.trim()}>
                Send
              </button>
            </form>

            <div className="voice-controls">
              <button
                className={`mic-btn ${isListening ? 'active' : ''}`}
                onClick={toggleListening}
                disabled={isProcessing}
              >
                {isListening ? '🔴 Stop' : '🎤 Speak'}
              </button>
              {transcript && !isListening && (
                <button
                  className="retry-btn"
                  onClick={() => processCommand(transcript)}
                  disabled={isProcessing}
                >
                  🔄 Retry
                </button>
              )}
            </div>

            <div className="voice-status">
              {isListening && '🎤 Listening… (stops automatically when you pause)'}
              {isProcessing && '⏳ Processing…'}
              {!isListening && !isProcessing && 'Ready — type or speak'}
            </div>

            {availableFields.length > 0 && (
              <div className="available-fields">
                <small>Try: “What options do I have for rice type?” or “Set price to 500”</small>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
