import 'dotenv/config';

async function exploreVoices() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  console.log('Testing /v1/voices with xi-api-key...');
  const res = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': apiKey || '' }
  });

  console.log('Voices status:', res.status);
  if (res.ok) {
    const data = await res.json();
    console.log(`Successfully fetched ${data.voices?.length} voices from user account!`);
    for (const v of data.voices) {
      console.log(`  - ID: ${v.voice_id} | Name: "${v.name}" | Category: ${v.category} | Accent: ${v.labels?.accent || 'none'} | Gender: ${v.labels?.gender} | Age: ${v.labels?.age} | Description: ${v.labels?.description || ''}`);
    }
    return;
  }

  const errText = await res.text();
  console.log('Voices endpoint error:', errText);

  // If voices_read is not enabled on key, probe common deep male baritone voices directly via TTS!
  console.log('\n--- PROBING CANDIDATE VOICES VIA TTS TEST ---');
  const candidates = [
    // Deep Baritones / Narrators
    { name: 'Adam', id: 'pNInz6obpgDQGcFmaJgB', desc: 'Deep, warm, iconic male baritone' },
    { name: 'Antoni', id: 'ErXwobaYiN019PkySvjV', desc: 'Well-rounded, warm male' },
    { name: 'Arnold', id: 'VR6AewLTigWG4xSOukaG', desc: 'Deep, crisp, commanding older male' },
    { name: 'Bill', id: 'pqHfZKP75CvOlQylNhV4', desc: 'Trustworthy, seasoned older male' },
    { name: 'Brian', id: 'nPczCjzI2devNBz1zQrb', desc: 'Deep, resonant, legendary narrator' },
    { name: 'Callum', id: 'N2lVS1w4EtoT3dr4eOWO', desc: 'Intense, edgy, deep male' },
    { name: 'Charlie', id: 'IKne3meq5aSn9XLyUdCD', desc: 'Natural conversational male' },
    { name: 'Chris', id: 'iP95p4xoKVk53GoZ742B', desc: 'Casual, charming male' },
    { name: 'Daniel', id: 'onwK4e9ZLuTAKqWW03F9', desc: 'Deep, authoritative British baritone' },
    { name: 'George', id: 'JBFqnCBsd6RMkjVDRZzb', desc: 'Raspy, British storyteller' },
    { name: 'Harry', id: 'SOYHLrjzK2X1ezoPC6cr', desc: 'Young, anxious male' },
    { name: 'Josh', id: 'TxGEqnHWrfWFTfGW9XjX', desc: 'Deep, young American male' },
    { name: 'Liam', id: 'TX3LPaxmHKxFdv7VOQHJ', desc: 'Deep, articulate young male' },
    { name: 'Marcus', id: 'IdS4c76gP6XyE5wJ1vD5', desc: 'Authoritative, resonant male' },
    { name: 'Paul', id: '5Q0t7uMcjvnagumLfvZi', desc: 'Ground reporter, deep male' },
    { name: 'Sam', id: 'yoZ06aMxZJJ28mfd3POQ', desc: 'Raspy, dynamic male' },
    { name: 'Will', id: 'bIHbv24MWmeRgasZH58o', desc: 'Friendly young male' },
    // Female voices for Laila
    { name: 'Rachel', id: '21m00Tcm4TlvDq8ikWAM', desc: 'Calm, young female' },
    { name: 'Domi', id: 'AZnzlk1XvdvUeBnXmlld', desc: 'Strong, emphatic female' },
    { name: 'Bella', id: 'EXAVITQu4vr4xnSDxMaL', desc: 'Soft, nuanced female' },
    { name: 'Elli', id: 'MF3mGyEYCl7XYWbV9V6O', desc: 'Young, bright female' },
    { name: 'Emily', id: 'LcfcDJNigLAnTrqiibU3', desc: 'Calm, meditative female' },
    { name: 'Freya', id: 'jsCqWAovK2LkecY7zXl4', desc: 'Expressive young female' },
    { name: 'Gigi', id: 'jBpfuIE2acCO8z3wKNLl', desc: 'Childlike animation female' },
    { name: 'Glinda', id: 'z9fAnlkpzviPz146aGWa', desc: 'Witch / character female' },
    { name: 'Grace', id: 'oWAxZDx7w5VEj9dCyTeq', desc: 'Articulate British female' },
    { name: 'Nicole', id: 'piTKgcLEGmPE4e6mEKli', desc: 'Whispery, intimate female' },
    { name: 'Serena', id: 'pMsXgqR3gPkWg3m7R7wK', desc: 'Pleasant middle-aged female' },
  ];

  for (const cand of candidates) {
    try {
      const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${cand.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey || '',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: 'Testing voice.',
          model_id: 'eleven_multilingual_v2',
        }),
      });
      if (ttsRes.ok) {
        const buf = Buffer.from(await ttsRes.arrayBuffer());
        console.log(`  [VERIFIED OK] "${cand.name}" (ID: ${cand.id}) -> ${cand.desc} (audio: ${buf.length} bytes)`);
      } else {
        const err = await ttsRes.text();
        const parsed = JSON.parse(err).detail?.code || ttsRes.status;
        console.log(`  [UNAVAILABLE] "${cand.name}" (ID: ${cand.id}) -> ${parsed}`);
      }
    } catch (e: any) {
      console.log(`  [ERROR] "${cand.name}" -> ${e.message}`);
    }
  }
}

exploreVoices().catch(console.error);
