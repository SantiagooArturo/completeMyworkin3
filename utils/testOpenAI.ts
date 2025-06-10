// Test script para verificar OpenAI API
const testOpenAI = async () => {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  console.log('🔑 Testing OpenAI API...');
  console.log('🔑 API Key exists:', apiKey ? 'YES' : 'NO');
  console.log('🔑 API Key preview:', apiKey ? `${apiKey.substring(0, 7)}...` : 'UNDEFINED');
  
  if (!apiKey) {
    console.error('❌ No API key found');
    return;
  }

  try {
    // Test con un simple chat completion
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Say "API working"' }],
        max_tokens: 10
      })
    });

    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ OpenAI API is working!');
      console.log('✅ Response:', data.choices[0].message.content);
    } else {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

// Ejecutar test si estamos en el browser
if (typeof window !== 'undefined') {
  console.log('🧪 Test function ready. Call testOpenAI() in console.');
  (window as any).testOpenAI = testOpenAI;
}

export { testOpenAI };
