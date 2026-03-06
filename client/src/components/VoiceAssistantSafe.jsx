import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './VoiceAssistant.css';

const VoiceAssistantSafe = ({ availableFields = [], fieldOptions = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [optionButtons, setOptionButtons] = useState(null);
  const [hasIntroduced, setHasIntroduced] = useState(false);
  const [animatingField, setAnimatingField] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const messagesEndRef = useRef(null);
  const isMountedRef = useRef(true);

  // Simple speech recognition check
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      console.log('Speech recognition supported');
    } else {
      console.log('Speech recognition not supported');
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [response, optionButtons]);

  useEffect(() => {
    if (animatingField) {
      const element = document.getElementById(animatingField);
      if (element) {
        element.classList.add('field-animation');
        
        // Create visual feedback immediately
        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'scale(1.1)';
        element.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.8)';
        
        // Create floating particles
        createFloatingParticles(element);
        
        setTimeout(() => {
          element.style.transform = 'scale(1)';
          element.style.boxShadow = '';
          element.classList.remove('field-animation');
          setAnimatingField(null);
        }, 2000);
      }
    }
  }, [animatingField]);

  useEffect(() => {
    if (isOpen && !hasIntroduced) {
      const welcomeMessage = "Hello! I am AgriAi, your intelligent farming assistant. I can help you fill forms and answer questions. How can I assist you today?";
      setResponse(`🤖 ${welcomeMessage}`);
      setHasIntroduced(true);
    }
  }, [isOpen, hasIntroduced]);

  const createFloatingParticles = (element) => {
    try {
      const rect = element.getBoundingClientRect();
      const colors = ['#667eea', '#764ba2', '#f093fb', '#ffd700', '#00ff00'];
      
      for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.innerHTML = ['✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 4)];
        particle.style.position = 'fixed';
        particle.style.left = rect.left + rect.width / 2 + (Math.random() - 0.5) * rect.width + 'px';
        particle.style.top = rect.top + rect.height / 2 + 'px';
        particle.style.fontSize = '20px';
        particle.style.zIndex = '9999';
        particle.style.pointerEvents = 'none';
        particle.style.animation = `floatUp ${1.5 + Math.random()}s ease-out forwards`;
        particle.style.color = colors[Math.floor(Math.random() * colors.length)];
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, 3000);
      }
    } catch (err) {
      console.error('Particle creation error:', err);
    }
  };

  const updateFormField = useCallback((fieldName, value) => {
    try {
      console.log('=== FIELD UPDATE DEBUG ===');
      console.log('Updating field:', fieldName, 'with value:', value);
      
      // Try multiple selectors to find the element
      let element = document.getElementById(fieldName);
      
      if (!element) {
        // Try by name attribute
        element = document.querySelector(`[name="${fieldName}"]`);
      }
      
      if (!element) {
        console.error('Field not found:', fieldName);
        return false;
      }
      
      console.log('Found element:', element);
      console.log('Element type:', element.type);
      console.log('Element tagName:', element.tagName);
      console.log('Current value before update:', element.value);
      
      // Create unique animation for this specific field
      const animationKey = `${fieldName}_${Date.now()}`;
      setAnimatingField(animationKey);
      
      // Create floating particles for this specific field
      createFloatingParticles(element);
      
      // Update the field value with maximum React compatibility
      if (element.type === 'checkbox' || element.type === 'radio') {
        const checked = value === true || value === 'true' || value === '1';
        element.checked = checked;
        console.log('Set checkbox/radio to:', checked);
      } else if (element.tagName === 'SELECT') {
        // For select elements, find the option and set selectedIndex
        const options = element.options;
        let optionFound = false;
        
        console.log('Looking for value:', value, 'in', options.length, 'options');
        
        for (let i = 0; i < options.length; i++) {
          const optionValue = options[i].value;
          const optionText = options[i].text;
          
          console.log(`Checking option ${i}: value="${optionValue}", text="${optionText}"`);
          
          // Skip empty options
          if (!optionValue && !optionText) {
            console.log(`Skipping empty option ${i}`);
            continue;
          }
          
          // Enhanced matching: exact match, phonetic matching, contains, then partial (super smart)
          const valueMatch = optionValue === value || optionText === value;
          
          // Phonetic matching for common speech recognition errors
          const phoneticMatches = {
            'read': ['red'],
            'wheet': ['wheat'],
            'basmathi': ['basmati'],
            'raw rise': ['raw rice'],
            'wite': ['white'],
            'creem': ['cream'],
            'golden': ['gold'],
            'clay': ['clay-black', 'black'],
            'aluvial': ['alluvial'],
            'canal': ['canal'],
            'borewell': ['bore-well', 'bore well'],
            'rainfed': ['rain-fed', 'rain fed'],
            'drip': ['drip'],
            // Rice type intelligent mapping
            'basmati': ['raw rice'], // Basmati is a type of raw rice
            'traditional': ['raw rice'],
            'white rice': ['raw rice'],
            'brown': ['brown rice'],
            'parboiled': ['parboiled rice'],
            'sella': ['sella rice']
          };
          
          let phoneticMatch = false;
          if (phoneticMatches[value.toLowerCase()]) {
            const phoneticOptions = phoneticMatches[value.toLowerCase()];
            phoneticMatch = phoneticOptions.some(phonetic => 
              optionValue.toLowerCase() === phonetic || optionText.toLowerCase() === phonetic
            );
            if (phoneticMatch) {
              console.log(`Phonetic match: "${value}" -> "${optionValue}"`);
            }
          }
          
          const containsMatch = (optionValue.toLowerCase().includes(value.toLowerCase()) && optionValue.length > 2) || 
                             (optionText.toLowerCase().includes(value.toLowerCase()) && optionText.length > 2);
          const partialMatch = value.toLowerCase().includes(optionValue.toLowerCase()) || 
                              value.toLowerCase().includes(optionText.toLowerCase());
          
          // Only use partial match if it's not the empty option, the value is substantial, and it's a reasonable match
          const isValidPartial = partialMatch && 
                               optionValue && optionValue !== '' && 
                               value.length > 3 && // Only partial match if value is more than 3 chars
                               optionValue.length <= value.length + 2; // Option shouldn't be much shorter than value
          
          if (valueMatch || phoneticMatch || containsMatch || isValidPartial) {
            const matchType = valueMatch ? 'exact' : phoneticMatch ? 'phonetic' : containsMatch ? 'contains' : 'partial';
            console.log(`Found matching option at index ${i} using ${matchType} match`);
            console.log(`Match details: option="${optionValue}", value="${value}", lengths: option=${optionValue.length}, value=${value.length}`);
            
            if (phoneticMatch) {
              console.log(`🧠 Smart AI: Corrected "${value}" to "${optionValue}" based on phonetic similarity`);
            }
            
            element.selectedIndex = i;
            
            // Try to override React's internal state for select elements
            const reactInstance = element._reactInternals || element.__reactInternalInstance;
            if (reactInstance && reactInstance.memoizedProps) {
              reactInstance.memoizedProps.value = options[i].value;
            }
            
            optionFound = true;
            break;
          }
        }
        
        if (!optionFound) {
          console.error('No matching option found for value:', value);
          console.log('Available options:');
          
          // Smart fallback: find closest match using string similarity
          let closestMatch = null;
          let highestScore = 0;
          
          for (let i = 0; i < options.length; i++) {
            const optionValue = options[i].value;
            const optionText = options[i].text;
            
            if (optionValue && optionText) {
              console.log(`  ${i}: "${optionValue}" ("${optionText}")`);
              
              // Calculate similarity score
              const valueScore = calculateSimilarity(value.toLowerCase(), optionValue.toLowerCase());
              const textScore = calculateSimilarity(value.toLowerCase(), optionText.toLowerCase());
              const maxScore = Math.max(valueScore, textScore);
              
              if (maxScore > highestScore && maxScore > 0.3) { // 30% similarity threshold
                highestScore = maxScore;
                closestMatch = { index: i, value: optionValue, text: optionText, score: maxScore };
              }
            }
          }
          
          if (closestMatch) {
            console.log(`🧠 Smart AI: Using closest match "${closestMatch.value}" (similarity: ${(closestMatch.score * 100).toFixed(1)}%)`);
            element.selectedIndex = closestMatch.index;
            
            // Try to override React's internal state
            const reactInstance = element._reactInternals || element.__reactInternalInstance;
            if (reactInstance && reactInstance.memoizedProps) {
              reactInstance.memoizedProps.value = closestMatch.value;
            }
            
            optionFound = true;
          } else {
            console.log('No suitable match found');
          }
        }
      } else {
        // For input elements - handle date format conversion
        let finalValue = value;
        
        if (element.type === 'date') {
          // Convert DD-MM-YYYY to YYYY-MM-DD for HTML date inputs
          if (value.includes('-') && value.length === 10) {
            const parts = value.split('-');
            if (parts.length === 3) {
              const [day, month, year] = parts;
              finalValue = `${year}-${month}-${day}`;
              console.log(`Converted date from ${value} to ${finalValue}`);
            }
          }
        }
        
        // Force update using maximum React compatibility
        element.value = finalValue;
        element.setAttribute('value', finalValue);
        
        // Try to override React's internal state
        const reactInstance = element._reactInternals || element.__reactInternalInstance;
        if (reactInstance && reactInstance.memoizedProps) {
          reactInstance.memoizedProps.value = finalValue;
        }
        
        // Create React-compatible events
        const inputEvent = new Event('input', { bubbles: true });
        Object.defineProperty(inputEvent, 'target', { writable: false, value: element });
        element.dispatchEvent(inputEvent);
        
        console.log('Set input value to:', finalValue);
      }
      
      // Immediate verification
      const immediateValue = element.tagName === 'SELECT' ? element.options[element.selectedIndex]?.value : element.value;
      console.log('Immediate verification - New value:', immediateValue);
      
      // Force React to detect the change with aggressive approach
      setTimeout(() => {
        // Multiple event triggers
        const events = ['change', 'input', 'blur'];
        events.forEach(eventType => {
          const event = new Event(eventType, { bubbles: true });
          Object.defineProperty(event, 'target', { writable: false, value: element });
          element.dispatchEvent(event);
        });
        
        // Focus and blur cycle
        element.focus();
        setTimeout(() => {
          element.blur();
          console.log('Focus/blur cycle completed');
        }, 10);
      }, 50);
      
      // Aggressive verification and retry
      setTimeout(() => {
        const finalValue = element.tagName === 'SELECT' ? element.options[element.selectedIndex]?.value : element.value;
        console.log('Final verification - Field value:', finalValue);
        console.log('Expected value:', value);
        console.log('Match:', finalValue === value);
        
        // If still not matching, force update again
        if (finalValue !== value && element.tagName !== 'SELECT') {
          console.log('AGGRESSIVE RETRY - Forcing field update...');
          element.value = value;
          element.setAttribute('value', value);
          
          // Trigger all events again
          ['input', 'change', 'blur'].forEach(eventType => {
            const event = new Event(eventType, { bubbles: true });
            Object.defineProperty(event, 'target', { writable: false, value: element });
            element.dispatchEvent(event);
          });
        }
        
        // Final verification
        setTimeout(() => {
          const verifyValue = element.tagName === 'SELECT' ? element.options[element.selectedIndex]?.value : element.value;
          console.log('FINAL VERIFICATION - Field value:', verifyValue);
          console.log('Expected value:', value);
          console.log('FINAL MATCH:', verifyValue === value);
          
          if (verifyValue === value) {
            console.log('✅ FIELD UPDATE SUCCESSFUL!');
          } else {
            console.log('❌ FIELD UPDATE FAILED');
          }
        }, 100);
        
        // Clean up animation
        setTimeout(() => {
          setAnimatingField(null);
        }, 500);
      }, 200);
      
      return true;
    } catch (err) {
      console.error('Field update error:', err);
    }
    return false;
  }, []);

  // String similarity calculation for smart matching
  const calculateSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  // Levenshtein distance algorithm for string similarity
  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const speakResponse = useCallback((text) => {
    if (typeof text !== 'string' || !text) return;
    try {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('TTS error:', err);
    }
  }, []);

  const processCommand = useCallback(async (command) => {
    if (!isMountedRef.current) return;
    setIsProcessing(true);
    setError('');

    try {
      const lowerCommand = command.toLowerCase();
      
      // Enhanced field mapping with correct priority to avoid conflicts
      const fieldMappings = {
        // Priority fields first - more specific matches
        'rice type': 'riceType',
        'rice variety': 'variety', 
        'variety': 'variety',
        'rice category': 'category',
        'category': 'category',
        'price': 'price',
        'quantity': 'quantity',
        'location': 'location',
        'season': 'season',
        'sowing date': 'sowingDate',
        'sowing': 'sowingDate',
        'planting date': 'sowingDate',
        'planting': 'sowingDate',
        'harvest date': 'harvestDate',
        'harvest': 'harvestDate',
        // Cultivation details
        'soil type': 'soilType',
        'irrigation type': 'irrigationType',
        'seed source': 'seedSource',
        'fertilizer': 'fertilizer',
        'fertilizer quantity': 'fertilizerQty',
        'applications': 'applications',
        'last fertilizer date': 'lastFertilizerDate',
        'disease occurred': 'diseaseOccurred',
        // Quality parameters with phonetic matching
        'grain length': 'grainLength',
        'length': 'grainLength',
        'green length': 'grainLength', // TTS hears 'grain' as 'green'
        'grain lenght': 'grainLength',
        'grain langth': 'grainLength',
        'green langth': 'grainLength',
        'grain lengh': 'grainLength',
        'green lengh': 'grainLength',
        'grain': 'grainLength',
        'green': 'grainLength',
        'broken': 'broken',
        'moisture': 'moisture',
        'color': 'color',
        'foreign matter': 'foreignMatter',
        'foreign': 'foreignMatter',
        'damaged': 'damaged',
        'polishing': 'polishing',
        'aging': 'aging',
        // Common typos and variations - put these LAST to avoid conflicts
        'rise type': 'riceType',
        'rise': 'riceType',
        'ricetype': 'riceType',
        'rice types': 'riceType',
        'rise types': 'riceType',
        'rice varity': 'variety',
        'varity': 'variety',
        'varieties': 'variety',
        'catagory': 'category',
        'prize': 'price',
        'prise': 'price',
        'quantaty': 'quantity',
        'quantitiy': 'quantity',
        'locaton': 'location',
        'grainlength': 'grainLength',
        'greenlength': 'grainLength'
      };
      
      // Smart date parsing function with enhanced natural language support and proper format output
      const parseDate = (text) => {
        const datePatterns = [
          // MM/DD/YYYY, DD/MM/YYYY, MM-DD-YYYY, DD-MM-YYYY
          /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
          // Month DD, YYYY / Month DD YYYY
          /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:,|st|nd|rd|th)?\s+(\d{4})/i,
          // DD Month YYYY / DD Month YYYY
          /(\d{1,2})(?:,|st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})/i,
          // YYYY-MM-DD, YYYY/MM/DD
          /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/
        ];
        
        for (const pattern of datePatterns) {
          const match = text.match(pattern);
          if (match) {
            let day, month, year;
            
            // Handle different pattern formats
            if (pattern.source.includes('jan|feb|mar')) {
              // Month name patterns
              if (match[1].match(/\d+/)) {
                // DD Month YYYY format (e.g., "12 February 2019")
                day = match[1];
                month = match[2];
                year = match[3];
              } else {
                // Month DD YYYY format (e.g., "February 12, 2019")
                month = match[1];
                day = match[2];
                year = match[3];
              }
              
              // Convert month name to number - handle full names
              const monthLower = month.toLowerCase();
              const monthNames = {
                'jan': '01', 'january': '01',
                'feb': '02', 'february': '02',
                'mar': '03', 'march': '03',
                'apr': '04', 'april': '04',
                'may': '05',
                'jun': '06', 'june': '06',
                'jul': '07', 'july': '07',
                'aug': '08', 'august': '08',
                'sep': '09', 'sept': '09', 'september': '09',
                'oct': '10', 'october': '10',
                'nov': '11', 'november': '11',
                'dec': '12', 'december': '12'
              };
              month = monthNames[monthLower] || month;
            } else if (pattern.source.includes('\\d{4}') && pattern.source.indexOf('\\d{4}') === pattern.source.indexOf('(')) {
              // YYYY-MM-DD or YYYY/MM/DD format (starts with year)
              year = match[1];
              month = match[2];
              day = match[3];
            } else {
              // DD/MM/YYYY or MM/DD/YYYY format
              // Assume DD/MM/YYYY for Indian context
              day = match[1];
              month = match[2];
              year = match[3];
            }
            
            // Pad with zeros if needed
            day = day.padStart(2, '0');
            month = month.padStart(2, '0');
            
            // Return in DD-MM-YYYY format for display, but also provide HTML format
            const displayFormat = `${day}-${month}-${year}`;
            const htmlFormat = `${year}-${month}-${day}`;
            
            console.log(`Parsed date: ${text} -> ${displayFormat} (HTML: ${htmlFormat})`);
            
            // Return both formats
            return { display: displayFormat, html: htmlFormat };
          }
        }
        
        // Handle relative dates
        const today = new Date();
        const relativePatterns = [
          { pattern: /\btoday\b/i, days: 0 },
          { pattern: /\btomorrow\b/i, days: 1 },
          { pattern: /\byesterday\b/i, days: -1 },
          { pattern: /\bnext week\b/i, days: 7 },
          { pattern: /\blast week\b/i, days: -7 }
        ];
        
        for (const { pattern, days } of relativePatterns) {
          if (pattern.test(text)) {
            const targetDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
            const day = String(targetDate.getDate()).padStart(2, '0');
            const month = String(targetDate.getMonth() + 1).padStart(2, '0');
            const year = targetDate.getFullYear();
            
            const displayFormat = `${day}-${month}-${year}`;
            const htmlFormat = `${year}-${month}-${day}`;
            
            console.log(`Relative date: ${text} -> ${displayFormat} (HTML: ${htmlFormat})`);
            return { display: displayFormat, html: htmlFormat };
          }
        }
        
        return null;
      };
      
      // Smart value processing based on field type
      const processValue = (fieldName, value) => {
        const lowerFieldName = fieldName.toLowerCase();
        const lowerValue = value.toLowerCase();
        
        // Date fields
        if (lowerFieldName.includes('date') || lowerFieldName.includes('sowing') || lowerFieldName.includes('harvest') || lowerFieldName.includes('planting') || lowerFieldName.includes('fertilizer')) {
          const parsedDate = parseDate(value);
          if (parsedDate) {
            // Return HTML format for date fields
            return parsedDate.html || parsedDate;
          }
        }
        
        // Extract numeric values with units
        if (lowerFieldName.includes('price') || lowerFieldName.includes('quantity') || lowerFieldName.includes('length') || lowerFieldName.includes('broken') || lowerFieldName.includes('moisture') || lowerFieldName.includes('damaged') || lowerFieldName.includes('foreign matter') || lowerFieldName.includes('applications')) {
          // Extract number from values like "8mm", "500 rs", "10%", etc.
          const numMatch = value.match(/(\d+(?:\.\d+)?)/);
          if (numMatch) {
            return numMatch[1];
          }
        }
        
        // Rice type/variety - capitalize properly and handle partial matches
        if (lowerFieldName.includes('rice') || lowerFieldName.includes('variety') || lowerFieldName.includes('category')) {
          return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        }
        
        // Season mapping
        if (lowerFieldName.includes('season')) {
          const seasonMap = {
            'kharif': 'Kharif',
            'rabi': 'Rabi',
            'zaid': 'Zaid',
            'summer': 'Zaid',
            'winter': 'Rabi',
            'monsoon': 'Kharif'
          };
          return seasonMap[lowerValue] || value;
        }
        
        return value;
      };
      
      // Intelligent raw data interpretation
      const interpretRawData = (command) => {
        const lowerCommand = command.toLowerCase();
        const updates = [];
        
        // Look for rice types
        const riceTypes = ['basmati', 'raw rice', 'brown rice', 'jasmine', 'arborio', 'sella', 'golden', '1121', '1509', 'sugandha', 'sharbati'];
        for (const riceType of riceTypes) {
          if (lowerCommand.includes(riceType)) {
            updates.push({ field: 'riceType', value: processValue('rice type', riceType), fieldName: 'rice type' });
            break;
          }
        }
        
        // Look for varieties
        const varieties = ['1121', '1509', 'sugandha', 'sharbati', 'pusa', 'ir64', 'swarna', 'hmt'];
        for (const variety of varieties) {
          if (lowerCommand.includes(variety)) {
            updates.push({ field: 'variety', value: processValue('variety', variety), fieldName: 'variety' });
            break;
          }
        }
        
        // Look for prices (numbers with currency or context)
        const pricePatterns = [
          /rs?(\s*(\d+(?:\.\d+)?))\b/i,
          /₹?(\s*(\d+(?:\.\d+)?))\b/,
          /\$(\s*(\d+(?:\.\d+)?))\b/,
          /price\s*(\d+(?:\.\d+)?)/i,
          /cost\s*(\d+(?:\.\d+)?)/i,
          /(\d+(?:\.\d+)?)\s*(rupees?|rs|₹|dollars?)/i
        ];
        
        for (const pattern of pricePatterns) {
          const match = command.match(pattern);
          if (match) {
            const price = match[2] || match[1];
            updates.push({ field: 'price', value: processValue('price', price), fieldName: 'price' });
            break;
          }
        }
        
        // Look for quantities
        const qtyPatterns = [
          /(\d+)\s*(kg|kilogram|kgs|tons?|quintal)/i,
          /quantity\s*(\d+)/i,
          /(\d+)\s*(units?|pieces?|bags?)/i
        ];
        
        for (const pattern of qtyPatterns) {
          const match = command.match(pattern);
          if (match) {
            const qty = match[1];
            updates.push({ field: 'quantity', value: processValue('quantity', qty), fieldName: 'quantity' });
            break;
          }
        }
        
        // Look for seasons
        const seasons = ['kharif', 'rabi', 'zaid', 'summer', 'winter', 'monsoon'];
        for (const season of seasons) {
          if (lowerCommand.includes(season)) {
            updates.push({ field: 'season', value: processValue('season', season), fieldName: 'season' });
            break;
          }
        }
        
        // Look for dates with enhanced natural language
        const dateResult = parseDate(command);
        if (dateResult && dateResult.html) {
          const lowerCommand = command.toLowerCase();
          const dateValue = dateResult.html; // Use the HTML format yyyy-MM-dd
          
          // Check for harvest date mentions
          if (lowerCommand.includes('harvest') || lowerCommand.includes('harvesting')) {
            updates.push({ field: 'harvestDate', value: dateValue, fieldName: 'harvest date' });
          }
          // Check for sowing date mentions
          else if (lowerCommand.includes('sow') || lowerCommand.includes('sowing') || lowerCommand.includes('plant') || lowerCommand.includes('planting')) {
            updates.push({ field: 'sowingDate', value: dateValue, fieldName: 'sowing date' });
          }
          // If no specific context, try to determine from field availability
          else if (availableFields.includes('harvestDate')) {
            updates.push({ field: 'harvestDate', value: dateValue, fieldName: 'harvest date' });
          } else if (availableFields.includes('sowingDate')) {
            updates.push({ field: 'sowingDate', value: dateValue, fieldName: 'sowing date' });
          }
        }
        
        // Look for quality parameters and cultivation details with phonetic matching
        const qualityFields = [
          { keywords: ['grain length', 'length', 'green length', 'grain', 'green'], field: 'grainLength', name: 'grain length' },
          { keywords: ['broken'], field: 'broken', name: 'broken' },
          { keywords: ['moisture'], field: 'moisture', name: 'moisture' },
          { keywords: ['color'], field: 'color', name: 'color' },
          { keywords: ['foreign matter', 'foreign'], field: 'foreignMatter', name: 'foreign matter' },
          { keywords: ['damaged'], field: 'damaged', name: 'damaged' },
          { keywords: ['polishing'], field: 'polishing', name: 'polishing' },
          { keywords: ['aging'], field: 'aging', name: 'aging' },
          { keywords: ['soil type', 'soil'], field: 'soilType', name: 'soil type' },
          { keywords: ['irrigation type', 'irrigation'], field: 'irrigationType', name: 'irrigation type' },
          { keywords: ['seed source', 'seed'], field: 'seedSource', name: 'seed source' },
          { keywords: ['fertilizer'], field: 'fertilizer', name: 'fertilizer' },
          { keywords: ['fertilizer quantity'], field: 'fertilizerQty', name: 'fertilizer quantity' },
          { keywords: ['applications'], field: 'applications', name: 'applications' },
          { keywords: ['disease'], field: 'diseaseOccurred', name: 'disease occurred' }
        ];
        
        for (const fieldInfo of qualityFields) {
          for (const keyword of fieldInfo.keywords) {
            if (lowerCommand.includes(keyword)) {
              // Extract value after the keyword
              const regex = new RegExp(`${keyword}[^\d]*([\d.]+)`, 'i');
              const match = command.match(regex);
              if (match) {
                const value = match[1];
                console.log(`Raw data: Found ${fieldInfo.name} with value ${value} from keyword "${keyword}"`);
                updates.push({ field: fieldInfo.field, value: processValue(fieldInfo.name, value), fieldName: fieldInfo.name });
                break;
              }
            }
          }
        }
        
        return updates;
      };
      
      // Handle multi-field commands with enhanced debugging
      if (lowerCommand.includes('set') && (lowerCommand.includes('and') || lowerCommand.includes('also') || lowerCommand.includes('then'))) {
        console.log('=== MULTI-FIELD COMMAND DETECTED ===');
        console.log('Original command:', command);
        console.log('Lower command:', lowerCommand);
        
        const updates = [];
        
        // Parse multiple field updates with better splitting
        const parts = lowerCommand.split(/\b(and|also|then)\b/);
        console.log('Split into parts:', parts);
        
        for (let partIndex = 0; partIndex < parts.length; partIndex++) {
          const part = parts[partIndex];
          const trimmedPart = part.trim();
          console.log(`Processing part ${partIndex}: "${trimmedPart}"`);
          
          if (trimmedPart.includes('set') || trimmedPart.includes('to')) {
            // Extract field and value for each part
            let fieldFound = false;
            
            for (const [fieldName, fieldId] of Object.entries(fieldMappings)) {
              if (trimmedPart.includes(fieldName)) {
                console.log(`Found field "${fieldName}" -> "${fieldId}" in part: "${trimmedPart}"`);
                
                // Extract value after 'to' with more precise pattern matching
                const valuePatterns = [
                  /to\s+([^\s]+(?:\s+[^\s]+)*)/i,  // "to drip" or "to raw rice"
                  /set\s+[^\s]+\s+(?:to\s+)?([^\s]+(?:\s+[^\s]+)*)$/i,  // "set irrigation drip"
                  /([^\s]+(?:\s+[^\s]+)*)\s*$/i  // fallback
                ];
                
                let value = null;
                for (const pattern of valuePatterns) {
                  const match = trimmedPart.match(pattern);
                  if (match) {
                    value = match[1].replace(/[.,!?]/g, '').trim();
                    console.log(`Extracted value "${value}" using pattern`);
                    
                    // Clean up common speech artifacts and filler words
                    value = value.replace(/\b(bro|man|dude|yeah|yes|ok|okay|something|like|maybe|perhaps)\b/gi, '').trim();
                    
                    // Clean up multiple spaces
                    value = value.replace(/\s+/g, ' ').trim();
                    
                    // Ensure we have a substantial value (at least 2 characters)
                    if (value.length < 2) {
                      console.log(`Value "${value}" too short, skipping`);
                      value = null;
                      continue;
                    }
                    
                    if (value) {
                      console.log(`Cleaned value to "${value}"`);
                    }
                    break;
                  }
                }
                
                if (value && value !== fieldName) {
                  // Use smart value processing
                  const processedValue = processValue(fieldName, value);
                  console.log(`Processed value: "${value}" -> "${processedValue}"`);
                  
                  updates.push({ field: fieldId, value: processedValue, fieldName });
                  fieldFound = true;
                  break;
                }
              }
            }
            
            if (!fieldFound) {
              console.log(`No field found in part: "${trimmedPart}"`);
            }
          }
        }
        
        console.log(`Total updates parsed: ${updates.length}`);
        updates.forEach((update, index) => {
          console.log(`Update ${index + 1}: ${update.fieldName} (${update.field}) = "${update.value}"`);
        });
        
        if (updates.length > 0) {
          console.log('Processing', updates.length, 'multi-field updates:', updates);
          let successCount = 0;
          const responses = [];
          
          // Process each update individually with proper timing and smart feedback
          const smartCorrections = [];
          
          updates.forEach((update, index) => {
            setTimeout(() => {
              console.log(`=== Processing update ${index + 1}/${updates.length} ===`);
              console.log('Field:', update.field, 'Value:', update.value);
              
              const success = updateFormField(update.field, update.value);
              if (success) {
                successCount++;
                
                // Check if this was a smart correction
                const isSmartCorrection = update.value !== update.originalValue;
                if (isSmartCorrection) {
                  smartCorrections.push(`Smart: ${update.fieldName} "${update.originalValue}" → "${update.value}"`);
                  responses.push(`Set ${update.fieldName} to ${update.value} (smart correction)`);
                } else {
                  responses.push(`Set ${update.fieldName} to ${update.value}`);
                }
                
                console.log(`Update ${index + 1} successful`);
              } else {
                console.log(`Update ${index + 1} failed`);
              }
              
              // Only show response after all updates are done
              if (index === updates.length - 1) {
                setTimeout(() => {
                  console.log(`=== MULTI-FIELD COMPLETE: ${successCount}/${updates.length} successful ===`);
                  if (successCount > 0) {
                    let responseText = `✅ Updated ${successCount} field${successCount > 1 ? 's' : ''}: ${responses.join(', ')}`;
                    
                    // Add smart corrections summary if any
                    if (smartCorrections.length > 0) {
                      responseText += `\n🧠 Smart AI corrections: ${smartCorrections.join(', ')}`;
                    }
                    
                    setResponse(responseText);
                    speakResponse(`Updated ${successCount} field${successCount > 1 ? 's' : ''}`);
                  } else {
                    setResponse('❌ Failed to update fields. Please try again.');
                    speakResponse('Failed to update fields. Please try again.');
                  }
                }, 500);
              }
            }, index * 300); // Stagger updates by 300ms for better timing
          });
          
          return;
        } else {
          console.log('No valid updates found in multi-field command');
        }
      }
      
      // Intelligent raw data interpretation - try this before explicit commands
      if (!lowerCommand.includes('set') && !lowerCommand.includes('what') && !lowerCommand.includes('hello') && !lowerCommand.includes('who') && !lowerCommand.includes('model')) {
        const rawUpdates = interpretRawData(command);
        if (rawUpdates.length > 0) {
          let successCount = 0;
          const responses = [];
          
          for (const update of rawUpdates) {
            const success = updateFormField(update.field, update.value);
            if (success) {
              successCount++;
              responses.push(`Set ${update.fieldName} to ${update.value}`);
            }
          }
          
          if (successCount > 0) {
            const responseText = `🧠 Smart update: ${successCount} field${successCount > 1 ? 's' : ''} - ${responses.join(', ')}`;
            setResponse(responseText);
            speakResponse(responseText);
            return;
          }
        }
      }
      
      // Handle single field updates with better mapping
      for (const [fieldName, fieldId] of Object.entries(fieldMappings)) {
        if (lowerCommand.includes('set') && lowerCommand.includes(fieldName)) {
          const valueMatch = command.match(/to\s+([^\s]+(?:\s+[^\s]+)*)/i);
          if (valueMatch) {
            let value = valueMatch[1].replace(/[.,!?]/g, '');
            
            // Use smart value processing
            value = processValue(fieldName, value);
            
            const success = updateFormField(fieldId, value);
            if (success) {
              setResponse(`✅ Set ${fieldName} to ${value}`);
              speakResponse(`Set ${fieldName} to ${value}`);
              return;
            }
          }
        }
      }
      
      // Handle personality commands
      if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
        const introMessage = "Hello! I am AgriAi, your intelligent farming assistant. I can help you fill forms and answer questions. You can ask me to set multiple fields at once!";
        setResponse(`🤖 ${introMessage}`);
        speakResponse(introMessage);
        return;
      }
      
      if (lowerCommand.includes('what model')) {
        const modelResponse = "I am using the advanced shubhamos:305B model with multi-field command processing.";
        setResponse(`🤖 ${modelResponse}`);
        speakResponse(modelResponse);
        return;
      }
      
      if (lowerCommand.includes('who made you')) {
        const creatorResponse = "I was made by Shubham with enhanced multi-field capabilities.";
        setResponse(`🤖 ${creatorResponse}`);
        speakResponse(creatorResponse);
        return;
      }
      
      if (lowerCommand.includes('set location')) {
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

      // Fallback to AI processing
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
        speakResponse(aiResponse.message || `You can choose from: ${aiResponse.options.join(', ')}.`);
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
      console.error('Process command error:', err);
      setError('Failed to process. Please try again.');
      setResponse('❌ Sorry, I had trouble with that.');
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
        setTranscript('');
      }
    }
  }, [availableFields, fieldOptions, updateFormField, speakResponse]);

  const startSpeechRecognition = () => {
    try {
      if (!speechSupported) {
        setError('Voice recognition not supported. Please use Chrome or Edge.');
        return;
      }

      // Stop TTS immediately when mic button is pressed
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        console.log('Speech started');
        setIsListening(true);
        setTranscript('');
        setError('');
      };
      
      recognition.onresult = (event) => {
        console.log('Speech result:', event);
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        setIsListening(false);
        processCommand(transcript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech error:', event.error);
        let errorMsg = 'Speech recognition failed';
        
        if (event.error === 'not-allowed') {
          errorMsg = 'Please allow microphone access and try again.';
        } else if (event.error === 'no-speech') {
          errorMsg = 'No speech detected. Please try again.';
        } else if (event.error === 'audio-capture') {
          errorMsg = 'Microphone not available. Please check your microphone.';
        } else {
          errorMsg = `Error: ${event.error}`;
        }
        
        setError(errorMsg);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        console.log('Speech ended');
        setIsListening(false);
      };
      
      recognition.start();
      
    } catch (err) {
      console.error('Start speech error:', err);
      setError('Failed to start speech recognition. Please try again.');
      setIsListening(false);
    }
  };

  const handleTypedSubmit = (e) => {
    e?.preventDefault();
    const text = typedInput.trim();
    if (!text || isProcessing) return;
    setTranscript(text);
    setTypedInput('');
    setOptionButtons(null);
    processCommand(text);
  };

  const handleOptionPick = (field, value) => {
    const success = updateFormField(field, value);
    if (success) {
      setResponse(`✅ Set ${field} to ${value}`);
      speakResponse(`Set ${field} to ${value}.`);
      setOptionButtons(null);
    }
  };

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
                placeholder="Try: 'Can you please change the harvesting date to 12 february 2021' or 'Basmati rice 500 rs'"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                disabled={isProcessing}
              />
              <button type="submit" className="voice-send-btn" disabled={isProcessing || !typedInput.trim()}>
                Send
              </button>
            </form>

            <div className="voice-controls">
              {speechSupported && (
                <button
                  className={`mic-btn ${isListening ? 'active' : ''}`}
                  onClick={startSpeechRecognition}
                  disabled={isProcessing || isListening}
                >
                  {isListening ? '🔴 Listening...' : '🎤 Speak'}
                </button>
              )}
              {!speechSupported && (
                <div style={{ textAlign: 'center', padding: '10px' }}>
                  <small style={{ color: '#666', display: 'block' }}>
                    🎤 Voice recognition not supported
                  </small>
                  <small style={{ color: '#666', display: 'block' }}>
                    Please use Chrome or Edge browser
                  </small>
                </div>
              )}
            </div>

            <div className="voice-status">
              {isListening && '🎤 Listening... Speak now!'}
              {isProcessing && '⏳ Processing...'}
              {!isListening && !isProcessing && speechSupported && 'Ready - Click Speak to start'}
              {!isListening && !isProcessing && !speechSupported && 'Type commands above'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistantSafe;
