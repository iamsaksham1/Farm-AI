import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

export default function AgriBotChat({ diagnosticResult, lang, t }) {
  const isHindi = lang === 'hi';
  const crop = diagnosticResult ? (isHindi ? diagnosticResult.crop_hi || diagnosticResult.crop : diagnosticResult.crop) : (isHindi ? 'फसल' : 'Crop');
  const disease = diagnosticResult ? (isHindi ? diagnosticResult.disease_name_hi || diagnosticResult.disease_name : diagnosticResult.disease_name) : (isHindi ? 'रोग' : 'Disease');

  const initialBotMessage = isHindi
    ? `नमस्ते। मैंने आपकी ${crop} में ${disease} की पहचान की है। आप मुझसे दवा की मात्रा, छिड़काव का समय, मौसम सावधानी या जैविक उपायों के बारे में पूछ सकते हैं।`
    : `AgriBot assistant active. Diagnosis confirmed: ${crop} (${disease}). You may ask for spray schedules, rain safety protocols, organic dilutions or prevention methods.`;

  const [messages, setMessages] = useState([
    { sender: 'bot', text: initialBotMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (diagnosticResult) {
      setMessages([
        { sender: 'bot', text: initialBotMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }
  }, [diagnosticResult, lang]);

  const generateAnswer = (query) => {
    const q = query.toLowerCase();
    const adv = diagnosticResult?.advisory || {};

    if (isHindi) {
      if (q.includes('नीम') || q.includes('जैविक') || q.includes('organic') || q.includes('देशी')) {
        return `जैविक उपचार: ${adv.organic_treatment_hi || adv.organic_treatment || 'नीम के तेल (5 मिली/लीटर) का 7-10 दिनों के अंतराल पर छिड़काव करें।'}`;
      }
      if (q.includes('बारिश') || q.includes('मौसम') || q.includes('rain') || q.includes('weather')) {
        return `मौसम सावधानी: छिड़काव के बाद 3-4 घंटे बारिश न हो। दवा में सिलिकॉन स्प्रेडर (0.5 मिली/लीटर) जरूर मिलाएं ताकि दवा पत्तों पर चिपक जाए।`;
      }
      if (q.includes('समय') || q.includes('time') || q.includes('कब')) {
        return `छिड़काव का सबसे सही समय सुबह 7 से 10 बजे या शाम 4 से 6 बजे का है। तेज धूप में छिड़काव न करें।`;
      }
      if (q.includes('खर्च') || q.includes('लागत') || q.includes('cost') || q.includes('रुपये')) {
        return `अनुमानित लागत: ${adv.cost_estimate_inr_hi || adv.cost_estimate_inr || '₹400 - ₹700 / एकड़'}।`;
      }
      return `सलाह: ${adv.organic_treatment_hi || adv.symptoms_hi || 'प्रभावित पत्तियों को हटाकर खेत की सफाई बनाए रखें।'}`;
    } else {
      if (q.includes('neem') || q.includes('organic') || q.includes('bio') || q.includes('natural')) {
        return `Organic control: ${adv.organic_treatment || 'Apply cold-pressed Neem Oil (5ml/L) emulsified with mild soap every 7-10 days.'}`;
      }
      if (q.includes('rain') || q.includes('weather') || q.includes('wash')) {
        return `Weather protocol: Ensure a 3-4 hour rain-free window after spraying. Add a non-ionic spreader (0.5ml/L) for rain-fastness.`;
      }
      if (q.includes('time') || q.includes('when') || q.includes('morning')) {
        return `Optimal spray timing: Early morning (7:00 AM - 10:00 AM) or late afternoon (4:30 PM - 6:30 PM) to avoid intense sunlight.`;
      }
      if (q.includes('cost') || q.includes('price') || q.includes('inr') || q.includes('budget')) {
        return `Estimated treatment cost: ${adv.cost_estimate_inr || '₹450 - ₹750 / acre'}.`;
      }
      return `Advisory note for ${crop}: ${adv.organic_treatment || adv.prevention || 'Sanitize tools and remove diseased leaves.'}`;
    }
  };

  const handleSend = (textToSend) => {
    const query = textToSend || input.trim();
    if (!query) return;

    const userMsg = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const answer = generateAnswer(query);
      const botMsg = {
        sender: 'bot',
        text: answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 400);
  };

  const suggestedQuestions = [t.botQ1, t.botQ2, t.botQ3, t.botQ4];

  return (
    <div className="mt-8 pt-6 border-t border-black/[0.08] dark:border-white/[0.08]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="label-meta block">{t.botTitle}</span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">{t.botSubtitle}</span>
        </div>
      </div>

      {/* Message Stream */}
      <div className="h-60 overflow-y-auto space-y-3 pr-2 mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] text-neutral-800 dark:text-neutral-200'
              }`}
            >
              <p>{msg.text}</p>
            </div>
            <span className="font-mono text-[10px] text-neutral-400 mt-1">
              {msg.time}
            </span>
          </div>
        ))}
        {isTyping && (
          <span className="font-mono text-[11px] text-neutral-400 italic">Thinking...</span>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 rounded-md border border-black/[0.08] dark:border-white/[0.08] hover:border-black/[0.2] dark:hover:border-white/[0.2] text-[11px] text-neutral-600 dark:text-neutral-400 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.botInputPlaceholder}
          className="flex-1 px-3.5 py-2 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-medium"
        >
          {t.botSend}
        </button>
      </form>
    </div>
  );
}
