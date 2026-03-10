const Groq = require('groq-sdk');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

class AIService {
  // Score lead from 1 to 100 based on simple context
  static async scoreLead(leadData) {
    const prompt = `Analyze this sales lead and output ONLY a JSON object with a single "score" key (0 to 100) and a brief "reason" string:
      Name: ${leadData.name}
      Company: ${leadData.company}
      Status: ${leadData.status}
      Source: ${leadData.source}`;
      
    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        temperature: 0.1,
        response_format: { type: 'json_object' }
      });
      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Groq AI Scoring Error:', error);
      return { score: 50, reason: 'AI service unavailable' };
    }
  }

  // Generate an outreach email
  static async generateEmail(leadData, context) {
    const prompt = `You are an expert sales representative. Write a short, highly personalized follow-up email to this prospect.
      Prospect: ${leadData.name} at ${leadData.company}
      Context: ${context}
      
      Keep it under 100 words, friendly but professional. Do not include placeholders like [Your Name]. Output ONLY the email body.`;
      
    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
      });
      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('Groq AI Email Error:', error);
      return 'Sorry, AI email generation failed at this moment.';
    }
  }

  static async getNextBestAction(leadData) {
    const prompt = `What is the single best next sales action for this lead?
      Name: ${leadData.name}
      Company: ${leadData.company}
      Status: ${leadData.status}. 
      Keep response under 15 words.`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        temperature: 0.3,
      });
      return completion.choices[0].message.content.trim();
    } catch (error) {
       return 'Follow up in 2 days.';
    }
  }
}

module.exports = AIService;
